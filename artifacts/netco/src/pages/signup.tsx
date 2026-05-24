import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Signup() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !password.trim()) {
      toast({ title: "Fill in required fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setDone(true);
  };

  if (done) {
    return (
      <div className="min-h-screen pt-16 pb-20 px-4 flex items-center justify-center">
        <div className="glass-card rounded-xl p-10 max-w-md w-full text-center space-y-5" data-testid="signup-success">
          <CheckCircle className="w-16 h-16 text-success mx-auto" />
          <h2 className="text-2xl font-heading font-bold">Account Created!</h2>
          <p className="text-muted-foreground text-sm">Account login will be fully enabled soon. In the meantime, you can purchase configs directly — no account required.</p>
          <Link href="/pricing">
            <Button className="bg-primary text-primary-foreground w-full glow-primary-hover">Browse Plans</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 pb-20 px-4 flex items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 border border-primary/30 glow-primary mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-heading font-bold">Create Account</h1>
          <p className="text-muted-foreground text-sm">Join NETCO — manage your configs in one place</p>
        </div>

        <div className="glass-card rounded-xl p-6 space-y-5" data-testid="signup-form">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
              <Input id="name" placeholder="John Mwangi" value={name} onChange={(e) => setName(e.target.value)} className="bg-card border-border focus:border-primary h-11" data-testid="input-name" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number <span className="text-destructive">*</span></Label>
              <Input id="phone" type="tel" placeholder="0712345678" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-card border-border focus:border-primary h-11" data-testid="input-phone" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input id="email" type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-card border-border focus:border-primary h-11" data-testid="input-email" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-card border-border focus:border-primary h-11 pr-10"
                  data-testid="input-password"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              By signing up you agree to our{" "}
              <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>.
            </p>

            <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-primary-hover h-11" data-testid="button-signup">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating Account...</> : "Create Account"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
