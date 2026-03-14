import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { LogIn, Shield, Loader2 } from "lucide-react";
import { useAuth } from "@workspace/replit-auth-web";
import { useLocation } from "wouter";

export default function Login() {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center bg-secondary/30">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-brand-forest mx-auto" />
            <p className="text-muted-foreground">Checking authentication...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (isAuthenticated && user) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center bg-secondary/30">
          <div className="max-w-md w-full mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-xl border border-border p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-brand-forest/10 rounded-2xl flex items-center justify-center mx-auto">
                {user.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt="" className="w-12 h-12 rounded-xl" />
                ) : (
                  <Shield className="w-8 h-8 text-brand-forest" />
                )}
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">Welcome back!</h1>
                <p className="text-muted-foreground text-sm">
                  Signed in as {user.firstName} {user.lastName}
                  {user.email && <span className="block text-xs mt-1">{user.email}</span>}
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full bg-brand-forest hover:bg-brand-sage text-white py-6 text-base"
                  onClick={() => {
                    window.location.href = "/dashboard/";
                  }}
                >
                  Go to Dashboard
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={logout}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

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
              onClick={login}
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign In with Replit
            </Button>

            <p className="text-xs text-muted-foreground">
              Don't have an account?{" "}
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setLocation("/contact"); }}
                className="text-brand-forest hover:underline font-medium"
              >
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
