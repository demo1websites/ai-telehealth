import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, ArrowLeft, IndianRupee, Upload } from "lucide-react";
import type { DoctorFormData } from "@/pages/DoctorRegistration";
import FileUploadBox from "./FileUploadBox";

const DEGREE_TYPES = ["MBBS", "BDS", "BAMS", "BHMS", "BUMS", "BPT", "B.Sc Nursing"];
const PG_DEGREE_TYPES = ["MD", "MS", "MDS", "DNB", "DM", "MCh", "M.Sc"];
const SPECIALIZATIONS = ["General Medicine", "General Surgery", "Pediatrics", "Orthopedics", "Cardiology", "Dermatology", "Psychiatry", "Gynecology", "Ophthalmology", "ENT", "Neurology", "Gastroenterology", "Pulmonology", "Nephrology", "Urology", "Oncology", "Radiology", "Anesthesiology", "Emergency Medicine", "Family Medicine"];
const AREAS_OF_EXPERTISE = ["General Medicine", "General Surgery", "Pediatrics", "Orthopedics", "Cardiology", "Dermatology", "Psychiatry", "Gynecology", "Ophthalmology", "ENT", "Neurology", "Gastroenterology"];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 50 }, (_, i) => String(currentYear - i));

interface Props {
  form: DoctorFormData;
  update: (field: keyof DoctorFormData, value: any) => void;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
}

