import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ArrowLeft, CheckCircle, XCircle, ChevronDown, ChevronUp, Mail, Phone, MapPin, GraduationCap, Stethoscope, Building2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface DoctorProfile {
  id: string;
  user_id: string;
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
  created_at: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { role, loading: authLoading } = useAuth();
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && role !== "admin") {
      navigate("/");
    }
  }, [role, authLoading, navigate]);

  const fetchDoctors = async () => {
    const { data, error } = await supabase
      .from("doctor_profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setDoctors(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (role === "admin") fetchDoctors();
  }, [role]);

  const updateVerification = async (id: string, verified: boolean) => {
    const { error } = await supabase
      .from("doctor_profiles")
      .update({ is_verified: verified })
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: verified ? "Doctor Verified" : "Doctor Rejected" });
      fetchDoctors();
    }
  };

  if (authLoading || loading) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  }

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
            <span className="text-xl font-bold text-foreground">Admin Dashboard</span>
          </div>
          <div />
        </div>
      </header>

      <div className="container max-w-4xl py-10">
        <h1 className="text-2xl font-bold text-foreground mb-6">Doctor Registrations</h1>

        {doctors.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">No doctor registrations yet.</p>
        ) : (
          <div className="space-y-4">
            {doctors.map((doc) => (
              <Card key={doc.id} className="overflow-hidden">
                <CardHeader className="cursor-pointer" onClick={() => setExpandedId(expandedId === doc.id ? null : doc.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {doc.profile_photo_url ? (
                        <img src={doc.profile_photo_url} alt="" className="h-12 w-12 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                          <Stethoscope className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-base">{doc.full_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{doc.primary_specialization || "General"} · {doc.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={doc.is_verified ? "default" : "destructive"}>
                        {doc.is_verified ? "Verified" : "Not Verified"}
                      </Badge>
                      {expandedId === doc.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                </CardHeader>

                {expandedId === doc.id && (
                  <CardContent className="border-t border-border pt-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> {doc.email}</p>
                        <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {doc.mobile_number}</p>
                        <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> {doc.address_line1}, {doc.city}, {doc.state} - {doc.pincode}</p>
                        <p><span className="text-muted-foreground">Gender:</span> {doc.gender} · <span className="text-muted-foreground">DOB:</span> {doc.dob}</p>
                        <p><span className="text-muted-foreground">Languages:</span> {doc.languages.join(", ") || "N/A"}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-muted-foreground" /> {doc.degree_type} - {doc.college_name} ({doc.year_of_completion})</p>
                        {doc.has_pg_degree && (
                          <p className="text-muted-foreground">PG: {doc.pg_degree_type} in {doc.pg_specialization} - {doc.pg_college_name}</p>
                        )}
                        <p><span className="text-muted-foreground">Reg No:</span> {doc.medical_registration_number} ({doc.medical_council_name})</p>
                        <p><span className="text-muted-foreground">Experience:</span> {doc.years_of_experience} years</p>
                        <p><span className="text-muted-foreground">Fee:</span> ₹{doc.consultation_fee}</p>
                        {doc.areas_of_expertise.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {doc.areas_of_expertise.map((a) => <Badge key={a} variant="secondary" className="text-xs">{a}</Badge>)}
                          </div>
                        )}
                        {doc.has_clinic && (
                          <p className="flex items-center gap-2"><Building2 className="h-4 w-4 text-muted-foreground" /> {doc.clinic_name} - {doc.clinic_address}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={() => updateVerification(doc.id, true)}
                        disabled={doc.is_verified}
                        className="gap-1.5"
                      >
                        <CheckCircle className="h-4 w-4" /> Verify
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => updateVerification(doc.id, false)}
                        disabled={!doc.is_verified}
                        className="gap-1.5"
                      >
                        <XCircle className="h-4 w-4" /> Reject
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
