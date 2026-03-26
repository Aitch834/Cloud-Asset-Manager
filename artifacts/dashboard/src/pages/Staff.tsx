import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/hooks/use-app-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users, Plus, Search, Mail, UserCheck, UserX, RefreshCw, Award, AlertTriangle,
  ArrowRight, CheckCircle2, Smartphone, Monitor, Shield, User, Edit2, Send,
  Lock, Unlock, ChevronDown, GraduationCap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const DEV_BYPASS = import.meta.env.VITE_DEV_BYPASS_AUTH === "true";
const DEV_TOKEN = import.meta.env.VITE_DEV_BYPASS_TOKEN;

function authHeaders(): HeadersInit {
  if (DEV_BYPASS && DEV_TOKEN) return { "x-dev-bypass-token": DEV_TOKEN };
  return {};
}

// ─── Types ────────────────────────────────────────────────────────────────────

type FarmRole = "operator" | "senior" | "manager" | "owner";
type AccessType = "none" | "mobile_only" | "web_only" | "full";

interface FarmMember {
  id: number;
  farmId: number;
  linkedUserId: string | null;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  jobTitle: string | null;
  farmRole: FarmRole;
  accessType: AccessType;
  invitationStatus: "not_invited" | "pending" | "accepted";
  isActive: boolean;
  notes: string | null;
  employedFrom: string | null;
  employedTo: string | null;
  createdAt: string;
}

interface CertRecord {
  id: number;
  userId: string;
  certificateType: string;
  expiryDate: string | null;
}

