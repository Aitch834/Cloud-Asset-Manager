import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/hooks/use-app-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Plus, Pencil, Trash2, RefreshCw, Eye, Users, UserX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DEV_BYPASS = import.meta.env.VITE_DEV_BYPASS_AUTH === "true";
const DEV_TOKEN = import.meta.env.VITE_DEV_BYPASS_TOKEN;

function authHeaders(): HeadersInit {
  if (DEV_BYPASS && DEV_TOKEN) return { "x-dev-bypass-token": DEV_TOKEN };
  return {};
}

interface Department {
  id: number;
  name: string;
  description: string | null;
  colour: string;
  isActive: boolean;
}

interface StaffMember {
  id: number;
  firstName: string;
  lastName: string;
  jobTitle: string | null;
  farmRole: string;
  isActive: boolean;
  departmentId: number | null;
  secondaryDepartments?: { id: number; name: string; colour: string }[];
  employedFrom: string | null;
  employedTo: string | null;
}

const PRESET_COLOURS = [
  "#16a34a", "#b45309", "#1d4ed8", "#7c3aed", "#be123c", "#0f766e",
  "#c2410c", "#6d28d9", "#0369a1", "#374151",
];

const FARM_ROLE_LABELS: Record<string, string> = {
  operator: "Operator",
  senior: "Senior Operator",
  manager: "Manager",
  owner: "Owner",
};

// ─── Department Members Dialog ─────────────────────────────────────────────────

