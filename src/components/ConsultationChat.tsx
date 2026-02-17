import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Mic, MicOff, Download, Stethoscope, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import { jsPDF } from "jspdf";
import { toast } from "@/hooks/use-toast";

type Msg = { role: "user" | "assistant"; content: string };

interface ConsultationChatProps {
  open: boolean;
  onClose: () => void;
  patientName: string;
  mobileNumber: string;
  language: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-consultation`;

const ConsultationChat = ({ open, onClose, patientName, mobileNumber, language }: ConsultationChatProps) => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const initialized = useRef(false);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Send initial greeting when chat opens
  useEffect(() => {
    if (open && !initialized.current) {
      initialized.current = true;
      sendToAI([{ role: "user", content: `Hi, my name is ${patientName}. I need a health consultation.` }], true);
    }
  }, [open]);

  const streamChat = useCallback(async (allMessages: Msg[], onDelta: (t: string) => void, onDone: () => void) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: allMessages, language, patientName }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: "Failed" }));
      throw new Error(err.error || "Failed to start stream");
    }
    if (!resp.body) throw new Error("No response body");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });

      let nl: number;
      while ((nl = buf.indexOf("\n")) !== -1) {
        let line = buf.slice(0, nl);
        buf = buf.slice(nl + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (!line.startsWith("data: ")) continue;
        const json = line.slice(6).trim();
        if (json === "[DONE]") { onDone(); return; }
        try {
          const parsed = JSON.parse(json);
          const c = parsed.choices?.[0]?.delta?.content;
          if (c) onDelta(c);
        } catch { buf = line + "\n" + buf; break; }
      }
    }
    onDone();
  }, [language, patientName]);

  const sendToAI = async (msgs: Msg[], hideUserMsg = false) => {
    setIsLoading(true);
    let assistantSoFar = "";

    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat(msgs, upsert, () => setIsLoading(false));
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: input.trim() };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    sendToAI(newMsgs);
  };

  const toggleMic = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: "Not supported", description: "Speech recognition is not supported in this browser.", variant: "destructive" });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === "hindi" ? "hi-IN" : "en-US";
    recognition.interimResults = false;
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(prev => prev + transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("AI Health Consultation Report", 20, 20);
    doc.setFontSize(11);
    doc.text(`Patient: ${patientName}`, 20, 32);
    doc.text(`Mobile: ${mobileNumber}`, 20, 39);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 46);

    let y = 58;
    doc.setFontSize(10);
    messages.forEach(m => {
      const label = m.role === "user" ? "Patient" : "AI Assistant";
      const lines = doc.splitTextToSize(`${label}: ${m.content}`, 170);
      if (y + lines.length * 5 > 280) { doc.addPage(); y = 20; }
      doc.text(lines, 20, y);
      y += lines.length * 5 + 4;
    });

    doc.save(`consultation-${patientName.replace(/\s+/g, "-")}.pdf`);
  };

  const handleAnalyze = () => {
    const analyzeMsg: Msg = {
      role: "user",
      content: language === "hindi"
        ? "कृपया मेरे लक्षणों का विश्लेषण करें और एक सारांश दें।"
        : "Please analyze my symptoms and provide a summary with possible conditions and recommendations.",
    };
    const newMsgs = [...messages, analyzeMsg];
    setMessages(newMsgs);
    sendToAI(newMsgs);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative flex h-[85vh] w-full max-w-2xl flex-col rounded-2xl bg-background shadow-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">AI Health Consultation</h2>
            <p className="text-sm text-muted-foreground">{patientName} • {mobileNumber}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={downloadPDF} className="gap-1.5">
              <Download className="h-4 w-4" />
              Download as PDF
            </Button>
            <button onClick={onClose} className="rounded-full p-1.5 hover:bg-muted">
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.filter(m => !(m.role === "user" && messages.indexOf(m) === 0)).map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}>
                {m.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                ) : m.content}
              </div>
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="rounded-2xl bg-muted px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-border px-5 py-4 space-y-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleMic} className={isListening ? "text-destructive" : "text-muted-foreground"}>
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder={language === "hindi" ? "अपना संदेश लिखें..." : "Type your message..."}
              disabled={isLoading}
              className="flex-1"
            />
            <Button size="icon" onClick={handleSend} disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleAnalyze} disabled={isLoading || messages.length < 3}>
              <Stethoscope className="mr-2 h-4 w-4" />
              {language === "hindi" ? "विश्लेषण करें" : "Analyze & Save"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationChat;
