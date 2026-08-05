import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSecret } from "@/lib/auth";
import { api, type LookupGroup, type LookupMasterItem } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import { DialogMutationError } from "@/components/ui/dialog-error";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Trash2, PencilLine, ExternalLink, CheckCircle2, Clock, ChevronUp, ChevronDown, EyeOff, Eye } from "lucide-react";

export default function Lookups() {
  const secret = getSecret() ?? "";
  const { toast } = useToast();
  const qc = useQueryClient();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [addLabel, setAddLabel] = useState("");
  const [editItem, setEditItem] = useState<LookupMasterItem | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [deleteItem, setDeleteItem] = useState<LookupMasterItem | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewedBy, setReviewedBy] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewNextDue, setReviewNextDue] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-lookups"],
    queryFn: () => api.getLookups(secret),
  });

  const groups = data?.groups ?? [];
  const group = groups.find((g) => g.key === selectedKey) ?? null;

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-lookups"] });

  const addMut = useMutation({
    mutationFn: (label: string) => api.addLookupItem(selectedKey!, label, undefined, secret),
    onSuccess: () => { invalidate(); setAddLabel(""); toast({ title: "Item added" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: { label?: string; isActive?: boolean; displayOrder?: number } }) =>
      api.updateLookupItem(selectedKey!, id, updates, secret),
    onSuccess: () => { invalidate(); setEditItem(null); toast({ title: "Item updated" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => api.deleteLookupItem(selectedKey!, id, secret),
    onSuccess: () => { invalidate(); setDeleteItem(null); toast({ title: "Item deleted" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const reorderMut = useMutation({
    mutationFn: (orderedIds: number[]) => api.reorderLookupItems(selectedKey!, orderedIds, secret),
    onSuccess: () => invalidate(),
    onError: (e: Error) => toast({ title: "Reorder failed", description: e.message, variant: "destructive" }),
  });

  const reviewMut = useMutation({
    mutationFn: () =>
      api.logLookupReview(selectedKey!, { reviewedBy, notes: reviewNotes, nextReviewDue: reviewNextDue || undefined }, secret),
    onSuccess: () => {
      invalidate();
      setShowReviewForm(false);
      setReviewedBy("");
      setReviewNotes("");
      setReviewNextDue("");
      toast({ title: "Review logged" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  function moveItem(items: LookupMasterItem[], fromIdx: number, toIdx: number) {
    const reordered = [...items];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    reorderMut.mutate(reordered.map((i) => i.id));
  }

  function reviewStatus(group: LookupGroup): { label: string; color: string } {
    if (!group.lastReview) return { label: "Never reviewed", color: "bg-red-100 text-red-700" };
    const due = group.lastReview.nextReviewDue ? new Date(group.lastReview.nextReviewDue) : null;
    if (!due) return { label: "Reviewed", color: "bg-green-100 text-green-700" };
    const now = new Date();
    const daysUntil = Math.ceil((due.getTime() - now.getTime()) / 86400000);
    if (daysUntil < 0) return { label: "Overdue", color: "bg-red-100 text-red-700" };
    if (daysUntil <= 30) return { label: `Due in ${daysUntil}d`, color: "bg-amber-100 text-amber-700" };
    return { label: `Due ${due.toLocaleDateString("en-GB")}`, color: "bg-green-100 text-green-700" };
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      <aside className="w-72 border-r overflow-y-auto shrink-0">
        <div className="px-4 py-4 border-b">
          <h2 className="font-semibold text-sm text-foreground">Lookup Lists</h2>
          <p className="text-xs text-muted-foreground mt-0.5">BDE-managed master values</p>
        </div>
        <div className="py-2">
          {groups.map((g) => {
            const status = reviewStatus(g);
            return (
              <button
                key={g.key}
                onClick={() => { setSelectedKey(g.key); setAddLabel(""); setShowReviewForm(false); }}
                className={`w-full text-left px-4 py-3 border-b last:border-b-0 transition-colors ${
                  selectedKey === g.key
                    ? "bg-primary/10 border-l-2 border-l-primary"
                    : "hover:bg-muted/50"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium leading-tight">{g.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{g.masterItems.length} items</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {g.customCount > 0 && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0">{g.customCount} custom</Badge>
                    )}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      <div className="flex-1 overflow-y-auto">
        {!group ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p className="text-sm">Select a lookup list on the left to manage its values.</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold">{group.label}</h1>
                <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>
                    Authority:{" "}
                    {group.authorityUrl ? (
                      <a href={group.authorityUrl} target="_blank" rel="noreferrer" className="underline inline-flex items-center gap-1">
                        {group.authority} <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      group.authority
                    )}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Review: {group.reviewFrequency}</span>
                </div>
              </div>
              {group.customCount > 0 && (
                <Badge variant="outline" className="shrink-0">{group.customCount} farm custom value{group.customCount !== 1 ? "s" : ""}</Badge>
              )}
            </div>

            <div className="bg-muted/30 border rounded-lg">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <h3 className="text-sm font-semibold">Master Values ({group.masterItems.length})</h3>
              </div>
              <div className="divide-y">
                {group.masterItems.length === 0 && (
                  <p className="text-sm text-muted-foreground px-4 py-4">No items yet. Add one below.</p>
                )}
                {group.masterItems.map((item, idx) => (
                  <div key={item.id} className={`flex items-center gap-2 px-4 py-2.5 ${!item.isActive ? "opacity-50" : ""}`}>
                    <div className="flex flex-col gap-0.5 mr-1">
                      <button
                        disabled={idx === 0}
                        onClick={() => moveItem(group.masterItems, idx, idx - 1)}
                        className="text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        disabled={idx === group.masterItems.length - 1}
                        onClick={() => moveItem(group.masterItems, idx, idx + 1)}
                        className="text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="flex-1 text-sm">{item.label}</span>
                    {!item.isActive && (
                      <Badge variant="secondary" className="text-xs">Hidden</Badge>
                    )}
                    <button
                      onClick={() => updateMut.mutate({ id: item.id, updates: { isActive: !item.isActive } })}
                      className="text-muted-foreground hover:text-foreground"
                      title={item.isActive ? "Hide from farms" : "Show to farms"}
                    >
                      {item.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => { setEditItem(item); setEditLabel(item.label); }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <PencilLine className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteItem(item)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 border-t flex gap-2">
                <Input
                  value={addLabel}
                  onChange={(e) => setAddLabel(e.target.value)}
                  placeholder="Add new value…"
                  className="text-sm"
                  onKeyDown={(e) => { if (e.key === "Enter" && addLabel.trim()) addMut.mutate(addLabel.trim()); }}
                />
                <Button
                  size="sm"
                  disabled={!addLabel.trim() || addMut.isPending}
                  onClick={() => addMut.mutate(addLabel.trim())}
                >
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>
            </div>

            <div className="bg-muted/30 border rounded-lg">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Quarterly Review</h3>
                  {group.lastReview ? (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Last reviewed by {group.lastReview.reviewedBy} on {new Date(group.lastReview.reviewedAt).toLocaleDateString("en-GB")}
                      {group.lastReview.nextReviewDue && ` · Next due ${new Date(group.lastReview.nextReviewDue).toLocaleDateString("en-GB")}`}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-0.5">No review recorded yet</p>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowReviewForm(!showReviewForm)}>
                  <CheckCircle2 className="w-4 h-4 mr-1" /> Log Review
                </Button>
              </div>
              {showReviewForm && (
                <div className="px-4 py-4 space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Reviewed by *</label>
                    <Input value={reviewedBy} onChange={(e) => setReviewedBy(e.target.value)} placeholder="Your name" className="text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes</label>
                    <Textarea value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} placeholder="Any changes made, authority references checked…" className="text-sm" rows={2} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Next review due</label>
                    <Input type="date" value={reviewNextDue} onChange={(e) => setReviewNextDue(e.target.value)} className="text-sm" />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" disabled={!reviewedBy.trim() || reviewMut.isPending} onClick={() => reviewMut.mutate()}>
                      Save Review
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowReviewForm(false)}>Cancel</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteItem} onOpenChange={(open) => { if (!open) { setDeleteItem(null); deleteMut.reset(); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteItem?.label}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this option from the master list. Existing records using this value will be unaffected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <DialogMutationError mutation={deleteMut} message="Failed to delete this item — it has not been removed." />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); if (deleteItem) deleteMut.mutate(deleteItem.id); }}
              disabled={deleteMut.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!editItem} onOpenChange={(open) => { if (!open) { setEditItem(null); updateMut.reset(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <label className="text-sm font-medium mb-1 block">Label</label>
            <Input
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && editLabel.trim() && editItem) updateMut.mutate({ id: editItem.id, updates: { label: editLabel.trim() } }); }}
            />
          </div>
          <DialogMutationError mutation={updateMut} message="Failed to save this item — your change has not been applied." />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditItem(null); updateMut.reset(); }}>Cancel</Button>
            <Button
              disabled={!editLabel.trim() || updateMut.isPending}
              onClick={() => { if (editItem) updateMut.mutate({ id: editItem.id, updates: { label: editLabel.trim() } }); }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
