import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ClipboardList } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FarmMember { id: number; firstName: string; lastName: string; jobTitle?: string | null; }

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
  onAssigned?: () => void;
}

export function RaiseTaskDialog({
  farmId, open, onClose,
  defaultTitle = "", defaultDescription = "", defaultNote = "",
  defaultDueDate = "", taskType = "custom", module = "General",
  onAssigned,
}: RaiseTaskDialogProps) {
  const { toast } = useToast();
  const qc = useQueryClient();

  const [assignedToMemberId, setAssignedToMemberId] = useState("");
  const [dueDate, setDueDate] = useState(defaultDueDate || new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState(defaultNote);

  const membersQ = useQuery<{ members: FarmMember[] }>({
    queryKey: ["farm-members", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/members`, { credentials: "include" }).then(r => r.json()),
    enabled: open && !!farmId,
  });
  const members = membersQ.data?.members ?? [];

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
    onClose();
  }

  function handleSubmit() {
    if (!assignedToMemberId) { toast({ title: "Please select a staff member", variant: "destructive" }); return; }
    createMut.mutate({
      assignedToMemberId: parseInt(assignedToMemberId),
      title: defaultTitle,
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
            Raise Task
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-1">
          <div className="bg-muted/50 border rounded-lg px-3 py-2.5">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-0.5">Task</p>
            <p className="text-sm font-medium text-foreground">{defaultTitle || "—"}</p>
            {defaultDescription && <p className="text-xs text-muted-foreground mt-0.5">{defaultDescription}</p>}
          </div>
          <div className="space-y-1">
            <Label>Assign to <span className="text-destructive">*</span></Label>
            <Select value={assignedToMemberId} onValueChange={setAssignedToMemberId}>
              <SelectTrigger><SelectValue placeholder={membersQ.isLoading ? "Loading staff…" : "Select staff member"} /></SelectTrigger>
              <SelectContent>
                {members.map(m => (
                  <SelectItem key={m.id} value={String(m.id)}>
                    {m.firstName} {m.lastName}{m.jobTitle ? ` · ${m.jobTitle}` : ""}
                  </SelectItem>
                ))}
                {!membersQ.isLoading && members.length === 0 && (
                  <SelectItem value="__none__" disabled>No staff registered</SelectItem>
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
