import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/hooks/use-app-store";
import { useToast } from "@/hooks/use-toast";
import {
  UserCheck,
  ShieldCheck,
  Plus,
  Copy,
  Trash2,
  Clock,
  Eye,
  Link as LinkIcon,
  Activity,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Redirect } from "wouter";

const ALL_MODULES = [
  { key: "spray_records", label: "Spray & Input Applications" },
  { key: "fields_crops", label: "Fields & Crops" },
  { key: "soil_tests", label: "Soil Tests" },
  { key: "harvest", label: "Harvest Records" },
  { key: "equipment", label: "Equipment & Calibration" },
  { key: "workshop", label: "Workshop — Job Cards, PAT Testing & Fire Safety" },
  { key: "livestock", label: "Livestock Records" },
  { key: "medicines", label: "Medicine Records" },
  { key: "movements", label: "Livestock Movements" },
  { key: "biosecurity", label: "Biosecurity & Visitors" },
  { key: "staff_training", label: "Staff Training & Certificates" },
  { key: "inspections", label: "Inspections & Non-Conformances" },
  { key: "nvz", label: "NVZ Records" },
  { key: "risk_assessments", label: "Risk Assessments & COSHH" },
  { key: "environmental", label: "Environmental Records" },
  { key: "pig-production", label: "Pig Production" },
  { key: "poultry-production", label: "Poultry Production" },
  { key: "fresh-produce", label: "Fresh Produce" },
  { key: "carbon-sustainability", label: "Carbon & Sustainability" },
  { key: "farm-diversification", label: "Farm Diversification" },
  { key: "water-irrigation", label: "Water & Irrigation Management" },
];

const ADVISOR_ROLES = [
  { value: "agronomist", label: "Agronomist" },
  { value: "facts_adviser", label: "FACTS Adviser" },
  { value: "basis_consultant", label: "BASIS Consultant" },
  { value: "vet", label: "Veterinary Surgeon" },
  { value: "farm_consultant", label: "Farm Consultant" },
  { value: "accountant", label: "Accountant" },
  { value: "bank_manager", label: "Bank / Land Agent" },
  { value: "other", label: "Other" },
];

const INSPECTION_PURPOSES = [
  { value: "red_tractor_inspection", label: "Red Tractor Inspection" },
  { value: "brcgs_audit", label: "BRCGS / Food Safety Audit" },
  { value: "environmental_audit", label: "Environmental Audit" },
  { value: "vet_visit", label: "Vet / APHA Visit" },
  { value: "bank_review", label: "Bank / Finance Review" },
  { value: "due_diligence", label: "Due Diligence" },
  { value: "other", label: "Other" },
];