function DeptMembersDialog({ farmId, dept, open, onClose }: {
  farmId: number;
  dept: Department;
  open: boolean;
  onClose: () => void;
}) {
  const [showFormer, setShowFormer] = useState(false);

  const { data, isLoading } = useQuery<{ members: StaffMember[] }>({
    queryKey: ["farm-members", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/members`, { headers: authHeaders() }).then(r => r.json()),
    enabled: open && !!farmId,
  });

  const allInDept = (data?.members ?? []).filter(m =>
    m.departmentId === dept.id || m.secondaryDepartments?.some(sd => sd.id === dept.id)
  );
  const activeMembers = allInDept.filter(m => m.isActive);
  const formerMembers = allInDept.filter(m => !m.isActive);
  const displayed = showFormer ? allInDept : activeMembers;

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent style={{ maxWidth: "36rem" }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <span
              className="w-4 h-4 rounded-full shrink-0"
              style={{ background: dept.colour }}
            />
            {dept.name}
            <span className="text-sm font-normal text-muted-foreground ml-1">— Staff</span>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Loading…
          </div>
        ) : (
          <div className="space-y-3">
            {/* Toggle for former staff */}
            {formerMembers.length > 0 && (
              <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                <span className="text-xs text-muted-foreground">
                  {formerMembers.length} former staff member{formerMembers.length !== 1 ? "s" : ""} not shown
                </span>
                <button
                  onClick={() => setShowFormer(v => !v)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {showFormer ? "Hide former staff" : "Show former staff"}
                </button>
              </div>
            )}

            {/* Members list */}
            {displayed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                <Users className="w-8 h-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  {showFormer
                    ? "No staff have ever been assigned to this department."
                    : "No current staff assigned to this department."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/40 rounded-lg border border-border/60 overflow-hidden">
                {displayed.map(m => (
                  <div
                    key={m.id}
                    className={`flex items-center gap-3 px-4 py-3 ${!m.isActive ? "opacity-60 bg-muted/30" : ""}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-semibold text-primary">
                        {m.firstName[0]}{m.lastName[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {m.firstName} {m.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {m.jobTitle || FARM_ROLE_LABELS[m.farmRole] || m.farmRole}
                      </p>
                    </div>
                    {m.departmentId !== dept.id && m.secondaryDepartments?.some(sd => sd.id === dept.id) && (
                      <Badge variant="outline" className="text-[10px] shrink-0 text-muted-foreground">
                        Secondary
                      </Badge>
                    )}
                    {!m.isActive && (
                      <Badge variant="secondary" className="text-[10px] shrink-0">
                        <UserX className="w-2.5 h-2.5 mr-1" />
                        Former
                      </Badge>
                    )}
                    {m.employedFrom && (
                      <span className="text-[11px] text-muted-foreground shrink-0">
                        From {new Date(m.employedFrom).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground pt-1">
              {activeMembers.length} current · {formerMembers.length} former
            </p>
          </div>
        )}

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Department Form Dialog ────────────────────────────────────────────────────

interface DeptFormDialogProps {
  farmId: number;
  dept: Department | null;
  open: boolean;
  onClose: () => void;
}

function DeptFormDialog({ farmId, dept, open, onClose }: DeptFormDialogProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [name, setName] = useState(dept?.name ?? "");
  const [description, setDescription] = useState(dept?.description ?? "");
  const [colour, setColour] = useState(dept?.colour ?? PRESET_COLOURS[0]);

  function reset() {
    setName(dept?.name ?? "");
    setDescription(dept?.description ?? "");
    setColour(dept?.colour ?? PRESET_COLOURS[0]);
  }

  const save = useMutation({
    mutationFn: async () => {
      const url = dept
        ? `/api/farms/${farmId}/departments/${dept.id}`
        : `/api/farms/${farmId}/departments`;
      const res = await fetch(url, {
        method: dept ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || null, colour }),
      });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farm-departments", farmId] });
      queryClient.invalidateQueries({ queryKey: ["farm-members", farmId] });
      toast({ title: dept ? "Department updated" : "Department created" });
      onClose();
    },
    onError: () => toast({ title: "Failed to save department", variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent style={{ maxWidth: "32rem" }}>
        <DialogHeader>
          <DialogTitle>{dept ? "Edit Department" : "Add Department"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="dept-name">Name *</Label>
            <Input
              id="dept-name"
              className="mt-1"
              placeholder="e.g. Arable, Livestock, Dairy…"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="dept-desc">Description</Label>
            <Input
              id="dept-desc"
              className="mt-1"
              placeholder="Optional short description"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <div>
            <Label>Colour</Label>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {PRESET_COLOURS.map(c => (
                <button
                  key={c}
                  onClick={() => setColour(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${colour === c ? "border-foreground scale-110" : "border-transparent"}`}
                  style={{ background: c }}
                  title={c}
                  type="button"
                />
              ))}
              <input
                type="color"
                value={colour}
                onChange={e => setColour(e.target.value)}
                className="w-7 h-7 rounded cursor-pointer border border-border"
                title="Custom colour"
              />
              <span
                className="ml-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                style={{ background: colour }}
              >
                <span className="w-2 h-2 rounded-full bg-white/40" />
                Preview
              </span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onClose(); }}>Cancel</Button>
          <Button onClick={() => save.mutate()} disabled={!name.trim() || save.isPending}>
            {save.isPending ? "Saving…" : dept ? "Save Changes" : "Add Department"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function DepartmentsPage() {
  const { farmId } = useAppStore();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [dialogDept, setDialogDept] = useState<Department | null | "new">(null);
  const [viewDept, setViewDept] = useState<Department | null>(null);

  const { data, isLoading, isError, refetch } = useQuery<{ departments: Department[] }>({
    queryKey: ["farm-departments", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/departments`, { headers: authHeaders() }).then(r => r.json()),
    enabled: !!farmId,
  });

  const departments = data?.departments ?? [];
  const active = departments.filter(d => d.isActive);

  const deleteDept = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/farms/${farmId}/departments/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farm-departments", farmId] });
      queryClient.invalidateQueries({ queryKey: ["farm-members", farmId] });
      toast({ title: "Department removed" });
    },
    onError: () => toast({ title: "Failed to remove department", variant: "destructive" }),
  });

  if (!farmId) return null;

  return (
    <AppLayout title="Departments">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm text-muted-foreground">
            Organise your staff into departments. Departments can be assigned to individual staff members.
          </p>
        </div>
        <Button onClick={() => setDialogDept("new")}>
          <Plus className="w-4 h-4 mr-2" />
          Add Department
        </Button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Loading departments…
          </CardContent>
        </Card>
      )}

      {/* Error state */}
      {isError && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <p className="text-sm text-muted-foreground">Failed to load departments.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!isLoading && !isError && departments.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 gap-4 text-center px-6">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">No departments yet</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Create departments to organise your staff — for example Arable, Livestock, Dairy, or Maintenance.
              </p>
            </div>
            <Button onClick={() => setDialogDept("new")}>
              <Plus className="w-4 h-4 mr-2" />
              Add first department
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Departments list */}
      {!isLoading && !isError && departments.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="px-6 py-3 border-b border-border/50 bg-black/[0.02] flex items-center justify-between">
              <p className="text-sm font-semibold flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                Farm Departments
                <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5 font-normal">
                  {active.length} active
                </span>
              </p>
            </div>
            <div className="divide-y divide-border/40">
              {departments.map(d => (
                <div key={d.id} className="flex items-center gap-4 px-6 py-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: d.colour + "22" }}
                  >
                    <div className="w-4 h-4 rounded-full" style={{ background: d.colour }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{d.name}</p>
                    {d.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{d.description}</p>
                    )}
                  </div>
                  <span
                    className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-white shrink-0"
                    style={{ background: d.colour }}
                  >
                    {d.name}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setViewDept(d)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      title="View staff"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDialogDept(d)}
                      className="h-8 w-8 p-0"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm(`Remove "${d.name}"? Any staff assigned to this department will be unlinked.`)) {
                          deleteDept.mutate(d.id);
                        }
                      }}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit dialog */}
      {dialogDept !== null && (
        <DeptFormDialog
          farmId={farmId}
          dept={dialogDept === "new" ? null : dialogDept}
          open
          onClose={() => setDialogDept(null)}
        />
      )}

      {/* View members dialog */}
      {viewDept !== null && (
        <DeptMembersDialog
          farmId={farmId}
          dept={viewDept}
          open
          onClose={() => setViewDept(null)}
        />
      )}
    </AppLayout>
  );
}
