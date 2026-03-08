import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout, { SidebarItem } from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User, Bot, FileText, CalendarCheck, MessageSquareHeart, LifeBuoy,
  LayoutDashboard, UserCog, Calendar,
} from "lucide-react";

interface ProfileData {
  full_name: string;
  email: string;
  mobile_number: string;
  dob: string;
}

const PatientDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [activeView, setActiveView] = useState<"overview" | "profile" | "appointments">("overview");

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
      .then(({ data }) => { if (data) setProfile(data); });
  }, [user]);

  const sidebarItems: SidebarItem[] = [
    { label: "Dashboard", icon: LayoutDashboard, onClick: () => setActiveView("overview") },
    { label: "My Profile", icon: UserCog, onClick: () => setActiveView("profile") },
    { label: "Appointments", icon: Calendar, onClick: () => setActiveView("appointments") },
    { label: "AI Chats", icon: Bot, path: "/ai-chat" },
    { label: "Medical Reports", icon: FileText, path: "/medical-reports" },
    { label: "Feedback", icon: MessageSquareHeart, path: "/feedback" },
    { label: "Support", icon: LifeBuoy, path: "/support" },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <DashboardLayout title="Patient Dashboard" sidebarItems={sidebarItems}>
      {activeView === "overview" && (
        <div className="space-y-6">
          {/* Greeting */}
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Welcome back{profile ? `, ${profile.full_name}` : ""} 👋
            </h2>
            <p className="text-sm text-muted-foreground">Manage your health journey from one place.</p>
          </div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Upcoming Appointments" value={0} icon={CalendarCheck} />
            <StatCard label="AI Consultations" value={0} icon={Bot} />
            <StatCard label="Medical Reports" value={0} icon={FileText} />
            <StatCard label="Profile Completeness" value="100%" icon={User} />
          </div>

          {/* Quick actions */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Book Appointment", desc: "Schedule a consultation with a doctor", icon: CalendarCheck, action: () => setActiveView("appointments") },
              { label: "AI Health Chat", desc: "Get instant health guidance from our AI", icon: Bot, action: () => navigate("/ai-chat") },
              { label: "View Reports", desc: "Access your medical reports", icon: FileText, action: () => navigate("/medical-reports") },
            ].map((item) => (
              <Card key={item.label} className="group cursor-pointer transition-shadow hover:shadow-md" onClick={item.action}>
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeView === "profile" && profile && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">My Profile</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-primary" /> Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: "Full Name", value: profile.full_name },
                  { label: "Email", value: profile.email },
                  { label: "Mobile", value: profile.mobile_number },
                  { label: "Date of Birth", value: profile.dob },
                ].map((f) => (
                  <div key={f.label}>
                    <p className="text-xs text-muted-foreground">{f.label}</p>
                    <p className="font-medium text-foreground">{f.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeView === "appointments" && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">My Appointments</h2>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <CalendarCheck className="mb-3 h-12 w-12 text-muted-foreground/40" />
              <p className="text-muted-foreground">No appointments yet.</p>
              <p className="mt-1 text-xs text-muted-foreground">Book a consultation with a doctor to get started.</p>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default PatientDashboard;