function ModuleCheckboxes({ selected, onChange }: { selected: string[]; onChange: (v: string[]) => void }) {
  const toggle = (key: string) => {
    if (selected.includes(key)) onChange(selected.filter(k => k !== key));
    else onChange([...selected, key]);
  };
  const selectAll = () => onChange(ALL_MODULES.map(m => m.key));
  const clearAll = () => onChange([]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-sm font-medium text-foreground">Modules to share</span>
        <button type="button" onClick={selectAll} className="text-xs text-primary underline">Select all</button>
        <button type="button" onClick={clearAll} className="text-xs text-muted-foreground underline">Clear</button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {ALL_MODULES.map(m => (
          <label key={m.key} className="flex items-center gap-2 cursor-pointer select-none">
            <Checkbox
              checked={selected.includes(m.key)}
              onCheckedChange={() => toggle(m.key)}
            />
            <span className="text-sm text-foreground/80">{m.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function buildInspectUrl(token: string): string {
  return `${window.location.origin}/dashboard/inspect/${token}`;
}

function copyLink(token: string, toast: ReturnType<typeof useToast>["toast"]) {
  navigator.clipboard.writeText(buildInspectUrl(token)).then(() => {
    toast({ title: "Link copied", description: "Paste it into an email to share access." });
  });
}

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
}

function ExpiryBadge({ expiresAt, revokedAt }: { expiresAt: string; revokedAt: string | null }) {
  if (revokedAt) return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Revoked</Badge>;
  const days = daysUntil(expiresAt);
  if (days < 0) return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Expired</Badge>;
  if (days <= 7) return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Expires in {days}d</Badge>;
  return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Expires {new Date(expiresAt).toLocaleDateString("en-GB")}</Badge>;
}

function AdvisorStatusBadge({ status }: { status: string }) {
  if (status === "revoked") return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1"><XCircle className="w-3 h-3" />Revoked</Badge>;
  if (status === "active") return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1"><CheckCircle2 className="w-3 h-3" />Active</Badge>;
  return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1"><AlertCircle className="w-3 h-3" />Pending</Badge>;
}

export default function AdvisorsAccessPage() {
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [showAdvisorDialog, setShowAdvisorDialog] = useState(false);
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<{ type: "advisor" | "session"; id: number } | null>(null);

  const [advisorForm, setAdvisorForm] = useState({
    advisorName: "", advisorEmail: "", advisorRole: "", notes: "", moduleAccess: [] as string[],
  });
  const [sessionForm, setSessionForm] = useState({
    accessorName: "", accessorEmail: "", accessorOrganisation: "", purpose: "", expiresAt: "", moduleAccess: [] as string[],
  });

  const { data: advisorsData } = useQuery({
    queryKey: ["advisors", farmId],
    queryFn: async () => { const r = await fetch(`/api/farms/${farmId}/advisors`); return r.json(); },
    enabled: !!farmId,
  });
  const { data: sessionsData } = useQuery({
    queryKey: ["inspection-sessions", farmId],
    queryFn: async () => { const r = await fetch(`/api/farms/${farmId}/inspection-sessions`); return r.json(); },
    enabled: !!farmId,
  });
  const { data: logData } = useQuery({
    queryKey: ["access-log", farmId],
    queryFn: async () => { const r = await fetch(`/api/farms/${farmId}/access-log`); return r.json(); },
    enabled: !!farmId,
  });

  const inviteAdvisor = useMutation({
    mutationFn: async (body: typeof advisorForm) => {
      const r = await fetch(`/api/farms/${farmId}/advisors`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      return r.json();
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["advisors", farmId] });
      setShowAdvisorDialog(false);
      setAdvisorForm({ advisorName: "", advisorEmail: "", advisorRole: "", notes: "", moduleAccess: [] });
      if (data.record?.token) copyLink(data.record.token, toast);
      else toast({ title: "Advisor added" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const createSession = useMutation({
    mutationFn: async (body: typeof sessionForm) => {
      const r = await fetch(`/api/farms/${farmId}/inspection-sessions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      return r.json();
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["inspection-sessions", farmId] });
      setShowSessionDialog(false);
      setSessionForm({ accessorName: "", accessorEmail: "", accessorOrganisation: "", purpose: "", expiresAt: "", moduleAccess: [] });
      if (data.record?.token) copyLink(data.record.token, toast);
      else toast({ title: "Session created" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const revokeAdvisor = useMutation({
    mutationFn: async (id: number) => fetch(`/api/farms/${farmId}/advisors/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["advisors", farmId] }); toast({ title: "Advisor access revoked" }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const revokeSession = useMutation({
    mutationFn: async (id: number) => fetch(`/api/farms/${farmId}/inspection-sessions/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["inspection-sessions", farmId] }); toast({ title: "Inspection session revoked" }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  if (!farmId) return <Redirect to="/select" />;

  const advisors: Record<string, unknown>[] = advisorsData?.records ?? [];
  const sessions: Record<string, unknown>[] = sessionsData?.records ?? [];
  const log: Record<string, unknown>[] = logData?.records ?? [];

  const defaultExpiry = () => {
    const d = new Date(); d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  };

  return (
    <AppLayout title="Advisors & External Access">
      <div className="max-w-3xl space-y-8">

        {/* Explainer banner */}
        <Card className="border-primary/20 bg-primary/[0.03]">
          <CardContent className="p-5 flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">Read-only external access</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Share a secure link with advisors, vets, inspectors, or your assurance body. They see exactly the modules you choose — in read-only mode. No account required for inspection sessions. All access is logged.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tier 1 — Advisor Accounts */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-primary" />
                <CardTitle className="text-base">Advisor Accounts</CardTitle>
              </div>
              <Button size="sm" onClick={() => setShowAdvisorDialog(true)}>
                <Plus className="w-4 h-4 mr-1" /> Add Advisor
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Permanent access links for agronomists, FACTS advisers, vets, and consultants. Active until you revoke them.</p>
          </CardHeader>
          <CardContent>
            {advisors.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">
                <UserCheck className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No advisor accounts yet. Click "Add Advisor" to create one.
              </div>
            ) : (
              <div className="space-y-3">
                {advisors.map((a) => (
                  <div key={String(a.id)} className="flex items-start gap-3 p-3 rounded-lg border bg-white">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{String(a.advisorName)}</span>
                        <AdvisorStatusBadge status={String(a.status)} />
                        <Badge variant="secondary" className="text-xs">{ADVISOR_ROLES.find(r => r.value === a.advisorRole)?.label ?? String(a.advisorRole)}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{String(a.advisorEmail)}</p>
                      {!!a.lastAccessAt && (
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Eye className="w-3 h-3" /> Last accessed {new Date(String(a.lastAccessAt)).toLocaleDateString("en-GB")}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(a.moduleAccess as string[]).map(k => (
                          <span key={k} className="text-xs bg-primary/[0.07] text-primary/80 px-1.5 py-0.5 rounded">
                            {ALL_MODULES.find(m => m.key === k)?.label ?? k}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {a.status !== "revoked" && (
                        <>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => copyLink(String(a.token), toast)} title="Copy access link">
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => setRevokeTarget({ type: "advisor", id: Number(a.id) })} title="Revoke access">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tier 2 — Inspection Sessions */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <CardTitle className="text-base">Inspection Sessions</CardTitle>
              </div>
              <Button size="sm" onClick={() => { setSessionForm(f => ({ ...f, expiresAt: defaultExpiry() })); setShowSessionDialog(true); }}>
                <Plus className="w-4 h-4 mr-1" /> Create Session
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Time-limited access for Red Tractor CBs, one-off audits, or bank reviews. No account required — the link is the key.</p>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No inspection sessions yet. Click "Create Session" to generate one.
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((s) => (
                  <div key={String(s.id)} className="flex items-start gap-3 p-3 rounded-lg border bg-white">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{String(s.accessorName)}</span>
                        <ExpiryBadge expiresAt={String(s.expiresAt)} revokedAt={s.revokedAt ? String(s.revokedAt) : null} />
                      </div>
                      {!!s.accessorOrganisation && <p className="text-xs text-muted-foreground mt-0.5">{String(s.accessorOrganisation)}</p>}
                      <p className="text-xs text-muted-foreground mt-0.5">{INSPECTION_PURPOSES.find(p => p.value === s.purpose)?.label ?? String(s.purpose)}</p>
                      <div className="flex items-center gap-3 mt-1">
                        {Number(s.accessCount) > 0 && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Eye className="w-3 h-3" /> Viewed {Number(s.accessCount)} time{Number(s.accessCount) !== 1 ? "s" : ""}
                          </p>
                        )}
                        {!!s.lastAccessAt && (
                          <p className="text-xs text-muted-foreground">Last accessed {new Date(String(s.lastAccessAt)).toLocaleDateString("en-GB")}</p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(s.moduleAccess as string[]).map(k => (
                          <span key={k} className="text-xs bg-primary/[0.07] text-primary/80 px-1.5 py-0.5 rounded">
                            {ALL_MODULES.find(m => m.key === k)?.label ?? k}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {!s.revokedAt && new Date(String(s.expiresAt)) > new Date() && (
                        <>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => copyLink(String(s.token), toast)} title="Copy access link">
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => setRevokeTarget({ type: "session", id: Number(s.id) })} title="Revoke session">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Access Log */}
        {log.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <CardTitle className="text-base">Access Log</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">Every time an external user views your farm data.</p>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {log.slice(0, 50).map((entry) => (
                  <div key={String(entry.id)} className="py-2 flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium">{String(entry.accessorName)}</span>
                      <span className="text-muted-foreground ml-2 text-xs">{String(entry.sessionType) === "advisor" ? "Advisor" : "Inspection session"}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(String(entry.accessedAt)).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Inspector Mode ── */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <CardTitle className="text-base">Inspector / Compliance Officer Mode</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Generate a filtered, read-only compliance pack link for Red Tractor inspectors, assurance body auditors, or bank compliance officers. The link shows only compliance-relevant modules for a specific date range.
            </p>
          </CardHeader>
          <CardContent>
            <InspectorModeCard farmId={farmId!} toast={toast} />
          </CardContent>
        </Card>

      </div>

      {/* Add Advisor Dialog */}
      <Dialog open={showAdvisorDialog} onOpenChange={setShowAdvisorDialog}>
        <DialogContent style={{ maxWidth: "44rem" }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><UserCheck className="w-4 h-4" /> Add Advisor Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Full name *</Label>
                <Input value={advisorForm.advisorName} onChange={e => setAdvisorForm(f => ({ ...f, advisorName: e.target.value }))} placeholder="Jane Smith" />
              </div>
              <div className="space-y-1">
                <Label>Email address *</Label>
                <Input type="email" value={advisorForm.advisorEmail} onChange={e => setAdvisorForm(f => ({ ...f, advisorEmail: e.target.value }))} placeholder="jane@example.com" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Advisor role *</Label>
              <Select value={ADVISOR_ROLES.filter(r => r.value !== "other").some(r => r.value === advisorForm.advisorRole) ? advisorForm.advisorRole : advisorForm.advisorRole ? "other" : ""} onValueChange={v => setAdvisorForm(f => ({ ...f, advisorRole: v }))}>
                <SelectTrigger><SelectValue placeholder="Select role…" /></SelectTrigger>
                <SelectContent>
                  {ADVISOR_ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
              {(advisorForm.advisorRole === "other" || (advisorForm.advisorRole && !ADVISOR_ROLES.filter(r => r.value !== "other").some(r => r.value === advisorForm.advisorRole))) && (
                <Input className="mt-1.5" value={advisorForm.advisorRole === "other" ? "" : advisorForm.advisorRole} onChange={e => setAdvisorForm(f => ({ ...f, advisorRole: e.target.value || "other" }))} placeholder="Please specify role…" />
              )}
            </div>
            <div className="space-y-1">
              <Label>Notes (optional)</Label>
              <Input value={advisorForm.notes} onChange={e => setAdvisorForm(f => ({ ...f, notes: e.target.value }))} placeholder="e.g. Annual agronomist visit contract" />
            </div>
            <ModuleCheckboxes selected={advisorForm.moduleAccess} onChange={v => setAdvisorForm(f => ({ ...f, moduleAccess: v }))} />
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 flex gap-2">
              <LinkIcon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>Once added, a secure link will be copied to your clipboard. Share it with the advisor by email. Access is permanent until you revoke it.</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdvisorDialog(false)}>Cancel</Button>
            <Button
              disabled={!advisorForm.advisorName || !advisorForm.advisorEmail || !advisorForm.advisorRole || advisorForm.moduleAccess.length === 0 || inviteAdvisor.isPending}
              onClick={() => inviteAdvisor.mutate(advisorForm)}
            >
              Add &amp; Copy Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Inspection Session Dialog */}
      <Dialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
        <DialogContent style={{ maxWidth: "44rem" }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Clock className="w-4 h-4" /> Create Inspection Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Accessor name *</Label>
                <Input value={sessionForm.accessorName} onChange={e => setSessionForm(f => ({ ...f, accessorName: e.target.value }))} placeholder="John Brown" />
              </div>
              <div className="space-y-1">
                <Label>Organisation</Label>
                <Input value={sessionForm.accessorOrganisation} onChange={e => setSessionForm(f => ({ ...f, accessorOrganisation: e.target.value }))} placeholder="e.g. NSF, ADAS" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Accessor email (optional)</Label>
              <Input type="email" value={sessionForm.accessorEmail} onChange={e => setSessionForm(f => ({ ...f, accessorEmail: e.target.value }))} placeholder="john@certbody.com" />
            </div>
            <div className="space-y-1">
              <Label>Purpose *</Label>
              <Select value={INSPECTION_PURPOSES.filter(p => p.value !== "other").some(p => p.value === sessionForm.purpose) ? sessionForm.purpose : sessionForm.purpose ? "other" : ""} onValueChange={v => setSessionForm(f => ({ ...f, purpose: v }))}>
                <SelectTrigger><SelectValue placeholder="Select purpose…" /></SelectTrigger>
                <SelectContent>
                  {INSPECTION_PURPOSES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
              {(sessionForm.purpose === "other" || (sessionForm.purpose && !INSPECTION_PURPOSES.filter(p => p.value !== "other").some(p => p.value === sessionForm.purpose))) && (
                <Input className="mt-1.5" value={sessionForm.purpose === "other" ? "" : sessionForm.purpose} onChange={e => setSessionForm(f => ({ ...f, purpose: e.target.value || "other" }))} placeholder="Please specify purpose…" />
              )}
            </div>
            <div className="space-y-1">
              <Label>Access expires on *</Label>
              <Input type="date" value={sessionForm.expiresAt} onChange={e => setSessionForm(f => ({ ...f, expiresAt: e.target.value }))} min={new Date().toISOString().split("T")[0]} />
              <p className="text-xs text-muted-foreground">Default is 30 days. For a Red Tractor inspection, 7–14 days is typical.</p>
            </div>
            <ModuleCheckboxes selected={sessionForm.moduleAccess} onChange={v => setSessionForm(f => ({ ...f, moduleAccess: v }))} />
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 flex gap-2">
              <LinkIcon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>The secure link will be copied to your clipboard. No account is needed — the link alone grants read-only access until the expiry date or until you revoke it.</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSessionDialog(false)}>Cancel</Button>
            <Button
              disabled={!sessionForm.accessorName || !sessionForm.purpose || !sessionForm.expiresAt || sessionForm.moduleAccess.length === 0 || createSession.isPending}
              onClick={() => createSession.mutate(sessionForm)}
            >
              Create &amp; Copy Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke confirmation */}
      <AlertDialog open={!!revokeTarget} onOpenChange={() => setRevokeTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke access?</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately invalidate the access link. The advisor or inspector will no longer be able to view your farm data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (!revokeTarget) return;
                if (revokeTarget.type === "advisor") revokeAdvisor.mutate(revokeTarget.id);
                else revokeSession.mutate(revokeTarget.id);
                setRevokeTarget(null);
              }}
            >
              Revoke Access
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}

// ─── Inspector Mode Card ────────────────────────────────────────────────────
const INSPECTOR_MODULES = [
  "sprays-inputs", "field-crop-management", "livestock-management",
  "medicines", "movements", "biosecurity", "inspections", "risk-waste",
  "training", "documents",
];

const INSPECTOR_PURPOSES = [
  { value: "red-tractor-audit", label: "Red Tractor / RSPCA Assured Audit" },
  { value: "bank-compliance", label: "Bank / Finance Compliance Review" },
  { value: "environmental-regulator", label: "Environment Agency / NRW Inspector" },
  { value: "apha-visit", label: "APHA / Trading Standards Visit" },
  { value: "nhbc-survey", label: "Soil Association Organic Inspection" },
  { value: "other-inspector", label: "Other Inspector / Auditor" },
];

function InspectorModeCard({ farmId, toast }: { farmId: number; toast: ReturnType<typeof useToast>["toast"] }) {
  const qc = useQueryClient();
  const defaultExpiry = () => { const d = new Date(); d.setDate(d.getDate() + 3); return d.toISOString().split("T")[0]; };
  const [form, setForm] = useState({
    accessorName: "",
    accessorEmail: "",
    accessorOrganisation: "",
    purpose: "red-tractor-audit",
    expiresAt: defaultExpiry(),
    inspectorReference: "",
    moduleAccess: INSPECTOR_MODULES,
  });
  const [created, setCreated] = useState<{ token: string } | null>(null);

  const createMut = useMutation({
    mutationFn: async (body: typeof form) => {
      const r = await fetch(`/api/farms/${farmId}/inspection-sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return r.json();
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["inspection-sessions", farmId] });
      if (data.record?.token) {
        setCreated({ token: data.record.token });
      } else {
        toast({ title: "Inspector session created" });
      }
    },
    onError: () => toast({ title: "Failed to create session", variant: "destructive" }),
  });

  const inspectorLink = created ? buildInspectUrl(created.token) : null;

  if (created && inspectorLink) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <ShieldCheck className="w-4 h-4 text-green-700 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-800">Inspector access link created</p>
            <p className="text-xs text-green-700 mt-0.5">Share this link with the inspector. It gives read-only compliance access until {new Date(form.expiresAt).toLocaleDateString("en-GB")}.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Input value={inspectorLink} readOnly className="font-mono text-xs flex-1" />
          <Button size="sm" onClick={() => {
            navigator.clipboard.writeText(inspectorLink);
            toast({ title: "Link copied" });
          }}>
            <Copy className="w-4 h-4 mr-1" /> Copy
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={() => { setCreated(null); setForm(f => ({ ...f, accessorName: "", accessorEmail: "", accessorOrganisation: "", inspectorReference: "", expiresAt: defaultExpiry() })); }}>
          Create Another
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Inspector / Auditor Name *</Label>
          <Input value={form.accessorName} onChange={e => setForm(f => ({ ...f, accessorName: e.target.value }))} placeholder="Jane Smith" />
        </div>
        <div className="space-y-1">
          <Label>Organisation</Label>
          <Input value={form.accessorOrganisation} onChange={e => setForm(f => ({ ...f, accessorOrganisation: e.target.value }))} placeholder="Red Tractor Assurance" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Inspection Purpose *</Label>
          <Select value={INSPECTOR_PURPOSES.filter(p => p.value !== "other-inspector").some(p => p.value === form.purpose) ? form.purpose : form.purpose ? "other-inspector" : ""} onValueChange={v => setForm(f => ({ ...f, purpose: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {INSPECTOR_PURPOSES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
            </SelectContent>
          </Select>
          {(form.purpose === "other-inspector" || (form.purpose && !INSPECTOR_PURPOSES.filter(p => p.value !== "other-inspector").some(p => p.value === form.purpose))) && (
            <Input className="mt-1.5" value={form.purpose === "other-inspector" ? "" : form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value || "other-inspector" }))} placeholder="Please specify inspection type…" />
          )}
        </div>
        <div className="space-y-1">
          <Label>Inspector Reference / Visit Code</Label>
          <Input value={form.inspectorReference} onChange={e => setForm(f => ({ ...f, inspectorReference: e.target.value }))} placeholder="e.g. RT-2024-1234" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Email (optional)</Label>
          <Input type="email" value={form.accessorEmail} onChange={e => setForm(f => ({ ...f, accessorEmail: e.target.value }))} placeholder="inspector@redtractor.org.uk" />
        </div>
        <div className="space-y-1">
          <Label>Link Expires</Label>
          <Input type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} />
        </div>
      </div>
      <div className="p-3 border rounded-lg bg-muted/40 text-xs text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Modules included in compliance view:</p>
        <p>Spray Records, Livestock Movements, Medicines, NVZ Applications, Training, Documents, Inspections, Risk Assessments, Biosecurity, Field & Crop Records</p>
        <p className="mt-1 text-xs opacity-70">All access is logged. The inspector sees data in read-only mode — no editing or deletion is possible.</p>
      </div>
      <Button
        onClick={() => createMut.mutate(form)}
        disabled={!form.accessorName || !form.purpose || !form.expiresAt || createMut.isPending}
        className="w-full"
      >
        <ShieldCheck className="w-4 h-4 mr-2" />
        {createMut.isPending ? "Creating…" : "Generate Inspector Access Link"}
      </Button>
    </div>
  );
}
