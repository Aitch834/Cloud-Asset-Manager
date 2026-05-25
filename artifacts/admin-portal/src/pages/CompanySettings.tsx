import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { getSecret } from "@/lib/auth";
import { Building2, CreditCard, Save, Loader2, ImageIcon, X, Upload, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";

const CONFIG_KEYS = [
  "company.legalName",
  "company.tradingName",
  "company.address",
  "company.email",
  "company.vatNumber",
  "company.registrationNumber",
  "company.bankName",
  "company.bankAccountName",
  "company.bankSortCode",
  "company.bankAccountNumber",
  "company.paymentTermsDays",
  "company.logoDataUrl",
] as const;

type ConfigKey = typeof CONFIG_KEYS[number];

const DEFAULTS: Record<ConfigKey, string> = {
  "company.legalName": "Barnett Davies Enterprises Ltd",
  "company.tradingName": "BDE Farm Trac",
  "company.address": "",
  "company.email": "hello@bdefarmtrac.co.uk",
  "company.vatNumber": "",
  "company.registrationNumber": "",
  "company.bankName": "",
  "company.bankAccountName": "",
  "company.bankSortCode": "",
  "company.bankAccountNumber": "",
  "company.paymentTermsDays": "14",
  "company.logoDataUrl": "",
};

const PAYMENT_TERMS = ["7", "14", "21", "30", "45", "60", "90"];

function SectionTitle({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 pb-4 border-b border-border mb-5">
      <div className="w-9 h-9 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-green-700" />
      </div>
      <div>
        <h3 className="font-semibold text-base text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function CompanySettings() {
  const secret = getSecret() ?? "";
  const [form, setForm] = useState<Record<ConfigKey, string>>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getPlatformConfig(secret);
        const map: Record<string, string> = {};
        for (const item of data.items) map[item.key] = item.currentValue ?? item.defaultValue ?? "";
        setForm(prev => {
          const next = { ...prev };
          for (const key of CONFIG_KEYS) {
            if (map[key] !== undefined) next[key] = map[key];
          }
          return next;
        });
        if (map["company.logoDataUrl"]) setLogoPreview(map["company.logoDataUrl"]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load settings");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function set(key: ConfigKey, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function handleLogoFile(file: File) {
    if (file.size > 500 * 1024) {
      setError("Logo file must be under 500 KB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Please select a PNG, JPG or WebP image.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setLogoPreview(dataUrl);
      set("company.logoDataUrl", dataUrl);
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await Promise.all(
        CONFIG_KEYS.map(key =>
          form[key].trim()
            ? api.setPlatformConfig(key, form[key], secret)
            : api.resetPlatformConfig(key, secret).catch(() => {})
        )
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading settings…
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-green-700" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Company & Billing Details</h1>
          <p className="text-sm text-muted-foreground">
            Business information and branding used on all platform invoices sent to customers.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 space-y-8">

        {/* ── Business Identity ── */}
        <div className="bg-card border border-border rounded-xl p-6">
          <SectionTitle
            icon={Building2}
            title="Business Identity"
            description="Appears at the top of every invoice as the issuing company."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Legal Business Name" hint="The registered company name on Companies House">
              <input
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g. Barnett Davies Enterprises Ltd"
                value={form["company.legalName"]}
                onChange={e => set("company.legalName", e.target.value)}
              />
            </Field>
            <Field label="Trading / Product Name" hint="Shown as a sub-label under the logo">
              <input
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g. BDE Farm Trac"
                value={form["company.tradingName"]}
                onChange={e => set("company.tradingName", e.target.value)}
              />
            </Field>
            <Field label="Registered Address" hint="Full address shown on invoices">
              <textarea
                rows={4}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                placeholder={"e.g.\n15 Business Park\nCardiff\nCF10 1AB\nUnited Kingdom"}
                value={form["company.address"]}
                onChange={e => set("company.address", e.target.value)}
              />
            </Field>
            <Field label="Contact Email" hint="Shown on invoices for customer queries">
              <input
                type="email"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g. hello@bdefarmtrac.co.uk"
                value={form["company.email"]}
                onChange={e => set("company.email", e.target.value)}
              />
            </Field>
          </div>
        </div>

        {/* ── Company Registration ── */}
        <div className="bg-card border border-border rounded-xl p-6">
          <SectionTitle
            icon={Receipt}
            title="Company Registration"
            description="Legal registration numbers printed in the invoice footer."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Companies House Number" hint="8-digit registration number">
              <input
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g. 12345678"
                value={form["company.registrationNumber"]}
                onChange={e => set("company.registrationNumber", e.target.value)}
              />
            </Field>
            <Field label="VAT Registration Number" hint="Shown on all VAT invoices">
              <input
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g. GB 123 4567 89"
                value={form["company.vatNumber"]}
                onChange={e => set("company.vatNumber", e.target.value)}
              />
            </Field>
          </div>
        </div>

        {/* ── Bank Details ── */}
        <div className="bg-card border border-border rounded-xl p-6">
          <SectionTitle
            icon={CreditCard}
            title="Bank Details"
            description="BACS payment details shown in the invoice footer so customers know where to send payment."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Bank Name">
              <input
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g. Barclays Bank PLC"
                value={form["company.bankName"]}
                onChange={e => set("company.bankName", e.target.value)}
              />
            </Field>
            <Field label="Account Name">
              <input
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g. Barnett Davies Enterprises Ltd"
                value={form["company.bankAccountName"]}
                onChange={e => set("company.bankAccountName", e.target.value)}
              />
            </Field>
            <Field label="Sort Code" hint="Format: 00-00-00">
              <input
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g. 20-18-76"
                value={form["company.bankSortCode"]}
                onChange={e => set("company.bankSortCode", e.target.value)}
              />
            </Field>
            <Field label="Account Number">
              <input
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g. 87654321"
                value={form["company.bankAccountNumber"]}
                onChange={e => set("company.bankAccountNumber", e.target.value)}
              />
            </Field>
            <div className="md:col-span-2">
              <Field label="Default Payment Terms" hint="Invoice footer will read 'Payment due within X days of invoice date'">
                <select
                  className="w-full max-w-xs rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={form["company.paymentTermsDays"]}
                  onChange={e => set("company.paymentTermsDays", e.target.value)}
                >
                  {PAYMENT_TERMS.map(d => (
                    <option key={d} value={d}>{d} days</option>
                  ))}
                </select>
              </Field>
            </div>
          </div>
        </div>

        {/* ── Logo ── */}
        <div className="bg-card border border-border rounded-xl p-6">
          <SectionTitle
            icon={ImageIcon}
            title="Invoice Logo"
            description="Appears top-left on all printed and preview invoices. PNG or JPG, max 500 KB. Recommended landscape format (e.g. 400 × 120 px)."
          />
          <div className="flex items-start gap-6">
            {logoPreview ? (
              <div className="relative border border-border rounded-lg p-3 bg-muted/30">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="max-w-[220px] max-h-[80px] object-contain"
                />
                <button
                  type="button"
                  onClick={() => { setLogoPreview(""); set("company.logoDataUrl", ""); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-green-400 transition-colors min-w-[200px]"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">Click to upload</p>
              </div>
            )}
            <div className="flex flex-col gap-2 mt-1">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-3.5 h-3.5" />
                {logoPreview ? "Replace Logo" : "Upload Logo"}
              </Button>
              {logoPreview && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-destructive hover:text-destructive"
                  onClick={() => { setLogoPreview(""); set("company.logoDataUrl", ""); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                >
                  <X className="w-3.5 h-3.5" />Remove
                </Button>
              )}
              <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                Stored securely and embedded directly into invoice previews.
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleLogoFile(f); }}
          />
        </div>

      </div>

      {/* ── Save ── */}
      <div className="mt-6 flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving} className="gap-2 bg-green-800 hover:bg-green-900">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving…" : "Save Changes"}
        </Button>
        {saved && (
          <span className="text-sm text-green-700 font-medium">✓ Saved successfully</span>
        )}
        {error && !saving && (
          <span className="text-sm text-red-600">{error}</span>
        )}
      </div>
    </div>
  );
}
