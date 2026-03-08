import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, Phone, Mail, Lock, MapPin, ImageIcon, PenTool, X } from "lucide-react";
import type { DoctorFormData } from "@/pages/DoctorRegistration";
import FileUploadBox from "./FileUploadBox";
import SelectWithOther from "./SelectWithOther";

const LANGUAGES = ["English", "Hindi", "Tamil", "Telugu", "Kannada", "Malayalam", "Bengali", "Marathi", "Gujarati", "Punjabi", "Urdu"];
const STATES = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"];

interface Props {
  form: DoctorFormData;
  update: (field: keyof DoctorFormData, value: any) => void;
  onContinue: () => void;
}

const DoctorProfileTab = ({ form, update, onContinue }: Props) => {
  const [customLang, setCustomLang] = useState("");

  const addLanguage = (lang: string) => {
    if (lang === "__other__") return;
    if (lang && !form.languages.includes(lang)) update("languages", [...form.languages, lang]);
  };
  const removeLanguage = (lang: string) => {
    update("languages", form.languages.filter((l) => l !== lang));
  };
  const addCustomLanguage = () => {
    const trimmed = customLang.trim();
    if (trimmed && !form.languages.includes(trimmed)) {
      update("languages", [...form.languages, trimmed]);
      setCustomLang("");
    }
  };

  const [showOtherLang, setShowOtherLang] = useState(false);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-8">
      {/* Left: Personal Info + Address */}
      <div className="space-y-6 min-w-0">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
          <div className="mt-1 h-px bg-border" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Full Name *</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Dr. John Doe" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Date of Birth *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" type="date" value={form.dob} onChange={(e) => update("dob", e.target.value)} required />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Gender *</Label>
            <SelectWithOther
              value={form.gender}
              onValueChange={(v) => update("gender", v)}
              placeholder="Select gender"
              options={["Male", "Female"]}
              otherPlaceholder="Specify gender..."
            />
          </div>
          <div className="space-y-2">
            <Label>Mobile Number *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" type="tel" placeholder="+91 9876543210" value={form.mobile} onChange={(e) => update("mobile", e.target.value)} required />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Email ID *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" type="email" placeholder="doctor@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Password *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" type="password" placeholder="••••••••" value={form.password} onChange={(e) => update("password", e.target.value)} required minLength={6} />
            </div>
            <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
          </div>
        </div>

        {/* Languages */}
        <div className="space-y-2">
          <Label>Languages *</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {form.languages.map((lang) => (
              <Badge key={lang} variant="secondary" className="gap-1">
                {lang}
                <button type="button" onClick={() => removeLanguage(lang)}><X className="h-3 w-3" /></button>
              </Badge>
            ))}
          </div>
          <Select onValueChange={(v) => {
            if (v === "__other__") {
              setShowOtherLang(true);
            } else {
              addLanguage(v);
            }
          }}>
            <SelectTrigger><SelectValue placeholder="Add language" /></SelectTrigger>
            <SelectContent>
              {LANGUAGES.filter((l) => !form.languages.includes(l)).map((lang) => (
                <SelectItem key={lang} value={lang}>{lang}</SelectItem>
              ))}
              <SelectItem value="__other__">Other</SelectItem>
            </SelectContent>
          </Select>
          {showOtherLang && (
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Type language name..."
                value={customLang}
                onChange={(e) => setCustomLang(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomLanguage(); } }}
                autoFocus
              />
              <Button type="button" size="sm" onClick={() => { addCustomLanguage(); }}>Add</Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => { setShowOtherLang(false); setCustomLang(""); }}>Cancel</Button>
            </div>
          )}
        </div>

        {/* Address */}
        <div>
          <h3 className="text-lg font-semibold text-foreground">Address</h3>
          <div className="mt-1 h-px bg-border" />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Address Line 1 *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Street address" value={form.addressLine1} onChange={(e) => update("addressLine1", e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Address Line 2 (Optional)</Label>
            <Input placeholder="Apartment, suite, etc." value={form.addressLine2} onChange={(e) => update("addressLine2", e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>City *</Label>
              <Input placeholder="Mumbai" value={form.city} onChange={(e) => update("city", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>State *</Label>
              <SelectWithOther
                value={form.state}
                onValueChange={(v) => update("state", v)}
                placeholder="Select state"
                options={STATES}
                otherPlaceholder="Type state name..."
              />
            </div>
            <div className="space-y-2">
              <Label>Pincode *</Label>
              <Input placeholder="400001" value={form.pincode} onChange={(e) => update("pincode", e.target.value)} required />
            </div>
          </div>
        </div>
      </div>

      {/* Right: Photo & Signature */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Profile Photo & Signature</h3>
          <div className="mt-1 h-px bg-border" />
        </div>

        <div className="space-y-2">
          <Label>Profile Photo</Label>
          <FileUploadBox
            icon={<ImageIcon className="h-8 w-8 text-muted-foreground" />}
            label="Upload Photo"
            hint="PNG, JPG up to 5MB"
            file={form.profilePhotoFile}
            onFileChange={(f) => update("profilePhotoFile", f)}
          />
        </div>

        <div className="space-y-2">
          <Label>Signature</Label>
          <FileUploadBox
            icon={<PenTool className="h-8 w-8 text-muted-foreground" />}
            label="Upload Signature"
            hint="PNG, JPG up to 5MB"
            file={form.signatureFile}
            onFileChange={(f) => update("signatureFile", f)}
          />
        </div>
      </div>

      {/* Continue button */}
      <div className="col-span-full flex justify-end pt-4">
        <Button onClick={onContinue} className="rounded-full px-8">Continue to Education</Button>
      </div>
    </div>
  );
};

export default DoctorProfileTab;