const DoctorEducationTab = ({ form, update, onBack, onSubmit, loading }: Props) => {
  const toggleExpertise = (area: string) => {
    if (form.areasOfExpertise.includes(area)) {
      update("areasOfExpertise", form.areasOfExpertise.filter((a) => a !== area));
    } else {
      update("areasOfExpertise", [...form.areasOfExpertise, area]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Foundational Medical Qualification */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <GraduationCap className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Foundational Medical Qualification</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Degree Type *</Label>
            <Select value={form.degreeType} onValueChange={(v) => update("degreeType", v)}>
              <SelectTrigger><SelectValue placeholder="Select degree" /></SelectTrigger>
              <SelectContent>
                {DEGREE_TYPES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>College / University Name *</Label>
            <Input placeholder="AIIMS Delhi" value={form.collegeName} onChange={(e) => update("collegeName", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Year of Completion *</Label>
            <Select value={form.yearOfCompletion} onValueChange={(v) => update("yearOfCompletion", v)}>
              <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
              <SelectContent>
                {years.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Upload Degree Certificate</Label>
          <FileUploadBox
            icon={<Upload className="h-6 w-6 text-muted-foreground" />}
            label="Upload certificate (PDF/Image, max 10MB)"
            hint=""
            file={form.degreeCertificateFile}
            onFileChange={(f) => update("degreeCertificateFile", f)}
            accept="image/png,image/jpeg,application/pdf"
          />
        </div>
      </div>

      {/* Post-Graduate */}
      <div className="rounded-lg border border-border p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={form.hasPgDegree}
            onCheckedChange={(v) => update("hasPgDegree", !!v)}
          />
          <span className="font-medium text-foreground">I have a Post-Graduate Degree</span>
        </div>

        {form.hasPgDegree && (
          <div className="rounded-lg border border-border p-4 space-y-4">
            <h4 className="font-semibold text-foreground">Post-Graduate / Specialization</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>PG Degree Type *</Label>
                <Select value={form.pgDegreeType} onValueChange={(v) => update("pgDegreeType", v)}>
                  <SelectTrigger><SelectValue placeholder="Select PG degree" /></SelectTrigger>
                  <SelectContent>
                    {PG_DEGREE_TYPES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Specialization *</Label>
                <Select value={form.pgSpecialization} onValueChange={(v) => update("pgSpecialization", v)}>
                  <SelectTrigger><SelectValue placeholder="Select specialization" /></SelectTrigger>
                  <SelectContent>
                    {SPECIALIZATIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>College Name *</Label>
                <Input placeholder="PG College/Hospital" value={form.pgCollegeName} onChange={(e) => update("pgCollegeName", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Year of Completion *</Label>
                <Select value={form.pgYearOfCompletion} onValueChange={(v) => update("pgYearOfCompletion", v)}>
                  <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                  <SelectContent>
                    {years.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Upload PG Certificate</Label>
              <FileUploadBox
                icon={<Upload className="h-6 w-6 text-muted-foreground" />}
                label="Upload certificate (PDF/Image, max 10MB)"
                hint=""
                file={form.pgCertificateFile}
                onFileChange={(f) => update("pgCertificateFile", f)}
                accept="image/png,image/jpeg,application/pdf"
              />
            </div>
          </div>
        )}
      </div>

      {/* Expertise & Experience */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Expertise & Experience</h3>
        <div className="h-px bg-border" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Primary Specialization *</Label>
            <Select value={form.primarySpecialization} onValueChange={(v) => update("primarySpecialization", v)}>
              <SelectTrigger><SelectValue placeholder="Select specialization" /></SelectTrigger>
              <SelectContent>
                {SPECIALIZATIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Total Years of Experience *</Label>
            <Input type="number" placeholder="5" value={form.yearsOfExperience} onChange={(e) => update("yearsOfExperience", e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Areas of Expertise</Label>
          <div className="flex flex-wrap gap-2">
            {AREAS_OF_EXPERTISE.map((area) => (
              <Badge
                key={area}
                variant={form.areasOfExpertise.includes(area) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleExpertise(area)}
              >
                {area}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Work History (Optional)</Label>
          <Textarea placeholder="Previous hospitals, clinics, or positions held..." value={form.workHistory} onChange={(e) => update("workHistory", e.target.value)} rows={3} />
        </div>
      </div>

      {/* Practice toggle */}
      <div className="rounded-lg border border-border p-4 flex items-center justify-between">
        <div>
          <p className="font-medium text-foreground">Do you currently practice at a clinic or hospital?</p>
          <p className="text-sm text-muted-foreground">Toggle this if you have a physical practice location</p>
        </div>
        <Switch checked={form.hasClinic} onCheckedChange={(v) => update("hasClinic", v)} />
      </div>

      {form.hasClinic && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Clinic/Hospital Name</Label>
            <Input value={form.clinicName} onChange={(e) => update("clinicName", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Clinic Address</Label>
            <Input value={form.clinicAddress} onChange={(e) => update("clinicAddress", e.target.value)} />
          </div>
        </div>
      )}

      {/* Medical Registration */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Medical Registration Details (Mandatory)</h3>
        <div className="h-px bg-border" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Medical Registration Number *</Label>
            <Input placeholder="MCI/12345" value={form.medicalRegNumber} onChange={(e) => update("medicalRegNumber", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Medical Council Name *</Label>
            <Input placeholder="Maharashtra Medical Council" value={form.medicalCouncilName} onChange={(e) => update("medicalCouncilName", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Registration Year *</Label>
            <Select value={form.registrationYear} onValueChange={(v) => update("registrationYear", v)}>
              <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
              <SelectContent>
                {years.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Upload Medical Registration Certificate *</Label>
          <FileUploadBox
            icon={<Upload className="h-6 w-6 text-muted-foreground" />}
            label="Upload certificate (PDF/Image, max 10MB)"
            hint=""
            file={form.medicalCertificateFile}
            onFileChange={(f) => update("medicalCertificateFile", f)}
            accept="image/png,image/jpeg,application/pdf"
          />
        </div>
      </div>

      {/* Consultation Fee */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Consultation Fee</h3>
        <div className="h-px bg-border" />
        <div className="space-y-2 max-w-xs">
          <Label>Fee per Consultation (₹)</Label>
          <div className="relative">
            <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" type="number" placeholder="500" value={form.consultationFee} onChange={(e) => update("consultationFee", e.target.value)} />
          </div>
          <p className="text-xs text-muted-foreground">Note: This can be changed later in your profile settings.</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Profile
        </Button>
        <Button onClick={onSubmit} disabled={loading} className="rounded-full px-8">
          {loading ? "Creating Account…" : "Create Account"}
        </Button>
      </div>
    </div>
  );
};

export default DoctorEducationTab;
