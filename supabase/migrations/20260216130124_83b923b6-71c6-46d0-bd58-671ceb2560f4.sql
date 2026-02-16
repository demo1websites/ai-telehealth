
-- Doctor profiles table for extended doctor-specific data
CREATE TABLE public.doctor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  -- Personal Information
  full_name TEXT NOT NULL,
  dob DATE NOT NULL,
  gender TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  email TEXT NOT NULL,
  languages TEXT[] NOT NULL DEFAULT '{}',
  profile_photo_url TEXT,
  signature_url TEXT,
  -- Address
  address_line1 TEXT NOT NULL DEFAULT '',
  address_line2 TEXT,
  city TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT '',
  pincode TEXT NOT NULL DEFAULT '',
  -- Foundational Medical Qualification
  degree_type TEXT NOT NULL DEFAULT '',
  college_name TEXT NOT NULL DEFAULT '',
  year_of_completion INT,
  degree_certificate_url TEXT,
  -- Post-Graduate (optional)
  has_pg_degree BOOLEAN NOT NULL DEFAULT false,
  pg_degree_type TEXT,
  pg_specialization TEXT,
  pg_college_name TEXT,
  pg_year_of_completion INT,
  pg_certificate_url TEXT,
  -- Expertise & Experience
  primary_specialization TEXT NOT NULL DEFAULT '',
  years_of_experience INT NOT NULL DEFAULT 0,
  areas_of_expertise TEXT[] NOT NULL DEFAULT '{}',
  work_history TEXT,
  -- Practice
  has_clinic BOOLEAN NOT NULL DEFAULT false,
  clinic_name TEXT,
  clinic_address TEXT,
  -- Medical Registration
  medical_registration_number TEXT NOT NULL DEFAULT '',
  medical_council_name TEXT NOT NULL DEFAULT '',
  registration_year INT,
  medical_certificate_url TEXT,
  -- Consultation
  consultation_fee INT NOT NULL DEFAULT 500,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can insert own doctor profile"
  ON public.doctor_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own doctor profile"
  ON public.doctor_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own doctor profile"
  ON public.doctor_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all doctor profiles"
  ON public.doctor_profiles FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all doctor profiles"
  ON public.doctor_profiles FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_doctor_profiles_updated_at
  BEFORE UPDATE ON public.doctor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for doctor documents
INSERT INTO storage.buckets (id, name, public) VALUES ('doctor-documents', 'doctor-documents', true);

-- Storage policies
CREATE POLICY "Authenticated users can upload doctor documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'doctor-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own doctor documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'doctor-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all doctor documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'doctor-documents' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view doctor documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'doctor-documents');
