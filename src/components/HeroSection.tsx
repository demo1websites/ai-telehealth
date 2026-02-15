import { ArrowRight, CheckCircle, Video } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import ConsultationDialog from "@/components/ConsultationDialog";

const HeroSection = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <section className="relative overflow-hidden bg-background py-16 md:py-24">
      <div className="container grid items-center gap-12 md:grid-cols-2">
        {/* Left */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <CheckCircle className="h-4 w-4" />
            Trusted by 10,000+ patients
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Your Health,
            <br />
            <span className="text-primary">Connected</span>
          </h1>

          <p className="max-w-lg text-lg text-muted-foreground">
            Book appointments, consult with doctors via secure video calls, manage your medical records, and get AI-powered health insights — all in one place.
          </p>

          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => setDialogOpen(true)}
              className="gap-2 rounded-full bg-gradient-to-r from-primary to-[hsl(190,80%,45%)] px-6 py-5 text-base font-semibold text-primary-foreground hover:opacity-90"
            >
              Start Free Consultation
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="rounded-full px-6 py-5 text-base font-semibold">
              Join as Doctor
            </Button>
          </div>
        </div>

        {/* Right - decorative card */}
        <div className="relative hidden md:block">
          <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-primary/20 via-[hsl(190,80%,80%)] to-[hsl(220,60%,80%)] p-1">
            <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-transparent">
              <div className="text-center space-y-3">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                  <Video className="h-8 w-8 text-primary" />
                </div>
                <p className="text-lg font-semibold text-foreground">HD Video Calls</p>
                <p className="text-sm text-muted-foreground">Crystal clear quality</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConsultationDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </section>
  );
};

export default HeroSection;
