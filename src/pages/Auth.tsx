import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, User, Shield, Stethoscope } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type RoleTab = "patient" | "admin" | "doctor";

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [activeRole, setActiveRole] = useState<RoleTab>("patient");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    dob: "",
    mobile: "",
    email: "",
    password: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        toast({ title: "Welcome back!", description: "You have signed in successfully." });
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              full_name: form.fullName,
              dob: form.dob,
              mobile_number: form.mobile,
              role: activeRole,
            },
          },
        });
        if (error) throw error;
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Heart className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">MediConnect</CardTitle>
          <CardDescription>
            {isLogin ? "Sign in to your account" : "Create a new account"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Role tabs — only show on signup */}
          {!isLogin && (
            <Tabs
              value={activeRole}
              onValueChange={(v) => setActiveRole(v as RoleTab)}
              className="mb-6"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="patient" className="gap-1.5">
                  <User className="h-4 w-4" /> Patient
                </TabsTrigger>
                <TabsTrigger value="doctor" className="gap-1.5">
                  <Stethoscope className="h-4 w-4" /> Doctor
                </TabsTrigger>
              <TabsTrigger value="admin" className="gap-1.5">
                  <Shield className="h-4 w-4" /> Admin
                </TabsTrigger>
              </TabsList>

              {/* Doctor tab — placeholder */}
              <TabsContent value="doctor">
                <div className="rounded-lg border border-dashed border-border bg-muted/50 p-8 text-center">
                  <Stethoscope className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">
                    Doctor Registration
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Coming soon. Contact admin for doctor onboarding.
                  </p>
                </div>
              </TabsContent>

              {/* Patient & Admin forms share the same layout */}
              {(["patient", "admin"] as const).map((role) => (
                <TabsContent key={role} value={role}>
                  <RegistrationForm
                    form={form}
                    update={update}
                    onSubmit={handleSubmit}
                    loading={loading}
                    role={role}
                  />
                </TabsContent>
              ))}
            </Tabs>
          )}

          {/* Login form */}
          {isLogin && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in…" : "Sign In"}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/* ---------- Registration sub-form ---------- */

interface RegFormProps {
  form: { fullName: string; dob: string; mobile: string; email: string; password: string };
  update: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  role: "patient" | "admin";
}

const RegistrationForm = ({ form, update, onSubmit, loading, role }: RegFormProps) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div className="space-y-2">
      <Label>Full Name</Label>
      <Input
        placeholder="John Doe"
        value={form.fullName}
        onChange={(e) => update("fullName", e.target.value)}
        required
      />
    </div>
    <div className="space-y-2">
      <Label>Date of Birth</Label>
      <Input
        type="date"
        value={form.dob}
        onChange={(e) => update("dob", e.target.value)}
        required
      />
    </div>
    <div className="space-y-2">
      <Label>Mobile Number</Label>
      <Input
        type="tel"
        placeholder="+91 98765 43210"
        value={form.mobile}
        onChange={(e) => update("mobile", e.target.value)}
        required
      />
    </div>
    <div className="space-y-2">
      <Label>Email</Label>
      <Input
        type="email"
        placeholder="you@example.com"
        value={form.email}
        onChange={(e) => update("email", e.target.value)}
        required
      />
    </div>
    <div className="space-y-2">
      <Label>Password</Label>
      <Input
        type="password"
        placeholder="••••••••"
        value={form.password}
        onChange={(e) => update("password", e.target.value)}
        required
        minLength={6}
      />
    </div>
    <Button type="submit" className="w-full" disabled={loading}>
      {loading ? "Creating account…" : `Sign Up as ${role === "patient" ? "Patient" : "Admin"}`}
    </Button>
  </form>
);

export default Auth;
