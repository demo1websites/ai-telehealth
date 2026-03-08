import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout, { SidebarItem, SidebarProfile } from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  LayoutDashboard, UserCog, Calendar, Clock, Stethoscope,
  Mail, Phone, MapPin, GraduationCap, Building2, Users, DollarSign,
  Pencil, Save, X, FileText, ExternalLink, Image,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import DoctorScheduleManager from "@/components/doctor-dashboard/DoctorScheduleManager";

interface DoctorProfile {
  id: string;
  full_name: string;
  email: string;
  mobile_number: string;
  gender: string;
  dob: string;
  is_verified: boolean;
  primary_specialization: string;
  degree_type: string;
  college_name: string;
  year_of_completion: number | null;
  years_of_experience: number;
  medical_registration_number: string;
  medical_council_name: string;
  consultation_fee: number;
  languages: string[];
  areas_of_expertise: string[];
  address_line1: string;
  city: string;
  state: string;
  pincode: string;
  has_clinic: boolean;
  clinic_name: string | null;
  clinic_address: string | null;
  has_pg_degree: boolean;
  pg_degree_type: string | null;
  pg_specialization: string | null;
  pg_college_name: string | null;
  profile_photo_url: string | null;
  signature_url: string | null;
  degree_certificate_url: string | null;
  pg_certificate_url: string | null;
  medical_certificate_url: string | null;
  work_history: string | null;
  consultation_mode: string | null;
  practice_type: string | null;
}

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<"overview" | "profile" | "schedule">("overview");
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<DoctorProfile>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && role !== "doctor") navigate("/");
  }, [role, authLoading, navigate]);

  useEffect(() => {
    if (user && role === "doctor") fetchProfile();
  }, [user, role]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from("doctor_profiles")
      .select("*")
      .eq("user_id", user!.id)
      .maybeSingle();
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setProfile(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from("doctor_profiles")
      .update({
        full_name: editData.full_name,
        mobile_number: editData.mobile_number,
        consultation_fee: editData.consultation_fee,
        address_line1: editData.address_line1,
        city: editData.city,
        state: editData.state,
        pincode: editData.pincode,
        clinic_name: editData.clinic_name,
        clinic_address: editData.clinic_address,
      })
      .eq("id", profile.id);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setProfile((p) => p ? { ...p, ...editData } : p);
      setEditing(false);
      toast({ title: "Profile updated ✓" });
    }
  };

  const sidebarItems: SidebarItem[] = [
    { label: "Dashboard", icon: LayoutDashboard, onClick: () => setActiveView("overview"), isActive: activeView === "overview" },
    { label: "My Profile", icon: UserCog, onClick: () => setActiveView("profile"), isActive: activeView === "profile" },
    { label: "Manage Schedule", icon: Calendar, onClick: () => setActiveView("schedule"), isActive: activeView === "schedule" },
  ];

  const sidebarProfile: SidebarProfile | undefined = profile
    ? { name: profile.full_name, subtitle: profile.primary_specialization || "Doctor", avatarUrl: profile.profile_photo_url }
    : undefined;

  if (authLoading || loading) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  }

  if (!profile) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground"><p>No doctor profile found.</p></div>;
  }

  if (!profile.is_verified) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <Clock className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Verification Pending</h2>
        <p className="text-muted-foreground max-w-md">Your account is under review. An admin will verify your profile shortly.</p>
        <Button variant="outline" onClick={() => { supabase.auth.signOut(); navigate("/"); }}>Sign Out</Button>
      </div>
    );
  }

  const DocumentItem = ({ label, url, isImage }: { label: string; url: string | null; isImage?: boolean }) => (
    <div className="rounded-lg border border-border p-3 space-y-2">
      <p className="text-xs font-medium text-foreground">{label}</p>
      {url ? (
        isImage ? (
          <img src={url} alt={label} className="h-20 w-20 rounded object-cover" />
        ) : (
          <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
            <ExternalLink className="h-3 w-3" /> View Document
          </a>
        )
      ) : (
        <span className="text-xs text-muted-foreground">Not uploaded</span>
      )}
    </div>
  );

  return (
    <DashboardLayout title="Doctor Dashboard" sidebarItems={sidebarItems} sidebarProfile={sidebarProfile}>
      {activeView === "overview" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Welcome, Dr. {profile.full_name} 👋</h2>
            <p className="text-sm text-muted-foreground">{profile.primary_specialization || "General Practitioner"}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Experience" value={`${profile.years_of_experience} yrs`} icon={Stethoscope} />
            <StatCard label="Consultation Fee" value={`₹${profile.consultation_fee}`} icon={DollarSign} />
            <StatCard label="Patients Today" value={0} icon={Users} />
            <StatCard label="Upcoming Slots" value={0} icon={Calendar} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => setActiveView("profile")}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <UserCog className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Manage Profile</p>
                  <p className="text-xs text-muted-foreground">View and update your information</p>
                </div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => setActiveView("schedule")}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Manage Appointments</p>
                  <p className="text-xs text-muted-foreground">Set your availability and view bookings</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeView === "profile" && (
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
                <Button className="gap-2" onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save"}
                </Button>
              </div>
            )}
          </div>

          {/* Profile header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg">
                {profile.profile_photo_url ? (
                  <img src={profile.profile_photo_url} alt="" className="h-16 w-16 rounded-full object-cover ring-2 ring-primary/20" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Stethoscope className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <span className="text-xl">{profile.full_name}</span>
                  <p className="text-sm font-normal text-muted-foreground">{profile.primary_specialization}</p>
                </div>
                <Badge className="ml-auto">Verified</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!editing ? (
                <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                  <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> {profile.email}</p>
                  <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {profile.mobile_number}</p>
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> {profile.address_line1}, {profile.city}, {profile.state} - {profile.pincode}</p>
                  <p className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-muted-foreground" /> {profile.degree_type} - {profile.college_name}</p>
                  <p><span className="text-muted-foreground">Gender:</span> {profile.gender}</p>
                  <p><span className="text-muted-foreground">DOB:</span> {profile.dob}</p>
                  <p><span className="text-muted-foreground">Reg No:</span> {profile.medical_registration_number}</p>
                  <p><span className="text-muted-foreground">Council:</span> {profile.medical_council_name}</p>
                  <p><span className="text-muted-foreground">Experience:</span> {profile.years_of_experience} years</p>
                  <p><span className="text-muted-foreground">Fee:</span> ₹{profile.consultation_fee}</p>
                  <p><span className="text-muted-foreground">Mode:</span> {profile.consultation_mode || "N/A"}</p>
                  <p><span className="text-muted-foreground">Practice:</span> {profile.practice_type || "N/A"}</p>
                  <p><span className="text-muted-foreground">Languages:</span> {profile.languages.join(", ")}</p>
                  {profile.has_clinic && (
                    <p className="flex items-center gap-2"><Building2 className="h-4 w-4 text-muted-foreground" /> {profile.clinic_name} — {profile.clinic_address}</p>
                  )}
                  {profile.has_pg_degree && (
                    <p><span className="text-muted-foreground">PG:</span> {profile.pg_degree_type} in {profile.pg_specialization} - {profile.pg_college_name}</p>
                  )}
                  {profile.work_history && (
                    <p className="col-span-full"><span className="text-muted-foreground">Work History:</span> {profile.work_history}</p>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label>Full Name</Label>
                    <Input value={editData.full_name || ""} onChange={(e) => setEditData((p) => ({ ...p, full_name: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input value={profile.email} disabled className="bg-muted/50" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Mobile</Label>
                    <Input value={editData.mobile_number || ""} onChange={(e) => setEditData((p) => ({ ...p, mobile_number: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Consultation Fee (₹)</Label>
                    <Input type="number" value={editData.consultation_fee || 0} onChange={(e) => setEditData((p) => ({ ...p, consultation_fee: Number(e.target.value) }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Address</Label>
                    <Input value={editData.address_line1 || ""} onChange={(e) => setEditData((p) => ({ ...p, address_line1: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>City</Label>
                    <Input value={editData.city || ""} onChange={(e) => setEditData((p) => ({ ...p, city: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>State</Label>
                    <Input value={editData.state || ""} onChange={(e) => setEditData((p) => ({ ...p, state: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Pincode</Label>
                    <Input value={editData.pincode || ""} onChange={(e) => setEditData((p) => ({ ...p, pincode: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Clinic Name</Label>
                    <Input value={editData.clinic_name || ""} onChange={(e) => setEditData((p) => ({ ...p, clinic_name: e.target.value }))} />
                  </div>
                </div>
              )}

              {profile.areas_of_expertise.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1">
                  {profile.areas_of_expertise.map((a) => <Badge key={a} variant="secondary" className="text-xs">{a}</Badge>)}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Uploaded Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-primary" /> Uploaded Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                <DocumentItem label="Profile Photo" url={profile.profile_photo_url} isImage />
                <DocumentItem label="Signature" url={profile.signature_url} isImage />
                <DocumentItem label="Degree Certificate" url={profile.degree_certificate_url} />
                {profile.has_pg_degree && <DocumentItem label="PG Certificate" url={profile.pg_certificate_url} />}
                <DocumentItem label="Medical Registration" url={profile.medical_certificate_url} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeView === "schedule" && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Manage Schedule</h2>
          <Card>
            <CardContent className="pt-6">
              <DoctorScheduleManager doctorId={profile.id} />
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DoctorDashboard;
