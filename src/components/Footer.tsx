import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-foreground text-background">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                <Heart className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">MediConnect</span>
            </div>
            <p className="text-sm text-background/60">
              Your trusted telehealth platform for AI-powered health insights.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm text-background/60">
              <li><a href="#about" className="hover:text-background">About Us</a></li>
              <li><a href="#services" className="hover:text-background">Services</a></li>
              <li><a href="#contact" className="hover:text-background">Contact</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Services</h4>
            <ul className="space-y-2 text-sm text-background/60">
              <li>AI Consultation</li>
              <li>Video Calls</li>
              <li>Health Records</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Contact</h4>
            <ul className="space-y-2 text-sm text-background/60">
              <li>support@mediconnect.com</li>
              <li>+91 1234 567 890</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-background/10 pt-6 text-center text-sm text-background/40">
          © 2026 MediConnect. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
