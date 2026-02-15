import { Heart, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
            <Heart className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">MediConnect</span>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#about" className="text-sm text-muted-foreground transition-colors hover:text-foreground">About Us</a>
          <a href="#services" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Services</a>
          <a href="#contact" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Contact</a>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground capitalize">{role ?? "user"}</span>
              <Button variant="ghost" size="sm" onClick={signOut} className="gap-1.5">
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" className="text-sm" onClick={() => navigate("/auth")}>
                Sign In
              </Button>
              <Button className="rounded-full text-sm" onClick={() => navigate("/auth")}>
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
