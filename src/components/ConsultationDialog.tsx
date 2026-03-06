import { Heart, Globe } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ConsultationChat from "@/components/ConsultationChat";
import { toast } from "@/hooks/use-toast";

interface ConsultationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ConsultationDialog = ({ open, onOpenChange }: ConsultationDialogProps) => {
  const [language, setLanguage] = useState("english");
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [chatOpen, setChatOpen] = useState(false);

  const isHindi = language === "hindi";

  const t = {
    title: isHindi ? "AI स्वास्थ्य परामर्श" : "AI Health Consultation",
    subtitle: isHindi ? "हमारे AI सहायक से प्रारंभिक स्वास्थ्य जानकारी प्राप्त करें" : "Get preliminary health insights from our AI assistant",
    langLabel: isHindi ? "पसंदीदा भाषा" : "Preferred Language",
    nameLabel: isHindi ? "पूरा नाम" : "Full Name",
    namePlaceholder: isHindi ? "अपना पूरा नाम दर्ज करें" : "Enter your full name",
    mobileLabel: isHindi ? "मोबाइल नंबर" : "Mobile Number",
    mobilePlaceholder: isHindi ? "10 अंकों का मोबाइल नंबर" : "10-digit mobile number",
    startBtn: isHindi ? "परामर्श शुरू करें" : "Start Consultation",
    disclaimer: isHindi ? "यह केवल सूचनात्मक उद्देश्यों के लिए है। चिकित्सा सलाह के लिए हमेशा एक वास्तविक डॉक्टर से परामर्श करें।" : "This is for informational purposes only. Always consult a real doctor for medical advice.",
    reqTitle: isHindi ? "आवश्यक" : "Required",
    reqDesc: isHindi ? "कृपया अपना पूरा नाम दर्ज करें।" : "Please enter your full name.",
    invTitle: isHindi ? "अमान्य" : "Invalid",
    invDesc: isHindi ? "कृपया एक वैध 10 अंकों का मोबाइल नंबर दर्ज करें।" : "Please enter a valid 10-digit mobile number.",
  };

  const handleStart = () => {
    if (!fullName.trim()) {
      toast({ title: t.reqTitle, description: t.reqDesc, variant: "destructive" });
      return;
    }
    if (!/^\d{10}$/.test(mobile)) {
      toast({ title: t.invTitle, description: t.invDesc, variant: "destructive" });
      return;
    }
    onOpenChange(false);
    setChatOpen(true);
  };

  const handleChatClose = () => {
    setChatOpen(false);
    setFullName("");
    setMobile("");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="items-center text-center">
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary">
              <Heart className="h-7 w-7 text-primary-foreground" />
            </div>
            <DialogTitle className="text-xl font-bold">{t.title}</DialogTitle>
            <DialogDescription>{t.subtitle}</DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Globe className="h-4 w-4" />
                {t.langLabel}
              </div>
              <RadioGroup value={language} onValueChange={setLanguage} className="flex gap-4">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="english" id="english" />
                  <Label htmlFor="english" className="cursor-pointer">English</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="hindi" id="hindi" />
                  <Label htmlFor="hindi" className="cursor-pointer">हिन्दी (Hindi)</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">{t.nameLabel}</Label>
              <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} placeholder={t.namePlaceholder} className="border-primary/30 focus-visible:ring-primary" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">{t.mobileLabel}</Label>
              <Input id="mobile" value={mobile} onChange={e => setMobile(e.target.value)} placeholder={t.mobilePlaceholder} className="border-border" />
            </div>

            <Button onClick={handleStart} className="w-full rounded-full bg-gradient-to-r from-primary to-[hsl(190,80%,45%)] text-base font-semibold text-primary-foreground hover:opacity-90">
              {t.startBtn}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              {t.disclaimer}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <ConsultationChat
        open={chatOpen}
        onClose={handleChatClose}
        patientName={fullName}
        mobileNumber={mobile}
        language={language}
      />
    </>
  );
};

export default ConsultationDialog;
