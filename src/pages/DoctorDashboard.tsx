import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout, { SidebarItem } from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, UserCog, Calendar, Clock, Stethoscope,
  Mail, Phone, MapPin, GraduationCap, Building2, Users, DollarSign,
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
}

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<"overview" | "profile" | "schedule">("overview");

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

  const sidebarItems: SidebarItem[] = [
    { label: "Dashboard", icon: LayoutDashboard, onClick: () => setActiveView("overview") },
    { label: "My Profile", icon: UserCog, onClick: () => setActiveView("profile") },
    { label: "Manage Schedule", icon: Calendar, onClick: () => setActiveView("schedule") },
  ];

  if (authLoading || loading) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        <p>No doctor profile found.</p>
      </div>
    );
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

  return (
    <DashboardLayout title="Doctor Dashboard" sidebarItems={sidebarItems}>
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
          <h2 className="text-2xl font-bold text-foreground">My Profile</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg">
                {profile.profile_photo_url ? (
                  <img src={profile.profile_photo_url} alt="" className="h-14 w-14 rounded-full object-cover" />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                    <Stethoscope className="h-7 w-7 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <span>{profile.full_name}</span>
                  <p className="text-sm font-normal text-muted-foreground">{profile.primary_specialization}</p>
                </div>
                <Badge className="ml-auto">Verified</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> {profile.email}</p>
                <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {profile.mobile_number}</p>
                <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> {profile.city}, {profile.state}</p>
                <p className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-muted-foreground" /> {profile.degree_type} - {profile.college_name}</p>
                <p><span className="text-muted-foreground">Reg:</span> {profile.medical_registration_number}</p>
                <p><span className="text-muted-foreground">Experience:</span> {profile.years_of_experience} years</p>
                <p><span className="text-muted-foreground">Fee:</span> ₹{profile.consultation_fee}</p>
                <p><span className="text-muted-foreground">Languages:</span> {profile.languages.join(", ")}</p>
                {profile.has_clinic && (
                  <p className="flex items-center gap-2"><Building2 className="h-4 w-4 text-muted-foreground" /> {profile.clinic_name}</p>
                )}
              </div>
              {profile.areas_of_expertise.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1">
                  {profile.areas_of_expertise.map((a) => <Badge key={a} variant="secondary" className="text-xs">{a}</Badge>)}
                </div>
              )}
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
