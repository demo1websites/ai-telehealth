import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout, { SidebarItem, SidebarProfile } from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User, Bot, FileText, CalendarCheck, MessageSquareHeart, LifeBuoy,
  LayoutDashboard, UserCog, Calendar, Pencil, Save, X,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

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
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<ProfileData | null>(null);
  const [saving, setSaving] = useState(false);

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

  const handleSaveProfile = async () => {
    if (!user || !editData) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: editData.full_name,
        mobile_number: editData.mobile_number,
        dob: editData.dob,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setProfile(editData);
      setEditing(false);
      toast({ title: "Profile updated successfully ✓" });
    }
  };

  const sidebarItems: SidebarItem[] = [
    { label: "Dashboard", icon: LayoutDashboard, onClick: () => setActiveView("overview"), isActive: activeView === "overview" },
    { label: "My Profile", icon: UserCog, onClick: () => setActiveView("profile"), isActive: activeView === "profile" },
    { label: "Appointments", icon: Calendar, onClick: () => setActiveView("appointments"), isActive: activeView === "appointments" },
    { label: "AI Chats", icon: Bot, path: "/ai-chat" },
    { label: "Medical Reports", icon: FileText, path: "/medical-reports" },
    { label: "Feedback", icon: MessageSquareHeart, path: "/feedback" },
    { label: "Support", icon: LifeBuoy, path: "/support" },
  ];

  const sidebarProfile: SidebarProfile | undefined = profile
    ? { name: profile.full_name, subtitle: profile.email }
    : undefined;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <DashboardLayout title="Patient Dashboard" sidebarItems={sidebarItems} sidebarProfile={sidebarProfile}>
      {activeView === "overview" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Welcome back{profile ? `, ${profile.full_name}` : ""} 👋
            </h2>
            <p className="text-sm text-muted-foreground">Manage your health journey from one place.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Upcoming Appointments" value={0} icon={CalendarCheck} />
            <StatCard label="AI Consultations" value={0} icon={Bot} />
            <StatCard label="Medical Reports" value={0} icon={FileText} />
            <StatCard label="Profile Completeness" value="100%" icon={User} />
          </div>
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
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">My Profile</h2>
            {!editing ? (
              <Button variant="outline" className="gap-2" onClick={() => { setEditData({ ...profile }); setEditing(true); }}>
                <Pencil className="h-4 w-4" /> Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2" onClick={() => setEditing(false)}>
                  <X className="h-4 w-4" /> Cancel
                </Button>
                <Button className="gap-2" onClick={handleSaveProfile} disabled={saving}>
                  <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save"}
                </Button>
              </div>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-primary" /> Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!editing ? (
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
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Full Name</Label>
                    <Input value={editData?.full_name || ""} onChange={(e) => setEditData((p) => p ? { ...p, full_name: e.target.value } : p)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input value={editData?.email || ""} disabled className="bg-muted/50" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Mobile</Label>
                    <Input value={editData?.mobile_number || ""} onChange={(e) => setEditData((p) => p ? { ...p, mobile_number: e.target.value } : p)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Date of Birth</Label>
                    <Input type="date" value={editData?.dob || ""} onChange={(e) => setEditData((p) => p ? { ...p, dob: e.target.value } : p)} />
                  </div>
                </div>
              )}
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
