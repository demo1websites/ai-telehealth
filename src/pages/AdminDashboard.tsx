import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, ArrowLeft, CheckCircle, XCircle, ChevronDown, ChevronUp, Mail, Phone, MapPin, GraduationCap, Stethoscope, Building2, FileText, Clock, Calendar, ExternalLink } from "lucide-react";
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
  practice_type: string | null;
  consultation_mode: string | null;
  available_days: string[];
  available_start_time: string | null;
  available_end_time: string | null;
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
  created_at: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { role, loading: authLoading } = useAuth();
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    if (!authLoading && role !== "admin") navigate("/");
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
      toast({ title: verified ? "Doctor Approved ✓" : "Doctor Rejected" });
      fetchDoctors();
    }
  };

  const pendingDoctors = doctors.filter((d) => !d.is_verified);
  const verifiedDoctors = doctors.filter((d) => d.is_verified);

  if (authLoading || loading) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  }

  const DocumentLink = ({ url, label }: { url: string | null; label: string }) => {
    if (!url) return <span className="text-muted-foreground text-xs">Not uploaded</span>;
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
        <ExternalLink className="h-3 w-3" /> {label}
      </a>
    );
  };

  const DoctorCard = ({ doc, showActions }: { doc: DoctorProfile; showActions: boolean }) => (
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
            <Badge variant={doc.is_verified ? "default" : "secondary"}>
              {doc.is_verified ? "Verified" : "Pending"}
            </Badge>
            {expandedId === doc.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </CardHeader>

      {expandedId === doc.id && (
        <CardContent className="border-t border-border pt-4 space-y-5">
          {/* Personal & Contact */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Personal Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> {doc.email}</p>
              <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {doc.mobile_number}</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> {doc.address_line1}, {doc.city}, {doc.state} - {doc.pincode}</p>
              <p><span className="text-muted-foreground">Gender:</span> {doc.gender} · <span className="text-muted-foreground">DOB:</span> {doc.dob}</p>
              <p><span className="text-muted-foreground">Languages:</span> {doc.languages.join(", ") || "N/A"}</p>
            </div>
          </div>

          {/* Education */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Education & Qualifications</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <p className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-muted-foreground" /> {doc.degree_type} - {doc.college_name} ({doc.year_of_completion})</p>
              {doc.has_pg_degree && (
                <p className="text-muted-foreground">PG: {doc.pg_degree_type} in {doc.pg_specialization} - {doc.pg_college_name}</p>
              )}
              <p><span className="text-muted-foreground">Reg No:</span> {doc.medical_registration_number} ({doc.medical_council_name})</p>
              <p><span className="text-muted-foreground">Experience:</span> {doc.years_of_experience} years</p>
              <p><span className="text-muted-foreground">Fee:</span> ₹{doc.consultation_fee}</p>
            </div>
          </div>

          {/* Practice & Availability */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Practice & Availability</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <p><span className="text-muted-foreground">Consultation Mode:</span> {doc.consultation_mode || "N/A"}</p>
              {doc.has_clinic && (
                <>
                  <p className="flex items-center gap-2"><Building2 className="h-4 w-4 text-muted-foreground" /> {doc.clinic_name} {doc.practice_type ? `(${doc.practice_type})` : ""}</p>
                  <p className="text-muted-foreground col-span-full">{doc.clinic_address}</p>
                </>
              )}
              {doc.available_days && doc.available_days.length > 0 && (
                <div className="col-span-full flex items-center gap-2 flex-wrap">
                  <span className="text-muted-foreground">Available:</span>
                  {doc.available_days.map((d) => <Badge key={d} variant="outline" className="text-xs">{d}</Badge>)}
                </div>
              )}
              {doc.available_start_time && (
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {doc.available_start_time?.slice(0, 5)} - {doc.available_end_time?.slice(0, 5)}
                </p>
              )}
            </div>
          </div>

          {/* Expertise */}
          {doc.areas_of_expertise.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Areas of Expertise</h4>
              <div className="flex flex-wrap gap-1">
                {doc.areas_of_expertise.map((a) => <Badge key={a} variant="secondary" className="text-xs">{a}</Badge>)}
              </div>
            </div>
          )}

          {doc.work_history && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-1">Work History</h4>
              <p className="text-sm text-muted-foreground">{doc.work_history}</p>
            </div>
          )}

          {/* Documents */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1"><FileText className="h-4 w-4" /> Verification Documents</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="rounded-lg border border-border p-3 space-y-1">
                <p className="text-xs font-medium text-foreground">Profile Photo</p>
                {doc.profile_photo_url ? (
                  <img src={doc.profile_photo_url} alt="Profile" className="h-20 w-20 rounded object-cover" />
                ) : <span className="text-xs text-muted-foreground">Not uploaded</span>}
              </div>
              <div className="rounded-lg border border-border p-3 space-y-1">
                <p className="text-xs font-medium text-foreground">Signature</p>
                {doc.signature_url ? (
                  <img src={doc.signature_url} alt="Signature" className="h-12 object-contain" />
                ) : <span className="text-xs text-muted-foreground">Not uploaded</span>}
              </div>
              <div className="rounded-lg border border-border p-3 space-y-1">
                <p className="text-xs font-medium text-foreground">Degree Certificate</p>
                <DocumentLink url={doc.degree_certificate_url} label="View Certificate" />
              </div>
              {doc.has_pg_degree && (
                <div className="rounded-lg border border-border p-3 space-y-1">
                  <p className="text-xs font-medium text-foreground">PG Certificate</p>
                  <DocumentLink url={doc.pg_certificate_url} label="View Certificate" />
                </div>
              )}
              <div className="rounded-lg border border-border p-3 space-y-1">
                <p className="text-xs font-medium text-foreground">Medical Registration</p>
                <DocumentLink url={doc.medical_certificate_url} label="View Certificate" />
              </div>
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex gap-3 pt-2 border-t border-border">
              <Button onClick={() => updateVerification(doc.id, true)} disabled={doc.is_verified} className="gap-1.5">
                <CheckCircle className="h-4 w-4" /> Approve
              </Button>
              <Button variant="destructive" onClick={() => updateVerification(doc.id, false)} disabled={!doc.is_verified} className="gap-1.5">
                <XCircle className="h-4 w-4" /> Reject
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );

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

      <div className="container max-w-5xl py-10">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="pending" className="gap-1.5">
              <Clock className="h-4 w-4" /> Pending Verification
              {pendingDoctors.length > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs h-5 px-1.5">{pendingDoctors.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="verified" className="gap-1.5">
              <CheckCircle className="h-4 w-4" /> Verified Doctors
              {verifiedDoctors.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs h-5 px-1.5">{verifiedDoctors.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {pendingDoctors.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">No pending doctor registrations.</p>
            ) : (
              <div className="space-y-4">
                {pendingDoctors.map((doc) => <DoctorCard key={doc.id} doc={doc} showActions={true} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="verified">
            {verifiedDoctors.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">No verified doctors yet.</p>
            ) : (
              <div className="space-y-4">
                {verifiedDoctors.map((doc) => <DoctorCard key={doc.id} doc={doc} showActions={true} />)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
