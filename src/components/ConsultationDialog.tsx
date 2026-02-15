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

interface ConsultationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ConsultationDialog = ({ open, onOpenChange }: ConsultationDialogProps) => {
  const [language, setLanguage] = useState("english");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary">
            <Heart className="h-7 w-7 text-primary-foreground" />
          </div>
          <DialogTitle className="text-xl font-bold">AI Health Consultation</DialogTitle>
          <DialogDescription>
            Get preliminary health insights from our AI assistant
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Globe className="h-4 w-4" />
              Preferred Language
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
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" placeholder="Enter your full name" className="border-primary/30 focus-visible:ring-primary" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number</Label>
            <Input id="mobile" placeholder="10-digit mobile number" className="border-border" />
          </div>

          <Button className="w-full rounded-full bg-gradient-to-r from-primary to-[hsl(190,80%,45%)] text-base font-semibold text-primary-foreground hover:opacity-90">
            Start Consultation
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            This is for informational purposes only. Always consult a real doctor for medical advice.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConsultationDialog;
