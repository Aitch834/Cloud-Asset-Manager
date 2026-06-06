import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ClipboardList } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FarmMember {
  id: number;
  firstName: string;
  lastName: string;
  jobTitle?: string | null;
  departmentId?: number | null;
  departmentName?: string | null;
  departmentColour?: string | null;
}

interface DeptGroup {
  deptId: number | null;
  deptName: string;
  deptColour: string | null;
  members: FarmMember[];
}

function buildDeptGroups(members: FarmMember[]): DeptGroup[] {
  const map = new Map<string, DeptGroup>();
  for (const m of members) {
    const key = m.departmentName ?? "__none__";
    if (!map.has(key)) {
      map.set(key, {
        deptId: m.departmentId ?? null,
        deptName: m.departmentName ?? "No Department",
        deptColour: m.departmentColour ?? null,
        members: [],
      });
    }
    map.get(key)!.members.push(m);
  }
  const groups = Array.from(map.values());
  groups.sort((a, b) => {
    if (a.deptName === "No Department") return 1;
    if (b.deptName === "No Department") return -1;
    return a.deptName.localeCompare(b.deptName);
  });
  return groups;
}

interface RaiseTaskDialogProps {
  farmId: number;
  open: boolean;
  onClose: () => void;
  defaultTitle?: string;
  defaultDescription?: string;
  defaultNote?: string;
  defaultDueDate?: string;
  taskType?: string;
  module?: string;
  allowEditTitle?: boolean;
  onAssigned?: () => void;
}

export function RaiseTaskDialog({
  farmId, open, onClose,
  defaultTitle = "", defaultDescription = "", defaultNote = "",
  defaultDueDate = "", taskType = "custom", module = "General",
  allowEditTitle = false,
  onAssigned,
}: RaiseTaskDialogProps) {
  const { toast } = useToast();
  const qc = useQueryClient();

  const [assignedToMemberId, setAssignedToMemberId] = useState("");
  const [dueDate, setDueDate] = useState(defaultDueDate || new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState(defaultNote);
  const [editableTitle, setEditableTitle] = useState(defaultTitle);

  const membersQ = useQuery<{ members: FarmMember[] }>({
    queryKey: ["farm-members", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/members`, { credentials: "include" }).then(r => r.json()),
    enabled: open && !!farmId,
  });
  const members = (membersQ.data?.members ?? []).filter(m => (m as any).isActive !== false);
  const groups = buildDeptGroups(members);
  const hasDepts = groups.some(g => g.deptName !== "No Department");

  const createMut = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      fetch(`/api/farms/${farmId}/task-assignments`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify(body),
      }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["task-assignments", farmId] });
      toast({ title: "Task raised and assigned" });
      handleClose();
      onAssigned?.();
    },
    onError: () => toast({ title: "Failed to raise task", variant: "destructive" }),
  });

  function handleClose() {
    setAssignedToMemberId("");
    setDueDate(defaultDueDate || new Date().toISOString().slice(0, 10));
    setNote(defaultNote);
    setEditableTitle(defaultTitle);
    onClose();
  }

  function handleSubmit() {
    const title = allowEditTitle ? editableTitle.trim() : defaultTitle;
    if (!title) { toast({ title: "Please enter a task title", variant: "destructive" }); return; }
    if (!assignedToMemberId) { toast({ title: "Please select a staff member", variant: "destructive" }); return; }
    createMut.mutate({
      assignedToMemberId: parseInt(assignedToMemberId),
      title,
      description: defaultDescription || null,
      dueDate: dueDate || null,
      assignmentNote: note || null,
      taskType,
      module,
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent style={{ maxWidth: 480 }} aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-primary" />
            {allowEditTitle ? "New Task" : "Raise Task"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-1">
          {allowEditTitle ? (
            <div className="space-y-1">
              <Label>Task title <span className="text-destructive">*</span></Label>
              <Input
                placeholder="e.g. Fix broken gate in north field"
                value={editableTitle}
                onChange={e => setEditableTitle(e.target.value)}
                autoFocus
              />
            </div>
          ) : (
          <div className="bg-muted/50 border rounded-lg px-3 py-2.5">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-0.5">Task</p>
            <p className="text-sm font-medium text-foreground">{defaultTitle || "—"}</p>
            {defaultDescription && <p className="text-xs text-muted-foreground mt-0.5">{defaultDescription}</p>}
          </div>
          )}
          <div className="space-y-1">
            <Label>Assign to <span className="text-destructive">*</span></Label>
            <Select value={assignedToMemberId} onValueChange={setAssignedToMemberId}>
              <SelectTrigger>
                <SelectValue placeholder={membersQ.isLoading ? "Loading staff…" : "Select staff member"} />
              </SelectTrigger>
              <SelectContent>
                {!membersQ.isLoading && members.length === 0 && (
                  <SelectItem value="__none__" disabled>No staff registered</SelectItem>
                )}
                {hasDepts ? (
                  groups.map((g, gi) => (
                    <SelectGroup key={g.deptName}>
                      <SelectLabel className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                        {g.deptColour && (
                          <span
                            style={{
                              display: "inline-block",
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: g.deptColour,
                              flexShrink: 0,
                            }}
                          />
                        )}
                        {g.deptName}
                      </SelectLabel>
                      {g.members.map(m => (
                        <SelectItem key={m.id} value={String(m.id)}>
                          {m.firstName} {m.lastName}{m.jobTitle ? ` · ${m.jobTitle}` : ""}
                        </SelectItem>
                      ))}
                      {gi < groups.length - 1 && <SelectSeparator />}
                    </SelectGroup>
                  ))
                ) : (
                  members.map(m => (
                    <SelectItem key={m.id} value={String(m.id)}>
                      {m.firstName} {m.lastName}{m.jobTitle ? ` · ${m.jobTitle}` : ""}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Due date</Label>
            <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Instructions for assignee</Label>
            <Textarea rows={2} placeholder="Any specific instructions or context…" value={note} onChange={e => setNote(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={createMut.isPending || !assignedToMemberId}>
            {createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Raise Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
