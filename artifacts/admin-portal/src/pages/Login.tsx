import { useState } from "react";
import { setSecret } from "@/lib/auth";
import { api } from "@/lib/api";
import { ShieldCheck } from "lucide-react";

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [secret, setSecretValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!secret.trim()) return;
    setLoading(true);
    setError("");
    try {
      await api.verifySecret(secret.trim());
      setSecret(secret.trim());
      onLogin();
    } catch {
      setError("Invalid admin secret. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="w-full max-w-sm">
        <div className="bg-card border border-border rounded-2xl shadow-lg p-8">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-primary" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-center text-foreground mb-1">BDE Admin Portal</h1>
          <p className="text-sm text-muted-foreground text-center mb-8">
            Platform management. Authorised access only.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                Admin Secret
              </label>
              <input
                type="password"
                value={secret}
                onChange={(e) => setSecretValue(e.target.value)}
                placeholder="Enter admin secret"
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading || !secret.trim()}
              className="w-full h-10 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Verifying..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
