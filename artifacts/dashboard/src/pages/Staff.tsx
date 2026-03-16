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
import { Users, Plus, Search, Mail, UserCheck, UserX, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

function InviteDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
      toast({ title: "Invitation sent", description: `An invite was sent to ${email}.` });
      setEmail(""); setFirstName(""); setLastName("");
      onClose();
    },
    onError: () => {
      toast({ title: "Failed to send invite", variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
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
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => invite.mutate()} disabled={!email.trim() || invite.isPending}>
            {invite.isPending ? "Sending…" : "Send Invite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function StaffPage() {
  const { farmId } = useAppStore();
  const [search, setSearch] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const { data, isLoading, isError, refetch } = useStaffUsers();

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
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-border/30 last:border-0 hover:bg-black/[0.02] transition-colors">
                    <td className="px-6 py-4 font-medium">
                      {u.firstName || u.lastName
                        ? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim()
                        : <span className="text-muted-foreground italic">Not set</span>}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5" />{u.email}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="capitalize">{u.role ?? "member"}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      {u.isActive
                        ? <span className="flex items-center gap-1.5 text-green-600 text-xs font-medium"><UserCheck className="w-3.5 h-3.5" />Active</span>
                        : <span className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium"><UserX className="w-3.5 h-3.5" />Inactive</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <InviteDialog open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </AppLayout>
  );
}
