import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function Login() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (import.meta.env.VITE_DEV_BYPASS_AUTH === "true") {
      setLocation("/select");
    }
  }, [setLocation]);

  const handleLogin = () => {
    window.location.href = `/api/login?returnTo=${encodeURIComponent(import.meta.env.BASE_URL + 'select')}`;
  };

  if (import.meta.env.VITE_DEV_BYPASS_AUTH === "true") {
    return null;
  }

  return (
    <div className="min-h-screen w-full flex bg-background">
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-10 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/25">
               <img src={`${import.meta.env.BASE_URL}images/logo-icon.png`} alt="Logo" className="w-8 h-8 object-contain" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground">BDE Farm Trac</h1>
          </div>
          
          <h2 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-4">
            Farm compliance, <br/><span className="text-primary">simplified.</span>
          </h2>
          <p className="text-lg text-foreground/60 mb-10 leading-relaxed">
            Manage your Red Tractor records, livestock, fields, and equipment in one beautiful, secure platform.
          </p>

          <Button 
            size="lg" 
            className="w-full text-lg shadow-xl"
            onClick={handleLogin}
          >
            Continue with Replit
          </Button>

          <p className="text-center text-sm text-foreground/40 mt-8">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>

      <div className="hidden lg:block lg:w-1/2 relative p-4">
        <div className="w-full h-full rounded-3xl overflow-hidden relative shadow-2xl">
          <img 
            src={`${import.meta.env.BASE_URL}images/auth-bg.png`} 
            alt="Farm aerial view" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          <div className="absolute bottom-12 left-12 right-12 text-white">
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-sm font-medium mb-4">
              Trusted by 10,000+ UK Farms
            </div>
            <p className="text-2xl font-display font-medium leading-snug">
              "BDE Farm Trac transformed how we handle our audits. It's incredibly intuitive and saves us days of paperwork."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
