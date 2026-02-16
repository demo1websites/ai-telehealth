import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import DoctorProfileTab from "@/components/doctor-registration/DoctorProfileTab";
import DoctorEducationTab from "@/components/doctor-registration/DoctorEducationTab";

export interface DoctorFormData {
  // Personal
  fullName: string;
  dob: string;
  gender: string;
  mobile: string;
  email: string;
  password: string;
  languages: string[];
  profilePhotoFile: File | null;
  signatureFile: File | null;
  // Address
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  // Education
  degreeType: string;
  collegeName: string;
  yearOfCompletion: string;
  degreeCertificateFile: File | null;
  hasPgDegree: boolean;
  pgDegreeType: string;
  pgSpecialization: string;
  pgCollegeName: string;
  pgYearOfCompletion: string;
  pgCertificateFile: File | null;
  // Expertise
  primarySpecialization: string;
  yearsOfExperience: string;
  areasOfExpertise: string[];
  workHistory: string;
  // Practice
  hasClinic: boolean;
  clinicName: string;
  clinicAddress: string;
  // Medical Registration
  medicalRegNumber: string;
  medicalCouncilName: string;
  registrationYear: string;
  medicalCertificateFile: File | null;
  // Fee
  consultationFee: string;
}

const initialForm: DoctorFormData = {
  fullName: "", dob: "", gender: "", mobile: "", email: "", password: "",
  languages: [], profilePhotoFile: null, signatureFile: null,
  addressLine1: "", addressLine2: "", city: "", state: "", pincode: "",
  degreeType: "", collegeName: "", yearOfCompletion: "", degreeCertificateFile: null,
  hasPgDegree: false, pgDegreeType: "", pgSpecialization: "", pgCollegeName: "",
  pgYearOfCompletion: "", pgCertificateFile: null,
  primarySpecialization: "", yearsOfExperience: "", areasOfExpertise: [], workHistory: "",
  hasClinic: false, clinicName: "", clinicAddress: "",
  medicalRegNumber: "", medicalCouncilName: "", registrationYear: "",
  medicalCertificateFile: null, consultationFee: "500",
};

const DoctorRegistration = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [form, setForm] = useState<DoctorFormData>(initialForm);
  const [loading, setLoading] = useState(false);

  const update = (field: keyof DoctorFormData, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const uploadFile = async (file: File, userId: string, folder: string) => {
    const ext = file.name.split(".").pop();
    const path = `${userId}/${folder}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("doctor-documents").upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("doctor-documents").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 1. Sign up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: form.fullName,
            dob: form.dob,
            mobile_number: form.mobile,
            role: "doctor",
          },
        },
      });
      if (authError) throw authError;
      const userId = authData.user?.id;
      if (!userId) throw new Error("User creation failed");

      // 2. Upload files
      let profilePhotoUrl: string | null = null;
      let signatureUrl: string | null = null;
      let degreeCertUrl: string | null = null;
      let pgCertUrl: string | null = null;
      let medicalCertUrl: string | null = null;

      if (form.profilePhotoFile) profilePhotoUrl = await uploadFile(form.profilePhotoFile, userId, "profile");
      if (form.signatureFile) signatureUrl = await uploadFile(form.signatureFile, userId, "signature");
      if (form.degreeCertificateFile) degreeCertUrl = await uploadFile(form.degreeCertificateFile, userId, "degree");
      if (form.pgCertificateFile) pgCertUrl = await uploadFile(form.pgCertificateFile, userId, "pg-degree");
      if (form.medicalCertificateFile) medicalCertUrl = await uploadFile(form.medicalCertificateFile, userId, "medical-reg");

      // 3. Insert doctor profile
      const { error: profileError } = await supabase.from("doctor_profiles").insert({
        user_id: userId,
        full_name: form.fullName,
        dob: form.dob,
        gender: form.gender,
        mobile_number: form.mobile,
        email: form.email,
        languages: form.languages,
        profile_photo_url: profilePhotoUrl,
        signature_url: signatureUrl,
        address_line1: form.addressLine1,
        address_line2: form.addressLine2 || null,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        degree_type: form.degreeType,
        college_name: form.collegeName,
        year_of_completion: form.yearOfCompletion ? parseInt(form.yearOfCompletion) : null,
        degree_certificate_url: degreeCertUrl,
        has_pg_degree: form.hasPgDegree,
        pg_degree_type: form.hasPgDegree ? form.pgDegreeType : null,
        pg_specialization: form.hasPgDegree ? form.pgSpecialization : null,
        pg_college_name: form.hasPgDegree ? form.pgCollegeName : null,
        pg_year_of_completion: form.hasPgDegree && form.pgYearOfCompletion ? parseInt(form.pgYearOfCompletion) : null,
        pg_certificate_url: pgCertUrl,
        primary_specialization: form.primarySpecialization,
        years_of_experience: parseInt(form.yearsOfExperience) || 0,
        areas_of_expertise: form.areasOfExpertise,
        work_history: form.workHistory || null,
        has_clinic: form.hasClinic,
        clinic_name: form.hasClinic ? form.clinicName : null,
        clinic_address: form.hasClinic ? form.clinicAddress : null,
        medical_registration_number: form.medicalRegNumber,
        medical_council_name: form.medicalCouncilName,
        registration_year: form.registrationYear ? parseInt(form.registrationYear) : null,
        medical_certificate_url: medicalCertUrl,
        consultation_fee: parseInt(form.consultationFee) || 500,
      });
      if (profileError) throw profileError;

      toast({ title: "Account created!", description: "Your doctor registration is submitted." });
      navigate("/");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">MediConnect</span>
          </div>
        </div>
      </header>

      <div className="container max-w-4xl py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">Doctor Registration</h1>
          <p className="mt-2 text-muted-foreground">Complete your profile to join MediConnect as a healthcare provider</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="profile" className="gap-1.5">
                <User className="h-4 w-4" /> Profile
              </TabsTrigger>
              <TabsTrigger value="education" className="gap-1.5">
                <GraduationCap className="h-4 w-4" /> Education & Practice
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <DoctorProfileTab form={form} update={update} onContinue={() => setActiveTab("education")} />
            </TabsContent>

            <TabsContent value="education">
              <DoctorEducationTab
                form={form}
                update={update}
                onBack={() => setActiveTab("profile")}
                onSubmit={handleSubmit}
                loading={loading}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default DoctorRegistration;
