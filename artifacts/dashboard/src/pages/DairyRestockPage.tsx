import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Loader2, Package, FlaskConical, Clock, CheckCircle2, Truck,
  XCircle, Plus, Trash2, AlertTriangle, ChevronDown, ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface RestockRequest {
  id: number;
  dairyType: string;
  requestDate: string;
  itemType: string;
  itemName: string;
  requestedQty: string;
  unit: string;
  urgency: string;
  requestedBy: string | null;
  reason: string | null;
  status: string;
  adminNotes: string | null;
  resolvedBy: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

const DAIRY_LABELS: Record<string, string> = {
  cattle: "Cattle Dairy",
  sheep: "Sheep Dairy",
  goat: "Goat Dairy",
  "organic-cattle": "Organic Cattle Dairy",
  "organic-sheep": "Organic Sheep Dairy",
  "organic-goat": "Organic Goat Dairy",
};

const URGENCY_META: Record<string, { label: string; className: string }> = {
  low: { label: "Low", className: "bg-gray-100 text-gray-700" },
  normal: { label: "Normal", className: "bg-blue-100 text-blue-700" },
  urgent: { label: "Urgent", className: "bg-amber-100 text-amber-800" },
  critical: { label: "Critical", className: "bg-red-100 text-red-800" },
};

const STATUS_META: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  pending: { label: "Pending", icon: Clock, className: "bg-amber-100 text-amber-800" },
  approved: { label: "Approved", icon: CheckCircle2, className: "bg-blue-100 text-blue-700" },
  ordered: { label: "Ordered", icon: Truck, className: "bg-purple-100 text-purple-700" },
  received: { label: "Received", icon: CheckCircle2, className: "bg-green-100 text-green-800" },
  rejected: { label: "Cancelled", icon: XCircle, className: "bg-red-100 text-red-700" },
};

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

const today = () => new Date().toISOString().slice(0, 10);

interface NewRequestForm {
  dairyType: string;
  requestDate: string;
  itemType: string;
  itemName: string;
  requestedQty: string;
  unit: string;
  urgency: string;
  requestedBy: string;
  reason: string;
}

const BLANK: NewRequestForm = {
  dairyType: "cattle",
  requestDate: today(),
  itemType: "ppe",
  itemName: "",
  requestedQty: "",
  unit: "",
  urgency: "normal",
  requestedBy: "",
  reason: "",
};