interface RtwRecord {
  id: number;
  staffName: string;
  expiryDate: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FARM_ROLE_LABELS: Record<FarmRole, string> = {
  operator: "Operator",
  senior: "Senior / Foreman",
  manager: "Farm Manager",
  owner: "Owner",
};

const FARM_ROLE_COLORS: Record<FarmRole, string> = {
  operator: "bg-slate-100 text-slate-700",
  senior: "bg-blue-100 text-blue-700",
  manager: "bg-purple-100 text-purple-700",
  owner: "bg-amber-100 text-amber-800",
};

const ACCESS_LABELS: Record<string, string> = {
  none: "No system access",
  mobile_only: "Mobile only",
  web_only: "Web only",
  full: "Full access",
  limited: "Limited access",
};

const ACCESS_COLORS: Record<string, string> = {
  none: "bg-slate-100 text-slate-500",
  mobile_only: "bg-green-100 text-green-700",
  web_only: "bg-indigo-100 text-indigo-700",
  full: "bg-emerald-100 text-emerald-700",
  limited: "bg-green-100 text-green-700",
};

const ACCESS_ICONS: Record<string, React.ElementType> = {
  none: Lock,
  mobile_only: Smartphone,
  web_only: Monitor,
  full: Unlock,
  limited: Smartphone,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useMembers(farmId: number | null) {
  return useQuery<{ members: FarmMember[] }>({
    queryKey: ["farm-members", farmId],
    queryFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/members`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to load staff");
      return res.json();
    },
    enabled: !!farmId,
  });
}

function useCerts(farmId: number | null) {
  return useQuery<{ records: CertRecord[] }>({
    queryKey: ["staff-certificates", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/certificates`, { headers: authHeaders() }).then(r => r.json()),
    enabled: !!farmId,
  });
}

function useRtw(farmId: number | null) {
  return useQuery<{ records: RtwRecord[] }>({
    queryKey: ["staff-rtw", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/right-to-work`, { headers: authHeaders() }).then(r => r.json()),
    enabled: !!farmId,
  });
}

// ─── Utility Badges ───────────────────────────────────────────────────────────

function RtwBadge({ name, records }: { name: string; records: RtwRecord[] }) {
  const mine = records.filter(r => r.staffName.toLowerCase().trim() === name.toLowerCase().trim());
  if (mine.length === 0) return (
    <span className="text-xs font-medium text-red-600 flex items-center gap-1">
      <AlertTriangle className="w-3 h-3" />Not checked
    </span>
  );
  const now = new Date();
  const expired = mine.some(r => r.expiryDate && new Date(r.expiryDate) < now);
  const urgent = mine.some(r => {
    if (!r.expiryDate) return false;
    const d = Math.floor((new Date(r.expiryDate).getTime() - now.getTime()) / 86400000);
    return d >= 0 && d <= 28;
  });
  if (expired) return <span className="text-xs font-medium text-red-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Expired</span>;
  if (urgent) return <span className="text-xs font-medium text-amber-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Expiring soon</span>;
  return <span className="text-xs font-medium text-green-600 flex items-center gap-1"><UserCheck className="w-3 h-3" />Checked</span>;
}

function CertBadge({ name, certs }: { name: string; certs: CertRecord[] }) {
  const mine = certs.filter(c => c.userId === name);
  if (mine.length === 0) return <span className="text-xs text-muted-foreground italic">None recorded</span>;
  const now = new Date();
  const expired = mine.filter(c => c.expiryDate && new Date(c.expiryDate) < now).length;
  const expiring = mine.filter(c => {
    if (!c.expiryDate) return false;
    const days = Math.floor((new Date(c.expiryDate).getTime() - now.getTime()) / 86400000);
    return days >= 0 && days <= 60;
  }).length;
  if (expired > 0) return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
      <AlertTriangle className="w-3 h-3" />{mine.length} cert{mine.length !== 1 ? "s" : ""} · {expired} expired
    </span>
  );
  if (expiring > 0) return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
      <AlertTriangle className="w-3 h-3" />{mine.length} cert{mine.length !== 1 ? "s" : ""} · {expiring} expiring
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
      <Award className="w-3 h-3" />{mine.length} cert{mine.length !== 1 ? "s" : ""}
    </span>
  );
}

// ─── Add Member Dialog ────────────────────────────────────────────────────────

function AddMemberDialog({ farmId, open, onClose }: { farmId: number; open: boolean; onClose: () => void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [farmRole, setFarmRole] = useState<FarmRole>("operator");
  const [employedFrom, setEmployedFrom] = useState("");
  const [notes, setNotes] = useState("");
  const [step, setStep] = useState<"form" | "success">("form");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  function reset() {
    setFirstName(""); setLastName(""); setEmail(""); setPhone(""); setJobTitle("");
    setFarmRole("operator"); setEmployedFrom(""); setNotes(""); setStep("form");
  }

  const create = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ firstName, lastName, email: email || null, phone: phone || null, jobTitle: jobTitle || null, farmRole, employedFrom: employedFrom || null, notes: notes || null }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farm-members", farmId] });
      setStep("success");
    },
    onError: () => toast({ title: "Failed to add staff member", variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) { reset(); onClose(); } }}>
      <DialogContent style={{ maxWidth: "32rem" }}>
        {step === "form" ? (
          <>
            <DialogHeader>
              <DialogTitle>Add Staff Member</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="details">
              <TabsList className="w-full">
                <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                <TabsTrigger value="employment" className="flex-1">Employment</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="space-y-3 pt-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>First Name *</Label>
                    <Input placeholder="Jane" value={firstName} onChange={e => setFirstName(e.target.value)} />
                  </div>
                  <div>
                    <Label>Last Name *</Label>
                    <Input placeholder="Smith" value={lastName} onChange={e => setLastName(e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>Email Address</Label>
                  <Input type="email" placeholder="jane@farm.co.uk" value={email} onChange={e => setEmail(e.target.value)} />
                  <p className="text-xs text-muted-foreground mt-1">Required if you later want to invite them to log in.</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input placeholder="07700 000000" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
                <div>
                  <Label>Job Title / Role Description</Label>
                  <Input placeholder="Stockman, Tractor Driver, etc." value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
                </div>
                <div>
                  <Label>Farm Role (permission level)</Label>
                  <Select value={farmRole} onValueChange={v => setFarmRole(v as FarmRole)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operator">Operator — field worker, logs records</SelectItem>
                      <SelectItem value="senior">Senior / Foreman — team lead, can view all records</SelectItem>
                      <SelectItem value="manager">Farm Manager — full operational access</SelectItem>
                      <SelectItem value="owner">Owner — unrestricted access</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              <TabsContent value="employment" className="space-y-3 pt-3">
                <div>
                  <Label>Employed From</Label>
                  <Input type="date" value={employedFrom} onChange={e => setEmployedFrom(e.target.value)} />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea placeholder="Any relevant notes about this staff member…" value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
                </div>
              </TabsContent>
            </Tabs>
            <p className="text-xs text-muted-foreground">
              This creates a staff record only — no system login is created yet. You can invite them to log in from their record at any time.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => { reset(); onClose(); }}>Cancel</Button>
              <Button onClick={() => create.mutate()} disabled={!firstName.trim() || !lastName.trim() || create.isPending}>
                {create.isPending ? "Saving…" : "Add Staff Member"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Staff member added
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">{firstName} {lastName}</strong> has been added as a staff record.
              </p>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-2">
                <p className="text-sm font-semibold text-amber-900 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Two compliance steps before they start
                </p>
                <ul className="text-xs text-amber-800 space-y-1">
                  <li className="flex items-start gap-2"><span className="mt-0.5">①</span><span><strong>Right to Work check</strong> — required by law before employment begins.</span></li>
                  <li className="flex items-start gap-2"><span className="mt-0.5">②</span><span><strong>Certificates</strong> — log WASK, PA1, Animal Transport and any other relevant qualifications.</span></li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { reset(); onClose(); }}>Done</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Invite Dialog ────────────────────────────────────────────────────────────

function InviteDialog({
  farmId, member, open, onClose,
}: { farmId: number; member: FarmMember | null; open: boolean; onClose: () => void }) {
  const [accessType, setAccessType] = useState<AccessType>("full");
  const [farmRole, setFarmRole] = useState<FarmRole>("operator");
  const [step, setStep] = useState<"form" | "success">("form");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  function reset() { setAccessType("full"); setFarmRole("operator"); setStep("form"); }

  const invite = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/members/${member!.id}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ accessType, farmRole }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Invite failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farm-members", farmId] });
      setStep("success");
    },
    onError: (e: Error) => toast({ title: e.message, variant: "destructive" }),
  });

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) { reset(); onClose(); } }}>
      <DialogContent style={{ maxWidth: "28rem" }}>
        {step === "form" ? (
          <>
            <DialogHeader>
              <DialogTitle>Invite {member.firstName} {member.lastName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                <p className="text-muted-foreground">Invitation will be sent to:</p>
                <p className="font-medium mt-0.5">{member.email}</p>
              </div>
              <div>
                <Label>System Access</Label>
                <Select value={accessType} onValueChange={v => setAccessType(v as AccessType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">
                      <span className="flex items-center gap-2"><Unlock className="w-3.5 h-3.5" />Full access — web dashboard + mobile app</span>
                    </SelectItem>
                    <SelectItem value="mobile_only">
                      <span className="flex items-center gap-2"><Smartphone className="w-3.5 h-3.5" />Mobile only — app access, no dashboard</span>
                    </SelectItem>
                    <SelectItem value="web_only">
                      <span className="flex items-center gap-2"><Monitor className="w-3.5 h-3.5" />Web only — dashboard access, no mobile</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Permission Level</Label>
                <Select value={farmRole} onValueChange={v => setFarmRole(v as FarmRole)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operator">Operator — creates and views own records</SelectItem>
                    <SelectItem value="senior">Senior / Foreman — views all farm records</SelectItem>
                    <SelectItem value="manager">Farm Manager — full operational access</SelectItem>
                    <SelectItem value="owner">Owner — unrestricted including billing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                They will receive an email to set their password. The invitation expires in 7 days.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { reset(); onClose(); }}>Cancel</Button>
              <Button onClick={() => invite.mutate()} disabled={invite.isPending}>
                <Send className="w-3.5 h-3.5 mr-1.5" />
                {invite.isPending ? "Sending…" : "Send Invitation"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Invitation sent
              </DialogTitle>
            </DialogHeader>
            <div className="py-2 space-y-3">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">{member.firstName} {member.lastName}</strong> will receive an email to set up their account with{" "}
                <strong>{ACCESS_LABELS[accessType]}</strong>.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={() => { reset(); onClose(); }}>Done</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Access Dialog ───────────────────────────────────────────────────────

function EditMemberDialog({
  farmId, member, open, onClose,
}: { farmId: number; member: FarmMember | null; open: boolean; onClose: () => void }) {
  const [farmRole, setFarmRole] = useState<FarmRole>(member?.farmRole ?? "operator");
  const [accessType, setAccessType] = useState<AccessType>(member?.accessType ?? "none");
  const [jobTitle, setJobTitle] = useState(member?.jobTitle ?? "");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const save = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/members/${member!.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ farmRole, accessType, jobTitle: jobTitle || null }),
      });
      if (!res.ok) throw new Error("Save failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farm-members", farmId] });
      toast({ title: "Saved" });
      onClose();
    },
    onError: () => toast({ title: "Failed to save changes", variant: "destructive" }),
  });

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent style={{ maxWidth: "26rem" }}>
        <DialogHeader>
          <DialogTitle>Edit — {member.firstName} {member.lastName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Job Title</Label>
            <Input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="Stockman, Tractor Driver…" />
          </div>
          <div>
            <Label>Permission Level</Label>
            <Select value={farmRole} onValueChange={v => setFarmRole(v as FarmRole)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="operator">Operator</SelectItem>
                <SelectItem value="senior">Senior / Foreman</SelectItem>
                <SelectItem value="manager">Farm Manager</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {member.linkedUserId && (
            <div>
              <Label>System Access</Label>
              <Select value={accessType} onValueChange={v => setAccessType(v as AccessType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full access</SelectItem>
                  <SelectItem value="mobile_only">Mobile only</SelectItem>
                  <SelectItem value="web_only">Web only</SelectItem>
                  <SelectItem value="none">No system access</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>{save.isPending ? "Saving…" : "Save Changes"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Member Row ────────────────────────────────────────────────────────────────

function MemberRow({
  member, farmId, certs, rtw, onInvite, onEdit, navigate,
}: {
  member: FarmMember;
  farmId: number;
  certs: CertRecord[];
  rtw: RtwRecord[];
  onInvite: () => void;
  onEdit: () => void;
  navigate: (to: string) => void;
}) {
  const fullName = `${member.firstName} ${member.lastName}`;
  const AccessIcon = ACCESS_ICONS[member.accessType];

  return (
    <tr className="border-b border-border/30 last:border-0 hover:bg-black/[0.02] transition-colors">
      <td className="px-6 py-4">
        <div>
          <p className="font-medium">{fullName}</p>
          {member.jobTitle && <p className="text-xs text-muted-foreground mt-0.5">{member.jobTitle}</p>}
        </div>
      </td>
      <td className="px-6 py-4">
        {member.email
          ? <span className="flex items-center gap-2 text-sm text-muted-foreground"><Mail className="w-3.5 h-3.5 shrink-0" />{member.email}</span>
          : <span className="text-xs text-muted-foreground italic">No email</span>}
      </td>
      <td className="px-5 py-4">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${FARM_ROLE_COLORS[member.farmRole]}`}>
          <Shield className="w-3 h-3" />{FARM_ROLE_LABELS[member.farmRole]}
        </span>
      </td>
      <td className="px-5 py-4">
        <div className="space-y-1">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${ACCESS_COLORS[member.accessType]}`}>
            <AccessIcon className="w-3 h-3" />{ACCESS_LABELS[member.accessType]}
          </span>
          {member.invitationStatus === "pending" && (
            <p className="text-xs text-amber-600">Invite pending…</p>
          )}
        </div>
      </td>
      <td className="px-5 py-4">
        {member.isActive
          ? <span className="flex items-center gap-1.5 text-green-600 text-xs font-medium"><UserCheck className="w-3.5 h-3.5" />Active</span>
          : <span className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium"><UserX className="w-3.5 h-3.5" />Inactive</span>}
      </td>
      <td className="px-5 py-4">
        <CertBadge name={fullName} certs={certs} />
      </td>
      <td className="px-5 py-4">
        <RtwBadge name={fullName} records={rtw} />
      </td>
      <td className="px-6 py-4">
        <div className="flex gap-1.5 flex-wrap">
          {member.accessType === "none" && member.invitationStatus !== "pending" && member.email && (
            <Button size="sm" variant="outline" className="text-xs h-7" onClick={onInvite}>
              <Send className="w-3 h-3 mr-1" />Invite
            </Button>
          )}
          <Button size="sm" variant="outline" className="text-xs h-7" onClick={onEdit}>
            <Edit2 className="w-3 h-3 mr-1" />Edit
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-7"
            onClick={() => navigate(`/training?member=${encodeURIComponent(fullName)}&tab=certificates`)}>
            <Award className="w-3 h-3 mr-1" />Certs
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-7"
            title="Right to Work checks — managed in the Training section"
            onClick={() => navigate(`/training?member=${encodeURIComponent(fullName)}&tab=rtw`)}
          >
            <GraduationCap className="w-3 h-3 mr-1" />RTW
          </Button>
        </div>
      </td>
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StaffPage() {
  const { farmId } = useAppStore();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [inviteMember, setInviteMember] = useState<FarmMember | null>(null);
  const [editMember, setEditMember] = useState<FarmMember | null>(null);
  const [, navigate] = useLocation();

  const { data, isLoading, isError, refetch } = useMembers(farmId);
  const { data: certData } = useCerts(farmId);
  const { data: rtwData } = useRtw(farmId);

  const allCerts = certData?.records ?? [];
  const allRtw = rtwData?.records ?? [];

  const members = (data?.members ?? []).filter(m => {
    if (!m.isActive) return false;
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(q) ||
      (m.email ?? "").toLowerCase().includes(q) ||
      (m.jobTitle ?? "").toLowerCase().includes(q)
    );
  });

  const withAccess = members.filter(m => m.accessType !== "none");
  const noAccess = members.filter(m => m.accessType === "none");

  if (!farmId) return null;

  return (
    <AppLayout title="Staff">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search staff…"
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      {/* Summary counts */}
      {!isLoading && !isError && (data?.members?.length ?? 0) > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(["full", "mobile_only", "web_only", "none"] as AccessType[]).map(a => {
            const count = (data?.members ?? []).filter(m => m.isActive && m.accessType === a).length;
            const Icon = ACCESS_ICONS[a];
            return (
              <div key={a} className={`rounded-lg border px-4 py-3 flex items-center gap-3 ${count > 0 ? "" : "opacity-50"}`}>
                <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground">{ACCESS_LABELS[a]}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* System users section */}
      {withAccess.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="px-6 py-3 border-b border-border/50 bg-black/[0.02]">
              <p className="text-sm font-semibold flex items-center gap-2">
                <Unlock className="w-4 h-4 text-emerald-600" />
                System Users ({withAccess.length})
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Staff with mobile or web dashboard access</p>
            </div>
            <StaffTable members={withAccess} farmId={farmId} certs={allCerts} rtw={allRtw}
              onInvite={setInviteMember} onEdit={setEditMember} navigate={navigate} />
          </CardContent>
        </Card>
      )}

      {/* Records only section */}
      {noAccess.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="px-6 py-3 border-b border-border/50 bg-black/[0.02]">
              <p className="text-sm font-semibold flex items-center gap-2">
                <User className="w-4 h-4 text-slate-500" />
                Staff Records — No System Access ({noAccess.length})
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">In the records for compliance purposes. Click Invite to give system access.</p>
            </div>
            <StaffTable members={noAccess} farmId={farmId} certs={allCerts} rtw={allRtw}
              onInvite={setInviteMember} onEdit={setEditMember} navigate={navigate} />
          </CardContent>
        </Card>
      )}

      {/* Loading / error / empty states */}
      {isLoading && (
        <Card><CardContent className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
          <RefreshCw className="w-4 h-4 animate-spin" />Loading staff…
        </CardContent></Card>
      )}
      {isError && (
        <Card><CardContent className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <p className="text-sm text-muted-foreground">Failed to load staff members.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
        </CardContent></Card>
      )}
      {!isLoading && !isError && members.length === 0 && !search && (
        <Card><CardContent className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <p className="font-semibold text-foreground">No staff members yet</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            Add staff members to track their training, certifications, and Right to Work status.
            You can optionally invite them to access the system later.
          </p>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />Add first staff member
          </Button>
        </CardContent></Card>
      )}
      {!isLoading && !isError && members.length === 0 && search && (
        <Card><CardContent className="flex items-center justify-center py-10 text-sm text-muted-foreground">
          No staff matching "{search}"
        </CardContent></Card>
      )}

      <AddMemberDialog farmId={farmId} open={addOpen} onClose={() => setAddOpen(false)} />
      <InviteDialog farmId={farmId} member={inviteMember} open={!!inviteMember}
        onClose={() => setInviteMember(null)} />
      <EditMemberDialog farmId={farmId} member={editMember} open={!!editMember}
        onClose={() => setEditMember(null)} />
    </AppLayout>
  );
}

function StaffTable({ members, farmId, certs, rtw, onInvite, onEdit, navigate }: {
  members: FarmMember[];
  farmId: number;
  certs: CertRecord[];
  rtw: RtwRecord[];
  onInvite: (m: FarmMember) => void;
  onEdit: (m: FarmMember) => void;
  navigate: (to: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[900px]">
        <thead>
          <tr className="border-b border-border/50 bg-black/[0.02]">
            <th className="text-left px-6 py-3 font-semibold text-foreground/60">Name</th>
            <th className="text-left px-6 py-3 font-semibold text-foreground/60">Email</th>
            <th className="text-left px-5 py-3 font-semibold text-foreground/60">Role</th>
            <th className="text-left px-5 py-3 font-semibold text-foreground/60">Access</th>
            <th className="text-left px-5 py-3 font-semibold text-foreground/60">Status</th>
            <th className="text-left px-5 py-3 font-semibold text-foreground/60">Certificates</th>
            <th className="text-left px-5 py-3 font-semibold text-foreground/60">
              Right to Work
              <span className="block text-[10px] font-normal text-muted-foreground/70 mt-0.5 normal-case tracking-normal">
                managed in Training
              </span>
            </th>
            <th className="w-48" />
          </tr>
        </thead>
        <tbody>
          {members.map(m => (
            <MemberRow
              key={m.id}
              member={m}
              farmId={farmId}
              certs={certs}
              rtw={rtw}
              onInvite={() => onInvite(m)}
              onEdit={() => onEdit(m)}
              navigate={navigate}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
