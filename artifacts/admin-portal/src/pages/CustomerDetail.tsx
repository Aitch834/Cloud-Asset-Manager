import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { api, type Tenant, type Farm, type Subscription, type TenantUser, type Module } from "@/lib/api";
import { getSecret } from "@/lib/auth";
import {
  ArrowLeft, MapPin, CreditCard, Users, CheckCircle, XCircle, Building2,
  FileDown, Loader2, Mail, MailCheck, Bell, BellOff, Gift, Share2, Copy,
  TrendingDown, RotateCcw, AlertTriangle, Zap, Plus, Trash2, Package, Pencil, X,
} from "lucide-react";

const UK_POSTCODE_RE = /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/i;

function normalisePostcode(raw: string): string {
  const stripped = raw.replace(/\s+/g, "").toUpperCase();
  if (stripped.length > 3) return stripped.slice(0, -3) + " " + stripped.slice(-3);
  return raw.toUpperCase();
}

interface FarmEditDialogProps {
  farm: Farm;
  tenantId: number;
  onClose: () => void;
  onSaved: (updated: Farm) => void;
}

function FarmEditDialog({ farm, tenantId, onClose, onSaved }: FarmEditDialogProps) {
  const secret = getSecret()!;
  const [name, setName] = useState(farm.name);
  const [address, setAddress] = useState(farm.address ?? "");
  const [postcode, setPostcode] = useState(farm.postcode ?? "");
  const [cphNumber, setCphNumber] = useState(farm.cphNumber ?? "");
  const [sbiNumber, setSbiNumber] = useState(farm.sbiNumber ?? "");
  const [postcodeBlurred, setPostcodeBlurred] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const postcodeVal = postcode.trim();
  const postcodeWarn =
    postcodeBlurred &&
    postcodeVal.length > 0 &&
    !UK_POSTCODE_RE.test(postcodeVal);

  async function handleSave() {
    const normalisedPostcode = postcodeVal ? normalisePostcode(postcodeVal) : "";
    setPostcode(normalisedPostcode);
    setPostcodeBlurred(true);

    if (!name.trim()) { setError("Farm name cannot be empty"); return; }
    setSaving(true);
    setError(null);
    try {
      const result = await api.updateFarm(tenantId, farm.id, {
        name: name.trim(),
        address: address.trim() || null,
        postcode: normalisedPostcode || null,
        cphNumber: cphNumber.trim() || null,
        sbiNumber: sbiNumber.trim() || null,
      }, secret);
      onSaved(result.farm);
      onClose();
    } catch (e) {
      setError("Failed to save. Please try again.");
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-bold text-foreground">Edit Farm Details</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
              Farm Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="e.g. Home Farm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
              Address
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder="Street, town or village"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
              Postcode
            </label>
            <input
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              onBlur={() => {
                setPostcodeBlurred(true);
                if (postcode.trim()) setPostcode(normalisePostcode(postcode));
              }}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="e.g. DT1 1AA"
            />
            {postcodeWarn && (
              <p className="mt-1.5 text-xs text-amber-600 flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                This doesn't look like a valid UK postcode (e.g. DT1 1AA). You can still save if you're sure.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                CPH Number
              </label>
              <input
                value={cphNumber}
                onChange={(e) => setCphNumber(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g. 12/345/6789"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                SBI Number
              </label>
              <input
                value={sbiNumber}
                onChange={(e) => setSbiNumber(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g. 123456789"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{title}</h2>
      {children}
    </div>
  );
}

function UserRow({ user, tenantId, isLast, systemRoles, onUpdated }: {
  user: TenantUser;
  tenantId: number;
  isLast: boolean;
  systemRoles: Array<{ id: number; name: string }>;
  onUpdated: (updated: TenantUser) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [savingRole, setSavingRole] = useState(false);

  async function toggleAlerts() {
    setSaving(true);
    try {
      const secret = getSecret();
      await api.updateUserReceiveAlerts(tenantId, user.userId ?? "", !user.receiveAlerts, secret ?? "");
      onUpdated({ ...user, receiveAlerts: !user.receiveAlerts });
    } catch {
    } finally {
      setSaving(false);
    }
  }

  async function handleRoleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    const roleId = val === "" ? null : parseInt(val, 10);
    const roleName = val === "" ? null : (systemRoles.find((r) => r.id === roleId)?.name ?? null);
    setSavingRole(true);
    try {
      const secret = getSecret();
      await api.updateUserRole(tenantId, user.userId ?? "", roleId, secret ?? "");
      onUpdated({ ...user, roleId: roleId ?? 0, roleName });
    } catch {
    } finally {
      setSavingRole(false);
    }
  }

  return (
    <div className={`px-5 py-3.5 flex items-center gap-3 ${!isLast ? "border-b border-border" : ""}`}>
      <Users className="w-4 h-4 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
      </div>
      <div className="relative">
        {savingRole && <Loader2 className="absolute right-6 top-1/2 -translate-y-1/2 w-3 h-3 animate-spin text-muted-foreground pointer-events-none" />}
        <select
          value={user.roleId ?? ""}
          onChange={handleRoleChange}
          disabled={savingRole}
          className="text-xs border border-border rounded-md px-2 py-1 bg-background text-foreground appearance-none pr-6 focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
        >
          <option value="">— No role —</option>
          {systemRoles.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>
      <button
        onClick={toggleAlerts}
        disabled={saving}
        title={user.receiveAlerts ? "Receives critical alerts — click to remove" : "Does not receive alerts — click to enable"}
        className={`flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full transition-colors ${
          user.receiveAlerts
            ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
            : "bg-muted text-muted-foreground hover:bg-muted/80"
        }`}
      >
        {saving ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : user.receiveAlerts ? (
          <Bell className="w-3 h-3" />
        ) : (
          <BellOff className="w-3 h-3" />
        )}
        {user.receiveAlerts ? "Receives alerts" : "No alerts"}
      </button>
      {user.isActive ? (
        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 text-destructive shrink-0" />
      )}
    </div>
  );
}

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "success" | "destructive" | "warning" }) {
  const colors = {
    default: "bg-muted text-muted-foreground",
    success: "bg-green-100 text-green-700",
    destructive: "bg-red-100 text-red-700",
    warning: "bg-amber-100 text-amber-700",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[variant]}`}>
      {children}
    </span>
  );
}

function statusVariant(status: string): "success" | "destructive" | "warning" | "default" {
  if (status === "active") return "success";
  if (status === "cancelled") return "destructive";
  if (status === "past_due") return "warning";
  if (status === "trial") return "warning";
  return "default";
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

interface ChurnDialogProps {
  tenantId: number;
  tenant: Tenant;
  onClose: () => void;
  onSaved: (t: Tenant) => void;
}

function ChurnDialog({ tenantId, onClose, onSaved }: ChurnDialogProps) {
  const secret = getSecret()!;
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleChurn() {
    setSaving(true);
    try {
      const result = await api.updateTenant(tenantId, {
        cancelledAt: new Date().toISOString(),
        cancelReason: reason.trim() || undefined,
        isActive: false,
      }, secret);
      onSaved(result.tenant);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Mark as Churned</h3>
            <p className="text-xs text-muted-foreground">This will deactivate the account and record a cancellation date.</p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
            Cancellation Reason (optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="e.g. Found an alternative, price concerns, switching away from Red Tractor…"
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleChurn}
            disabled={saving}
            className="flex-1 h-10 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving…" : "Confirm Churn"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const tenantId = parseInt(id, 10);
  const secret = getSecret()!;

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [systemRoles, setSystemRoles] = useState<Array<{ id: number; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingFarmId, setDownloadingFarmId] = useState<number | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [emailingFarmId, setEmailingFarmId] = useState<number | null>(null);
  const [emailResult, setEmailResult] = useState<{ farmId: number; success: boolean; to?: string } | null>(null);
  const [showChurnDialog, setShowChurnDialog] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [reinstating, setReinstating] = useState(false);
  const [trialFarmId, setTrialFarmId] = useState<number | null>(null);
  const [trialLoading, setTrialLoading] = useState(false);
  const [trialResult, setTrialResult] = useState<{ farmId: number; success: boolean; endsAt?: string } | null>(null);
  const [allModules, setAllModules] = useState<Module[]>([]);
  const [modulesLoading, setModulesLoading] = useState(true);
  const [addingForFarmId, setAddingForFarmId] = useState<number | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<Record<number, string>>({});
  const [savingAddFarmId, setSavingAddFarmId] = useState<number | null>(null);
  const [removingSubId, setRemovingSubId] = useState<number | null>(null);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);

  const activeModules = subscriptions.filter((s) => s.status === "active" || s.status === "trial");

  async function handleStartTrial(farm: Farm) {
    setTrialFarmId(farm.id);
    setTrialLoading(true);
    try {
      const result = await api.startTrial(tenantId, farm.id, 30, secret);
      setTrialResult({ farmId: farm.id, success: true, endsAt: result.trialEndsAt });
      const d = await api.getTenantDetail(tenantId, secret);
      setSubscriptions(d.subscriptions);
    } catch {
      setTrialResult({ farmId: farm.id, success: false });
    } finally {
      setTrialLoading(false);
      setTrialFarmId(null);
    }
  }

  useEffect(() => {
    Promise.all([
      api.getTenantDetail(tenantId, secret),
      api.getSystemRoles(secret),
    ])
      .then(([d, r]) => {
        setTenant(d.tenant);
        setFarms(d.farms);
        setSubscriptions(d.subscriptions);
        setUsers(d.users);
        setSystemRoles(r.roles);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    api.getModules(secret)
      .then((m) => setAllModules(m.modules))
      .catch(console.error)
      .finally(() => setModulesLoading(false));
  }, [tenantId]);

  async function handleAddModule(farmId: number) {
    const moduleId = parseInt(selectedModuleId[farmId] ?? "", 10);
    if (!moduleId) return;
    setSavingAddFarmId(farmId);
    try {
      await api.addSubscription(tenantId, farmId, moduleId, secret);
      const d = await api.getTenantDetail(tenantId, secret);
      setSubscriptions(d.subscriptions);
      setSelectedModuleId((prev) => ({ ...prev, [farmId]: "" }));
      setAddingForFarmId(null);
    } catch { } finally {
      setSavingAddFarmId(null);
    }
  }

  async function handleRemoveModule(subId: number) {
    setRemovingSubId(subId);
    try {
      await api.removeSubscription(tenantId, subId, secret);
      setSubscriptions((prev) => prev.map((s) => s.id === subId ? { ...s, status: "cancelled" } : s));
    } catch { } finally {
      setRemovingSubId(null);
    }
  }

  const handleSendEmail = async (farm: Farm) => {
    setEmailingFarmId(farm.id);
    setEmailResult(null);
    try {
      const result = await api.sendSetupGuide(tenantId, farm.id, secret);
      setEmailResult({ farmId: farm.id, success: result.sent, to: result.to });
    } catch {
      setEmailResult({ farmId: farm.id, success: false });
    } finally {
      setEmailingFarmId(null);
    }
  };

  const handleDownloadGuide = async (farm: Farm) => {
    setDownloadingFarmId(farm.id);
    setDownloadError(null);
    try {
      const { blob, filename } = await api.downloadSetupGuide(tenantId, farm.id, secret);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setDownloadError(`Failed to generate guide for ${farm.name}. Please try again.`);
    } finally {
      setDownloadingFarmId(null);
    }
  };

  const handleGenerateReferralCode = async () => {
    setGeneratingCode(true);
    try {
      const result = await api.generateReferralCode(tenantId, secret);
      setTenant((prev) => prev ? { ...prev, referralCode: result.referralCode } : prev);
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleCopyCode = () => {
    if (tenant?.referralCode) {
      navigator.clipboard.writeText(tenant.referralCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  const handleReinstate = async () => {
    setReinstating(true);
    try {
      const result = await api.updateTenant(tenantId, {
        cancelledAt: null,
        cancelReason: undefined,
        isActive: true,
      }, secret);
      setTenant(result.tenant);
    } catch (e) {
      console.error(e);
    } finally {
      setReinstating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-card border border-border rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>Customer not found.</p>
        <Link href="/customers">
          <span className="text-primary text-sm underline cursor-pointer">Back to customers</span>
        </Link>
      </div>
    );
  }

  const isChurned = !!tenant.cancelledAt;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <Link href="/customers">
          <div className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Customers
          </div>
        </Link>

        <div className={`bg-card border rounded-xl p-6 ${isChurned ? "border-red-200 bg-red-50/30" : "border-border"}`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isChurned ? "bg-red-100" : "bg-primary/10"}`}>
              <span className={`font-bold text-lg ${isChurned ? "text-red-500" : "text-primary"}`}>{tenant.name.charAt(0)}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h1 className="text-xl font-bold text-foreground">{tenant.name}</h1>
                {isChurned ? (
                  <Badge variant="destructive">Churned</Badge>
                ) : (
                  <Badge variant={tenant.isActive ? "success" : "destructive"}>
                    {tenant.isActive ? "Active" : "Suspended"}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{tenant.contactEmail}</p>
              {tenant.contactPhone && (
                <p className="text-sm text-muted-foreground">{tenant.contactPhone}</p>
              )}
            </div>
            <div className="text-right text-xs text-muted-foreground shrink-0">
              <p className="font-mono bg-muted px-2 py-1 rounded mb-1">{tenant.slug}</p>
              <p>Joined {new Date(tenant.createdAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</p>
              {tenant.stripeCustomerId && (
                <p className="mt-1 text-emerald-600 font-medium">Stripe connected</p>
              )}
            </div>
          </div>

          {/* Churn banner */}
          {isChurned && (
            <div className="mt-4 pt-4 border-t border-red-200 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-700">
                  Cancelled {fmtDate(tenant.cancelledAt!)}
                </p>
                {tenant.cancelReason && (
                  <p className="text-xs text-red-600 mt-0.5">{tenant.cancelReason}</p>
                )}
              </div>
              <button
                onClick={handleReinstate}
                disabled={reinstating}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 border border-green-300 rounded-lg px-3 py-1.5 bg-green-50 hover:bg-green-100 transition-colors disabled:opacity-50"
              >
                {reinstating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                Reinstate Account
              </button>
            </div>
          )}

          {/* Actions */}
          {!isChurned && (
            <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowChurnDialog(true)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors"
              >
                <TrendingDown className="w-3.5 h-3.5" />
                Mark as Churned
              </button>
            </div>
          )}
        </div>
      </div>

      {downloadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {downloadError}
        </div>
      )}

      {/* Module Management */}
      <Section title="Module Management">
        <div className="space-y-4">
          {farms.length === 0 && (
            <div className="bg-card border border-border rounded-xl p-5 text-sm text-muted-foreground">
              No farms registered.
            </div>
          )}
          {farms.map((farm) => {
            const farmActiveSubs = subscriptions.filter(
              (s) => s.farmId === farm.id && (s.status === "active" || s.status === "trial"),
            );
            const activeModuleIds = new Set(farmActiveSubs.map((s) => s.moduleId));
            const availableToAdd = allModules.filter((m) => !activeModuleIds.has(m.id));
            const isAdding = addingForFarmId === farm.id;
            const isSaving = savingAddFarmId === farm.id;
            const allAssigned = !modulesLoading && availableToAdd.length === 0;

            return (
              <div key={farm.id} className="bg-card border border-border rounded-xl overflow-hidden">
                {/* Farm header */}
                <div className="px-5 py-3 bg-muted/40 border-b border-border flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="font-semibold text-sm">{farm.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {farmActiveSubs.length} module{farmActiveSubs.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {allAssigned ? (
                    <span className="text-xs text-muted-foreground">All modules assigned</span>
                  ) : (
                    <button
                      onClick={() => {
                        setAddingForFarmId(isAdding ? null : farm.id);
                        setSelectedModuleId((prev) => ({ ...prev, [farm.id]: "" }));
                      }}
                      disabled={modulesLoading}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-primary border border-primary/30 rounded-lg px-2.5 py-1 hover:bg-primary/5 transition-colors disabled:opacity-50"
                    >
                      {modulesLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                      Add Module
                    </button>
                  )}
                </div>

                {/* Add module row */}
                {isAdding && (
                  <div className="px-5 py-3 border-b border-border bg-blue-50/40 flex items-center gap-2 flex-wrap">
                    <Package className="w-4 h-4 text-blue-500 shrink-0" />
                    <select
                      className="flex-1 text-sm border border-border rounded-lg px-3 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-ring min-w-[200px]"
                      value={selectedModuleId[farm.id] ?? ""}
                      onChange={(e) => setSelectedModuleId((prev) => ({ ...prev, [farm.id]: e.target.value }))}
                    >
                      <option value="">— Select a module —</option>
                      {availableToAdd.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleAddModule(farm.id)}
                      disabled={isSaving || !selectedModuleId[farm.id]}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-primary rounded-lg px-3 py-1.5 hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      Confirm
                    </button>
                    <button
                      onClick={() => setAddingForFarmId(null)}
                      className="text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Module list */}
                {farmActiveSubs.length === 0 ? (
                  <div className="px-5 py-4 text-sm text-muted-foreground">
                    No active modules. Use "Add Module" to enable access.
                  </div>
                ) : (
                  farmActiveSubs.map((sub, i) => (
                    <div
                      key={sub.id}
                      className={`px-5 py-2.5 flex items-center gap-3 ${i < farmActiveSubs.length - 1 ? "border-b border-border" : ""}`}
                    >
                      <div className={`w-2 h-2 rounded-full shrink-0 ${sub.status === "trial" ? "bg-amber-400" : "bg-green-500"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{sub.moduleName}</p>
                      </div>
                      {sub.status === "trial" && (
                        <Badge variant="warning">Trial</Badge>
                      )}
                      {sub.currentPeriodEnd && (
                        <span className="text-xs text-muted-foreground shrink-0">
                          {sub.status === "trial" ? "Ends" : "Renews"} {new Date(sub.currentPeriodEnd).toLocaleDateString("en-GB")}
                        </span>
                      )}
                      <button
                        onClick={() => handleRemoveModule(sub.id)}
                        disabled={removingSubId === sub.id}
                        title="Remove this module"
                        className="ml-1 p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                      >
                        {removingSubId === sub.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      </Section>

      {/* Referral Programme */}
      <Section title="Referral Programme">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-start gap-3 mb-4">
            <Gift className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground mb-1">Referral Code</p>
              <p className="text-xs text-muted-foreground">
                Share this code with the customer so they can refer other farms. When a new customer signs up using their code, it will be attributed here.
              </p>
            </div>
          </div>

          {tenant.referralCode ? (
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-muted rounded-lg px-4 py-2.5">
                <Share2 className="w-4 h-4 text-muted-foreground" />
                <span className="font-mono font-bold text-lg tracking-widest text-foreground">{tenant.referralCode}</span>
              </div>
              <button
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary border border-primary/30 rounded-lg px-3 py-2 hover:bg-primary/5 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                {codeCopied ? "Copied!" : "Copy Code"}
              </button>
            </div>
          ) : (
            <button
              onClick={handleGenerateReferralCode}
              disabled={generatingCode}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary border border-primary/30 rounded-lg px-4 py-2 hover:bg-primary/5 transition-colors disabled:opacity-50"
            >
              {generatingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
              {generatingCode ? "Generating…" : "Generate Referral Code"}
            </button>
          )}

          {tenant.referredBy && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Referred by code:</span>{" "}
                <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">{tenant.referredBy}</span>
              </p>
            </div>
          )}
        </div>
      </Section>

      <Section title={`Farms (${farms.length})`}>
        {farms.length === 0 ? (
          <p className="text-sm text-muted-foreground">No farms registered.</p>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {farms.map((farm, i) => {
              const farmSubs = subscriptions.filter((s) => s.farmId === farm.id && (s.status === "active" || s.status === "trial"));
              const hasTrial = farmSubs.some((s) => s.status === "trial");
              const isDownloading = downloadingFarmId === farm.id;
              return (
                <div
                  key={farm.id}
                  className={`px-5 py-4 flex items-start gap-3 ${i < farms.length - 1 ? "border-b border-border" : ""}`}
                >
                  <Building2 className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{farm.name}</p>
                      {!farm.isActive && <Badge variant="destructive">Inactive</Badge>}
                      {farm.redTractorId && (
                        <Badge variant="success">RT: {farm.redTractorId}</Badge>
                      )}
                    </div>
                    {(farm.address || farm.postcode) && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {[farm.address, farm.postcode].filter(Boolean).join(", ")}
                      </p>
                    )}
                    {(farm.cphNumber || farm.sbiNumber) && (
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                        {farm.cphNumber && (
                          <span><span className="font-medium">CPH:</span> {farm.cphNumber}</span>
                        )}
                        {farm.sbiNumber && (
                          <span><span className="font-medium">SBI:</span> {farm.sbiNumber}</span>
                        )}
                      </p>
                    )}
                    {farmSubs.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {farmSubs.filter(s => s.status === "active").length > 0 && (
                          <>{farmSubs.filter(s => s.status === "active").length} active module{farmSubs.filter(s => s.status === "active").length !== 1 ? "s" : ""}</>
                        )}
                        {hasTrial && (
                          <span className="ml-1 inline-flex items-center gap-1 text-amber-600 font-medium">
                            <Zap className="w-3 h-3" />trial active
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 mt-0.5">
                    <button
                      onClick={() => setEditingFarm(farm)}
                      title="Edit farm name, address, and postcode"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground border border-border rounded-lg px-3 py-1.5 hover:bg-accent transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDownloadGuide(farm)}
                      disabled={isDownloading}
                      title="Download tailored setup guide PDF"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-primary border border-primary/30 rounded-lg px-3 py-1.5 hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDownloading
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <FileDown className="w-3.5 h-3.5" />
                      }
                      {isDownloading ? "Generating…" : "Setup Guide"}
                    </button>

                    {(() => {
                      const isSending = emailingFarmId === farm.id;
                      const sentResult = emailResult?.farmId === farm.id ? emailResult : null;
                      if (sentResult?.success) {
                        return (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 border border-green-300 rounded-lg px-3 py-1.5 bg-green-50">
                            <MailCheck className="w-3.5 h-3.5" />
                            Sent
                          </span>
                        );
                      }
                      return (
                        <button
                          onClick={() => handleSendEmail(farm)}
                          disabled={isSending}
                          title={`Email setup guide to ${tenant.contactEmail}`}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground border border-border rounded-lg px-3 py-1.5 hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSending
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Mail className="w-3.5 h-3.5" />
                          }
                          {isSending ? "Sending…" : "Email Guide"}
                          {sentResult && !sentResult.success && (
                            <span className="text-red-500 ml-1">(failed)</span>
                          )}
                        </button>
                      );
                    })()}

                    {(() => {
                      const isStarting = trialFarmId === farm.id && trialLoading;
                      const result = trialResult?.farmId === farm.id ? trialResult : null;
                      if (result?.success) {
                        return (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 border border-amber-300 rounded-lg px-3 py-1.5 bg-amber-50">
                            <Zap className="w-3.5 h-3.5" />
                            Trial started
                          </span>
                        );
                      }
                      return (
                        <button
                          onClick={() => handleStartTrial(farm)}
                          disabled={isStarting || hasTrial}
                          title={hasTrial ? "Trial already active for this farm" : "Start a 30-day free trial for all modules"}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 border border-amber-300 rounded-lg px-3 py-1.5 hover:bg-amber-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {isStarting
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Zap className="w-3.5 h-3.5" />
                          }
                          {isStarting ? "Starting…" : hasTrial ? "Trial active" : "Start Trial"}
                        </button>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      <Section title={`All Subscriptions (${subscriptions.length})`}>
        {subscriptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No subscriptions active.</p>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {subscriptions.map((sub, i) => {
              const farm = farms.find((f) => f.id === sub.farmId);
              return (
                <div
                  key={sub.id}
                  className={`px-5 py-3.5 flex items-center gap-3 ${i < subscriptions.length - 1 ? "border-b border-border" : ""}`}
                >
                  <CreditCard className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{sub.moduleName}</p>
                    {farm && <p className="text-xs text-muted-foreground">{farm.name}</p>}
                  </div>
                  <Badge variant={statusVariant(sub.status)}>{sub.status}</Badge>
                  {sub.currentPeriodEnd && (
                    <span className="text-xs text-muted-foreground">
                      Renews {new Date(sub.currentPeriodEnd).toLocaleDateString("en-GB")}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Section>

      <Section title={`Users (${users.length})`}>
        {users.length === 0 ? (
          <p className="text-sm text-muted-foreground">No users found.</p>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {users.map((user, i) => (
              <UserRow
                key={user.userId}
                user={user}
                tenantId={tenantId}
                isLast={i === users.length - 1}
                systemRoles={systemRoles}
                onUpdated={(updated) =>
                  setUsers((prev) => prev.map((u) => (u.userId === updated.userId ? updated : u)))
                }
              />
            ))}
          </div>
        )}
      </Section>

      {showChurnDialog && tenant && (
        <ChurnDialog
          tenantId={tenantId}
          tenant={tenant}
          onClose={() => setShowChurnDialog(false)}
          onSaved={(updated) => setTenant(updated)}
        />
      )}

      {editingFarm && (
        <FarmEditDialog
          farm={editingFarm}
          tenantId={tenantId}
          onClose={() => setEditingFarm(null)}
          onSaved={(updated) => {
            setFarms((prev) => prev.map((f) => (f.id === updated.id ? { ...f, name: updated.name, address: updated.address, postcode: updated.postcode, cphNumber: updated.cphNumber, sbiNumber: updated.sbiNumber } : f)));
            setEditingFarm(null);
          }}
        />
      )}
    </div>
  );
}
