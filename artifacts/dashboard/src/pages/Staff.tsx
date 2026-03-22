import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/hooks/use-app-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Plus, Search, Mail, UserCheck, UserX, RefreshCw, Award, AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const DEV_BYPASS = import.meta.env.VITE_DEV_BYPASS_AUTH === "true";
const DEV_TOKEN = import.meta.env.VITE_DEV_BYPASS_TOKEN;

function authHeaders(): HeadersInit {
  if (DEV_BYPASS && DEV_TOKEN) return { "x-dev-bypass-token": DEV_TOKEN };
  return {};
}

interface StaffUser {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isActive: boolean;
  role: string;
}

interface CertRecord {
  id: number;
  userId: string;
  certificateType: string;
  expiryDate: string | null;
}

function useStaffUsers() {
  return useQuery<{ users: StaffUser[] }>({
    queryKey: ["staff-users"],
    queryFn: async () => {
      const res = await fetch(`/api/tenants/current/users`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to load staff");
      return res.json();
    },
  });
}

function useCerts(farmId: number | null) {
  return useQuery<{ records: CertRecord[] }>({
    queryKey: ["staff-certificates", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/certificates`).then(r => r.json()),
    enabled: !!farmId,
  });
}

interface RtwRecord { id: number; staffName: string; expiryDate: string | null; }
function useRtw(farmId: number | null) {
  return useQuery<{ records: RtwRecord[] }>({
    queryKey: ["staff-rtw", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/right-to-work`).then(r => r.json()),
    enabled: !!farmId,
  });
}

function RtwBadge({ name, records }: { name: string; records: RtwRecord[] }) {
  const mine = records.filter(r => r.staffName === name);
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

function fullName(u: StaffUser) {
  return (u.firstName || u.lastName) ? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() : u.email;
}

function CertBadge({ name, certs }: { name: string; certs: CertRecord[] }) {
  const mine = certs.filter(c => c.userId === name);
  if (mine.length === 0) return (
    <span className="text-xs text-muted-foreground italic">None recorded</span>
  );
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

function InviteDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [step, setStep] = useState<"form" | "success">("form");
  const [invitedName, setInvitedName] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  function handleClose() {
    setStep("form");
    setEmail(""); setFirstName(""); setLastName(""); setInvitedName("");
    onClose();
  }

  const invite = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/tenants/current/users/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ email, firstName, lastName }),
      });
      if (!res.ok) throw new Error("Invite failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-users"] });
      const name = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : email;
      setInvitedName(name);
      setStep("success");
    },
    onError: () => {
      toast({ title: "Failed to send invite", variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="sm:max-w-md">
        {step === "form" ? (
          <>
            <DialogHeader>
              <DialogTitle>Invite Staff Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label>Email Address *</Label>
                <Input type="email" placeholder="name@farm.co.uk" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>First Name</Label>
                  <Input placeholder="Jane" value={firstName} onChange={e => setFirstName(e.target.value)} />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input placeholder="Smith" value={lastName} onChange={e => setLastName(e.target.value)} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                They will receive an email to set their password and access your farm records.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={() => invite.mutate()} disabled={!email.trim() || invite.isPending}>
                {invite.isPending ? "Sending…" : "Send Invite"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Invite sent
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">{invitedName}</strong> will receive an email to set up their account.
              </p>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-2">
                <p className="text-sm font-semibold text-amber-900 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Two things to do before they start
                </p>
                <ul className="text-xs text-amber-800 space-y-1 list-none">
                  <li className="flex items-start gap-2"><span className="mt-0.5 shrink-0">①</span><span><strong>Right to Work check</strong> — required by law before employment begins. Record the document type, reference, and date checked.</span></li>
                  <li className="flex items-start gap-2"><span className="mt-0.5 shrink-0">②</span><span><strong>Operator certificates</strong> — Red Tractor and UK law require WASK, Animal Transport, PA1, machinery licences, etc. Record them in the Certificates tab.</span></li>
                </ul>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={handleClose}>Done</Button>
              <Button onClick={() => {
                handleClose();
                navigate(`/training?member=${encodeURIComponent(invitedName)}&tab=certificates`);
              }}>
                Add certificates <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function StaffPage() {
  const { farmId } = useAppStore();
  const [search, setSearch] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const { data, isLoading, isError, refetch } = useStaffUsers();
  const { data: certData } = useCerts(farmId);
  const { data: rtwData } = useRtw(farmId);
  const [, navigate] = useLocation();

  const allCerts = certData?.records ?? [];
  const allRtw = rtwData?.records ?? [];

  const users = (data?.users ?? []).filter(u => {
    const q = search.toLowerCase();
    return !q ||
      u.email.toLowerCase().includes(q) ||
      (u.firstName ?? "").toLowerCase().includes(q) ||
      (u.lastName ?? "").toLowerCase().includes(q);
  });

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
        <Button onClick={() => setInviteOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Invite Staff Member
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading && (
            <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Loading staff…
            </div>
          )}
          {isError && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <p className="text-sm text-muted-foreground">Failed to load staff members.</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
            </div>
          )}
          {!isLoading && !isError && users.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <p className="font-semibold text-foreground">No staff members yet</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Invite team members so they can help manage and update farm records.
              </p>
              <Button onClick={() => setInviteOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Invite first member
              </Button>
            </div>
          )}
          {!isLoading && !isError && users.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-black/[0.02]">
                  <th className="text-left px-6 py-3 font-semibold text-foreground/60">Name</th>
                  <th className="text-left px-6 py-3 font-semibold text-foreground/60">Email</th>
                  <th className="text-left px-6 py-3 font-semibold text-foreground/60">Role</th>
                  <th className="text-left px-6 py-3 font-semibold text-foreground/60">Status</th>
                  <th className="text-left px-6 py-3 font-semibold text-foreground/60">Certificates</th>
                  <th className="text-left px-6 py-3 font-semibold text-foreground/60">Right to Work</th>
                  <th className="w-40" />
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const name = fullName(u);
                  return (
                    <tr key={u.id} className="border-b border-border/30 last:border-0 hover:bg-black/[0.02] transition-colors">
                      <td className="px-6 py-4 font-medium">
                        {u.firstName || u.lastName
                          ? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim()
                          : <span className="text-muted-foreground italic">Not set</span>}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        <span className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 shrink-0" />{u.email}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="capitalize">{u.role ?? "member"}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        {u.isActive
                          ? <span className="flex items-center gap-1.5 text-green-600 text-xs font-medium"><UserCheck className="w-3.5 h-3.5" />Active</span>
                          : <span className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium"><UserX className="w-3.5 h-3.5" />Inactive</span>}
                      </td>
                      <td className="px-6 py-4">
                        <CertBadge name={name} certs={allCerts} />
                      </td>
                      <td className="px-6 py-4">
                        <RtwBadge name={name} records={allRtw} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7"
                            onClick={() => navigate(`/training?member=${encodeURIComponent(name)}&tab=certificates`)}
                          >
                            <Award className="w-3 h-3 mr-1" />Certs
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7"
                            onClick={() => navigate(`/training?member=${encodeURIComponent(name)}&tab=rtw`)}
                          >
                            RTW
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <InviteDialog open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </AppLayout>
  );
}