export default function DairyRestockPage() {
  const { farmId } = useAppStore();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("pending");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewRequestForm>(BLANK);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data, isLoading } = useQuery<{ requests: RestockRequest[] }>({
    queryKey: ["dairy-restock", farmId, statusFilter],
    queryFn: () =>
      fetch(`/api/farms/${farmId}/dairy-supplies/restock-requests?status=${statusFilter}`, {
        credentials: "include",
      }).then((r) => r.json()),
    enabled: !!farmId,
  });

  const create = useMutation({
    mutationFn: (body: NewRequestForm) =>
      fetch(`/api/farms/${farmId}/dairy-supplies/restock-requests`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...body,
          requestedQty: Number(body.requestedQty),
        }),
      }).then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dairy-restock", farmId] });
      setForm(BLANK);
      setShowForm(false);
      toast({ title: "Request submitted" });
    },
    onError: () => toast({ title: "Failed to submit request", variant: "destructive" }),
  });

  const patch = useMutation({
    mutationFn: ({ id, ...body }: { id: number; status?: string; adminNotes?: string; resolvedBy?: string }) =>
      fetch(`/api/farms/${farmId}/dairy-supplies/restock-requests/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dairy-restock", farmId] });
      toast({ title: "Request updated" });
    },
    onError: () => toast({ title: "Failed to update request", variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/farms/${farmId}/dairy-supplies/restock-requests/${id}`, {
        method: "DELETE",
        credentials: "include",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dairy-restock", farmId] });
      toast({ title: "Request deleted" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const requests = data?.requests ?? [];
  const criticalCount = requests.filter((r) => r.urgency === "critical").length;
  const urgentCount = requests.filter((r) => r.urgency === "urgent").length;

  function field(k: keyof NewRequestForm, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Dairy Supplies — Restock Requests
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Raise and track requests for PPE and chemical supply replenishment across your dairy operations.
            </p>
          </div>
          <Button onClick={() => setShowForm((s) => !s)} className="shrink-0">
            <Plus className="w-4 h-4 mr-1" />
            New Request
          </Button>
        </div>

        {/* Urgency alerts */}
        {(criticalCount > 0 || urgentCount > 0) && (
          <div className="flex gap-3 flex-wrap">
            {criticalCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-900 font-medium">
                <AlertTriangle className="w-4 h-4" />
                {criticalCount} critical request{criticalCount > 1 ? "s" : ""} awaiting action
              </div>
            )}
            {urgentCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900 font-medium">
                <AlertTriangle className="w-4 h-4" />
                {urgentCount} urgent request{urgentCount > 1 ? "s" : ""}
              </div>
            )}
          </div>
        )}

        {/* New request form */}
        {showForm && (
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="font-semibold text-sm">New Restock Request</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Dairy type</Label>
                <Select value={form.dairyType} onValueChange={(v) => field("dairyType", v)}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(DAIRY_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Request date</Label>
                <Input type="date" className="h-8 text-sm" value={form.requestDate} onChange={(e) => field("requestDate", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Item type</Label>
                <Select value={form.itemType} onValueChange={(v) => field("itemType", v)}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ppe">PPE / Consumables</SelectItem>
                    <SelectItem value="chemical">Chemical / Teat Dip</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label className="text-xs">Item name</Label>
                <Input className="h-8 text-sm" placeholder="e.g. Nitrile gloves size L" value={form.itemName} onChange={(e) => field("itemName", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Urgency</Label>
                <Select value={form.urgency} onValueChange={(v) => field("urgency", v)}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Quantity</Label>
                <Input type="number" min="0" className="h-8 text-sm" placeholder="0" value={form.requestedQty} onChange={(e) => field("requestedQty", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Unit</Label>
                <Input className="h-8 text-sm" placeholder="boxes / litres / pairs…" value={form.unit} onChange={(e) => field("unit", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Requested by</Label>
                <Input className="h-8 text-sm" placeholder="Name (optional)" value={form.requestedBy} onChange={(e) => field("requestedBy", e.target.value)} />
              </div>
              <div className="space-y-1.5 col-span-2 sm:col-span-3">
                <Label className="text-xs">Reason / notes</Label>
                <Textarea rows={2} className="text-sm" placeholder="Why is this needed? Any additional context…" value={form.reason} onChange={(e) => field("reason", e.target.value)} />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setForm(BLANK); }}>Cancel</Button>
              <Button size="sm" disabled={create.isPending || !form.itemName || !form.requestedQty || !form.unit}
                onClick={() => create.mutate(form)}>
                {create.isPending && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />}
                Submit Request
              </Button>
            </div>
          </div>
        )}

        {/* Filter row */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="ordered">Ordered</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="rejected">Cancelled</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">{requests.length} record{requests.length !== 1 ? "s" : ""}</span>
        </div>

        {/* List */}
        <div className="rounded-xl border bg-card overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No {statusFilter === "all" ? "" : statusFilter} restock requests.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-xs text-muted-foreground uppercase tracking-wide">
                  <th className="py-2 px-4 text-left">Date</th>
                  <th className="py-2 px-4 text-left">Dairy</th>
                  <th className="py-2 px-4 text-left">Type</th>
                  <th className="py-2 px-4 text-left">Item</th>
                  <th className="py-2 px-4 text-left">Qty</th>
                  <th className="py-2 px-4 text-left">Urgency</th>
                  <th className="py-2 px-4 text-left">Status</th>
                  <th className="py-2 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => {
                  const sm = STATUS_META[r.status] ?? STATUS_META.pending;
                  const um = URGENCY_META[r.urgency] ?? URGENCY_META.normal;
                  const expanded = expandedId === r.id;
                  return (
                    <>
                      <tr key={r.id} className="border-b hover:bg-muted/20 transition-colors">
                        <td className="py-2.5 px-4 text-muted-foreground">{fmt(r.requestDate)}</td>
                        <td className="py-2.5 px-4 text-xs text-muted-foreground">{DAIRY_LABELS[r.dairyType] ?? r.dairyType}</td>
                        <td className="py-2.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${r.itemType === "ppe" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`}>
                            {r.itemType === "ppe" ? <Package className="w-3 h-3" /> : <FlaskConical className="w-3 h-3" />}
                            {r.itemType === "ppe" ? "PPE" : "Chemical"}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-medium max-w-[180px]">
                          <div className="truncate" title={r.itemName}>{r.itemName}</div>
                          {r.requestedBy && <div className="text-xs text-muted-foreground">by {r.requestedBy}</div>}
                        </td>
                        <td className="py-2.5 px-4 tabular-nums">{r.requestedQty} {r.unit}</td>
                        <td className="py-2.5 px-4"><Badge className={um.className}>{um.label}</Badge></td>
                        <td className="py-2.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${sm.className}`}>
                            <sm.icon className="w-3 h-3" />{sm.label}
                          </span>
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="flex gap-1 flex-wrap items-center">
                            {r.status === "pending" && (
                              <Button size="sm" variant="outline" className="h-6 text-xs px-2"
                                onClick={() => patch.mutate({ id: r.id, status: "ordered" })}>
                                Mark Ordered
                              </Button>
                            )}
                            {r.status === "ordered" && (
                              <Button size="sm" variant="outline" className="h-6 text-xs px-2 text-green-700 border-green-300"
                                onClick={() => patch.mutate({ id: r.id, status: "received" })}>
                                Mark Received
                              </Button>
                            )}
                            {(r.status === "pending" || r.status === "ordered") && (
                              <Button size="sm" variant="ghost" className="h-6 text-xs px-2 text-red-500"
                                onClick={() => patch.mutate({ id: r.id, status: "rejected" })}>
                                Cancel
                              </Button>
                            )}
                            {r.status === "pending" && (
                              <Button size="sm" variant="ghost" className="h-6 text-xs px-1.5 text-muted-foreground"
                                onClick={() => remove.mutate(r.id)} title="Delete">
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            {(r.reason || r.adminNotes) && (
                              <Button size="sm" variant="ghost" className="h-6 text-xs px-1.5 text-muted-foreground"
                                onClick={() => setExpandedId(expanded ? null : r.id)}>
                                {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {expanded && (
                        <tr key={`${r.id}-detail`} className="border-b bg-muted/10">
                          <td colSpan={8} className="px-4 py-3 text-sm space-y-1">
                            {r.reason && <p><span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">Reason: </span>{r.reason}</p>}
                            {r.adminNotes && <p><span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">Notes: </span>{r.adminNotes}</p>}
                            {r.resolvedAt && <p className="text-xs text-muted-foreground">Resolved {fmt(r.resolvedAt)}{r.resolvedBy ? ` by ${r.resolvedBy}` : ""}</p>}
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
