import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Heart, ArrowLeft, Plus, Trash2, Mail, Phone, MapPin, GraduationCap, Stethoscope, Building2, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

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

interface Slot {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
}

const TIME_OPTIONS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30",
];

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && role !== "doctor") navigate("/");
  }, [role, authLoading, navigate]);

  useEffect(() => {
    if (user && role === "doctor") fetchProfile();
  }, [user, role]);

  useEffect(() => {
    if (profile && selectedDate) fetchSlots();
  }, [profile, selectedDate]);

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

  const fetchSlots = async () => {
    if (!profile || !selectedDate) return;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const { data, error } = await supabase
      .from("doctor_availability")
      .select("*")
      .eq("doctor_id", profile.id)
      .eq("slot_date", dateStr)
      .order("start_time");
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setSlots(data || []);
  };

  const addSlot = async (time: string) => {
    if (!profile || !selectedDate) return;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const [h, m] = time.split(":").map(Number);
    const endMin = m + 30;
    const endTime = `${String(h + Math.floor(endMin / 60)).padStart(2, "0")}:${String(endMin % 60).padStart(2, "0")}`;

    const { error } = await supabase.from("doctor_availability").insert({
      doctor_id: profile.id,
      slot_date: dateStr,
      start_time: time,
      end_time: endTime,
    });
    if (error) {
      if (error.code === "23505") toast({ title: "Slot already exists", variant: "destructive" });
      else toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Slot added" });
      fetchSlots();
    }
  };

  const deleteSlot = async (slotId: string) => {
    const { error } = await supabase.from("doctor_availability").delete().eq("id", slotId);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Slot removed" });
      fetchSlots();
    }
  };

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
        <p className="text-muted-foreground max-w-md">Your account is under review. An admin will verify your profile shortly. You'll be able to access your dashboard once verified.</p>
        <Button variant="outline" onClick={() => { supabase.auth.signOut(); navigate("/"); }}>Sign Out</Button>
      </div>
    );
  }

  const existingTimes = new Set(slots.map((s) => s.start_time.slice(0, 5)));
  const availableTimes = TIME_OPTIONS.filter((t) => !existingTimes.has(t));

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Doctor Dashboard</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { supabase.auth.signOut(); navigate("/"); }}>Sign Out</Button>
        </div>
      </header>

      <div className="container max-w-6xl py-10 space-y-8">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {profile.profile_photo_url ? (
                <img src={profile.profile_photo_url} alt="" className="h-14 w-14 rounded-full object-cover" />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                  <Stethoscope className="h-7 w-7 text-muted-foreground" />
                </div>
              )}
              <div>
                <span className="text-xl">{profile.full_name}</span>
                <p className="text-sm font-normal text-muted-foreground">{profile.primary_specialization || "General Practitioner"}</p>
              </div>
              <Badge className="ml-auto">Verified</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
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
              <div className="flex flex-wrap gap-1 mt-3">
                {profile.areas_of_expertise.map((a) => <Badge key={a} variant="secondary" className="text-xs">{a}</Badge>)}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Appointment Slots */}
        <Card>
          <CardHeader>
            <CardTitle>Manage Appointment Slots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6">
              {/* Calendar */}
              <div>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  className="rounded-md border"
                />
              </div>

              {/* Slots for selected date */}
              <div>
                {selectedDate && (
                  <>
                    <h3 className="font-semibold text-foreground mb-3">
                      {format(selectedDate, "EEEE, MMMM d, yyyy")}
                    </h3>

                    {/* Existing slots */}
                    {slots.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                        {slots.map((slot) => (
                          <div
                            key={slot.id}
                            className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                              slot.is_booked ? "bg-muted border-muted" : "bg-background border-border"
                            }`}
                          >
                            <span>
                              {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                            </span>
                            {slot.is_booked ? (
                              <Badge variant="secondary" className="text-xs">Booked</Badge>
                            ) : (
                              <button onClick={() => deleteSlot(slot.id)} className="text-destructive hover:text-destructive/80">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground mb-4">No slots for this date.</p>
                    )}

                    {/* Add slots */}
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Add Time Slots</h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                      {availableTimes.map((time) => (
                        <Button
                          key={time}
                          variant="outline"
                          size="sm"
                          onClick={() => addSlot(time)}
                          className="gap-1 text-xs"
                        >
                          <Plus className="h-3 w-3" /> {time}
                        </Button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoctorDashboard;
