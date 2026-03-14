import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { LogIn, Shield } from "lucide-react";

export default function Login() {
  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center bg-secondary/30">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl border border-border p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-brand-forest/10 rounded-2xl flex items-center justify-center mx-auto">
              <Shield className="w-8 h-8 text-brand-forest" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Client Login</h1>
              <p className="text-muted-foreground text-sm">
                Sign in to access your BDE Farm Trac dashboard and manage your farm compliance records.
              </p>
            </div>

            <Button
              className="w-full bg-brand-forest hover:bg-brand-sage text-white py-6 text-base"
              onClick={() => {
                window.location.href = "/dashboard/";
              }}
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign In with Replit
            </Button>

            <p className="text-xs text-muted-foreground">
              Don't have an account?{" "}
              <a href="/contact" className="text-brand-forest hover:underline font-medium">
                Register your interest
              </a>{" "}
              and our team will set you up.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
