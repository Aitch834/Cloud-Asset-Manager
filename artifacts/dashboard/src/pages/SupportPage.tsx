import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Loader2, LifeBuoy, Clock, MessageSquare } from "lucide-react";

const CATEGORIES = [
  { value: "technical", label: "Technical Issue" },
  { value: "billing", label: "Billing & Subscription" },
  { value: "compliance", label: "Red Tractor Compliance" },
  { value: "account", label: "Account & Access" },
  { value: "data", label: "Data & Records" },
  { value: "general", label: "General Enquiry" },
];

interface FormState {
  name: string;
  email: string;
  category: string;
  subject: string;
  description: string;
}

const EMPTY: FormState = {
  name: "",
  email: "",
  category: "technical",
  subject: "",
  description: "",
};

function InfoCard({ icon: Icon, title, body }: { icon: React.ComponentType<{className?: string}>; title: string; body: string }) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{body}</p>
      </div>
    </div>
  );
}

export default function SupportPage() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const e: Partial<FormState> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    if (!form.subject.trim()) e.subject = "Required";
    if (!form.description.trim() || form.description.trim().length < 20) e.description = "Please provide at least 20 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const body = {
        name: form.name.trim(),
        email: form.email.trim(),
        subject: `[${CATEGORIES.find(c => c.value === form.category)?.label ?? form.category}] ${form.subject.trim()}`,
        description: form.description.trim(),
      };
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed");
      setSuccess(true);
    } catch {
      toast({ title: "Submission Failed", description: "Please try again or contact us directly.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <LifeBuoy className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Raise a Support Ticket</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Describe your issue and our team will get back to you, usually within one business day.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {success ? (
              <Card className="p-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Ticket Submitted</h2>
                <p className="text-muted-foreground text-sm mb-6">
                  We've received your request and will reply to <strong>{form.email}</strong> shortly.
                </p>
                <Button variant="outline" onClick={() => { setForm(EMPTY); setSuccess(false); }}>
                  Submit Another
                </Button>
              </Card>
            ) : (
              <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Your Name *</label>
                      <Input
                        value={form.name}
                        onChange={(e) => set("name", e.target.value)}
                        placeholder="John Smith"
                        className={errors.name ? "border-destructive" : ""}
                      />
                      {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Email Address *</label>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => set("email", e.target.value)}
                        placeholder="john@example.com"
                        className={errors.email ? "border-destructive" : ""}
                      />
                      {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => set("category", e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Subject *</label>
                    <Input
                      value={form.subject}
                      onChange={(e) => set("subject", e.target.value)}
                      placeholder="Brief description of your issue"
                      className={errors.subject ? "border-destructive" : ""}
                    />
                    {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Description *</label>
                    <Textarea
                      value={form.description}
                      onChange={(e) => set("description", e.target.value)}
                      placeholder="Please describe your issue in as much detail as possible. Include any error messages, steps you've already tried, and what you expected to happen."
                      rows={6}
                      className={errors.description ? "border-destructive" : ""}
                    />
                    {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                    <p className="text-xs text-muted-foreground">{form.description.length} characters</p>
                  </div>

                  <Button type="submit" className="w-full h-11" disabled={submitting}>
                    {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting…</> : "Submit Ticket"}
                  </Button>
                </form>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <Card className="p-4 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">What to Expect</p>
              <InfoCard icon={Clock} title="Response Time" body="We aim to respond within 1 business day, Mon–Fri." />
              <InfoCard icon={MessageSquare} title="Follow-up" body="Replies will be sent to the email address you provide." />
              <InfoCard icon={LifeBuoy} title="Help Centre" body="Check the Help Centre for instant answers to common questions." />
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
