import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  Bot,
  FileText,
  CalendarCheck,
  MessageSquareHeart,
  LifeBuoy,
  ChevronRight,
} from "lucide-react";

interface ProfileData {
  full_name: string;
  email: string;
  mobile_number: string;
  dob: string;
}

const dashboardItems = [
  {
    label: "AI Chats",
    description: "Get instant health guidance from our AI assistant",
    icon: Bot,
    path: "/ai-chat",
  },
  {
    label: "Medical Reports",
    description: "View and download your medical reports",
    icon: FileText,
    path: "/medical-reports",
  },
  {
    label: "Your Appointments",
    description: "Manage upcoming and past appointments",
    icon: CalendarCheck,
    path: "/appointments",
  },
  {
    label: "Feedback",
    description: "Share your experience and suggestions",
    icon: MessageSquareHeart,
    path: "/feedback",
  },
  {
    label: "Support",
    description: "Get help from our support team",
    icon: LifeBuoy,
    path: "/support",
  },
];

const PatientDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, email, mobile_number, dob")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setProfile(data);
      });
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Header />
      <main className="container flex-1 py-8">
        {/* Greeting + Profile Button */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome{profile ? `, ${profile.full_name}` : ""}!
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your health journey from one place.
            </p>
          </div>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowProfile(!showProfile)}
          >
            <User className="h-4 w-4" />
            {showProfile ? "Hide Profile" : "My Profile"}
          </Button>
        </div>

        {/* Profile Card */}
        {showProfile && profile && (
          <Card className="mb-8 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-primary" /> Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Full Name</p>
                  <p className="font-medium text-foreground">{profile.full_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground">{profile.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Mobile</p>
                  <p className="font-medium text-foreground">{profile.mobile_number}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date of Birth</p>
                  <p className="font-medium text-foreground">{profile.dob}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dashboard Action Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dashboardItems.map((item) => (
            <Card
              key={item.label}
              className="group cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => navigate(item.path)}
            >
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;
