import { Layout } from "@/components/layout/Layout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Loader2, LifeBuoy, Clock, Mail, Phone } from "lucide-react";
import { motion } from "framer-motion";

const CATEGORIES = [
  { value: "technical", label: "Technical Issue" },
  { value: "billing", label: "Billing & Subscription" },
  { value: "compliance", label: "Red Tractor Compliance" },
  { value: "account", label: "Account & Access" },
  { value: "general", label: "General Enquiry" },
];

interface FormState {
  name: string;
  email: string;
  category: string;
  subject: string;
  description: string;
}

const EMPTY: FormState = { name: "", email: "", category: "technical", subject: "", description: "" };

export default function Support() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  function set(field: keyof FormState, value: string) {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: undefined }));
  }

  function validate() {
    const e: Partial<FormState> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    if (!form.subject.trim()) e.subject = "Required";
    if (form.description.trim().length < 20) e.description = "Please provide at least 20 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const catLabel = CATEGORIES.find(c => c.value === form.category)?.label ?? form.category;
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          subject: `[${catLabel}] ${form.subject.trim()}`,
          description: form.description.trim(),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast({ title: "Submission Failed", description: "Please try again or email us directly.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout>
      <div className="bg-earth-cream min-h-[calc(100vh-88px)] py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-lg mx-auto bg-white p-12 rounded-3xl shadow-xl text-center border border-border"
            >
              <div className="w-20 h-20 bg-brand-pale rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-brand-forest" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Ticket Submitted</h2>
              <p className="text-muted-foreground text-lg mb-8">
                We've received your request. Our team will get back to you at <strong>{form.email}</strong> within one business day.
              </p>
              <Button variant="outline" className="h-12 px-8" onClick={() => { setForm(EMPTY); setSuccess(false); }}>
                Submit Another Ticket
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2">
                <div className="mb-10">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-pale text-brand-forest font-semibold text-sm mb-4">
                    <LifeBuoy className="w-4 h-4" />
                    Customer Support
                  </div>
                  <h1 className="text-4xl font-bold mb-4">Get Help</h1>
                  <p className="text-muted-foreground text-lg">
                    Already a BDE Farm Trac customer? Use this form to raise a support ticket and our team will get back to you promptly.
                  </p>
                </div>

                <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-border">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">Your Name *</label>
                        <Input
                          value={form.name}
                          onChange={(e) => set("name", e.target.value)}
                          className={`h-12 bg-secondary/30 ${errors.name ? "border-destructive" : ""}`}
                          placeholder="John Smith"
                        />
                        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">Email Address *</label>
                        <Input
                          type="email"
                          value={form.email}
                          onChange={(e) => set("email", e.target.value)}
                          className={`h-12 bg-secondary/30 ${errors.email ? "border-destructive" : ""}`}
                          placeholder="john@example.com"
                        />
                        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Category</label>
                      <select
                        value={form.category}
                        onChange={(e) => set("category", e.target.value)}
                        className="w-full h-12 rounded-lg border border-input bg-secondary/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Subject *</label>
                      <Input
                        value={form.subject}
                        onChange={(e) => set("subject", e.target.value)}
                        className={`h-12 bg-secondary/30 ${errors.subject ? "border-destructive" : ""}`}
                        placeholder="Brief description of your issue"
                      />
                      {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Description *</label>
                      <Textarea
                        value={form.description}
                        onChange={(e) => set("description", e.target.value)}
                        className={`min-h-[160px] bg-secondary/30 ${errors.description ? "border-destructive" : ""}`}
                        placeholder="Please describe your issue in detail. Include any error messages, what you expected to happen, and steps you've already tried."
                      />
                      {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                    </div>

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full h-14 text-base bg-brand-forest hover:bg-brand-sage shadow-lg"
                    >
                      {submitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Submitting…</> : "Submit Support Ticket"}
                    </Button>
                  </form>
                </div>
              </div>

              <div className="space-y-5">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
                  <p className="text-sm font-bold text-foreground mb-4">Support Information</p>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <Clock className="w-5 h-5 text-brand-forest mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Response Time</p>
                        <p className="text-xs text-muted-foreground">Within 1 business day, Mon–Fri</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Mail className="w-5 h-5 text-brand-forest mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Email</p>
                        <p className="text-xs text-muted-foreground">support@bdefarmtrac.co.uk</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Phone className="w-5 h-5 text-brand-forest mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Phone</p>
                        <p className="text-xs text-muted-foreground">Available for urgent issues</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-brand-pale rounded-2xl p-6 border border-brand-light/20">
                  <p className="text-sm font-bold text-brand-forest mb-2">Not a customer yet?</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    If you'd like to learn about BDE Farm Trac, register your interest and our team will be in touch.
                  </p>
                  <Button variant="outline" className="w-full text-brand-forest border-brand-forest hover:bg-brand-pale" asChild>
                    <a href="/contact">Register Interest</a>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
