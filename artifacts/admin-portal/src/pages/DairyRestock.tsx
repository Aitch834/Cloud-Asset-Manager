import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Package, FlaskConical, Clock, CheckCircle2, Truck, XCircle, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getSecret } from "@/lib/auth";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

function apiUrl(path: string) {
  return `${API_BASE}/${path}`;
}

async function adminFetch(path: string, opts: RequestInit = {}) {
  const secret = getSecret();
  const res = await fetch(apiUrl(path), {
    ...opts,
    headers: {
      "x-admin-secret": secret ?? "",
      "Content-Type": "application/json",
      ...(opts.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

interface RestockRequest {
  id: number; farmId: number; farmName: string;
  dairyType: string; requestDate: string; itemType: string; itemName: string;
  requestedQty: string; unit: string; urgency: string;
  requestedBy: string | null; reason: string | null;
  status: string; adminNotes: string | null; createdAt: string;
}

const DAIRY_LABELS: Record<string, string> = {
  cattle: "Cattle Dairy", sheep: "Sheep Dairy", goat: "Goat Dairy",
  "organic-cattle": "Organic Cattle Dairy", "organic-sheep": "Organic Sheep Dairy", "organic-goat": "Organic Goat Dairy",
};

const URGENCY_META: Record<string, { label: string; className: string }> = {
  low: { label: "Low", className: "bg-gray-100 text-gray-700" },
  normal: { label: "Normal", className: "bg-blue-100 text-blue-700" },
  urgent: { label: "Urgent", className: "bg-amber-100 text-amber-800" },
  critical: { label: "Critical", className: "bg-red-100 text-red-800" },
};

const STATUS_META: Record<string, { label: string; icon: typeof Clock; className: string }> = {
  pending: { label: "Pending", icon: Clock, className: "bg-amber-100 text-amber-800" },
  approved: { label: "Approved", icon: CheckCircle2, className: "bg-blue-100 text-blue-700" },
  ordered: { label: "Ordered", icon: Truck, className: "bg-purple-100 text-purple-700" },
  received: { label: "Received", icon: CheckCircle2, className: "bg-green-100 text-green-800" },
  rejected: { label: "Rejected", icon: XCircle, className: "bg-red-100 text-red-700" },
};

const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default function DairyRestock() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("pending");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNotes, setEditNotes] = useState("");

  const q = useQuery<{ requests: RestockRequest[] }>({
    queryKey: ["admin-dairy-restock", statusFilter],
    queryFn: () => adminFetch(`admin/dairy-restock-requests?status=${statusFilter}`),
    refetchInterval: 30000,
  });

  const update = useMutation({
    mutationFn: ({ id, ...body }: { id: number; status: string; adminNotes?: string }) =>
      adminFetch(`admin/dairy-restock-requests/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-dairy-restock"] });
      setEditingId(null);
      toast({ title: "Request updated" });
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });

  const requests = q.data?.requests ?? [];
  const criticalCount = requests.filter(r => r.urgency === "critical").length;
  const urgentCount = requests.filter(r => r.urgency === "urgent").length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dairy Restock Requests</h1>
          <p className="text-sm text-muted-foreground mt-1">Supply replenishment requests raised by farm dairy staff across all tenants.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => qc.invalidateQueries({ queryKey: ["admin-dairy-restock"] })}>
          <RefreshCw className="w-3.5 h-3.5 mr-1" />Refresh
        </Button>
      </div>

      {/* Summary badges */}
      {(criticalCount > 0 || urgentCount > 0) && (
        <div className="flex gap-3">
          {criticalCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-900 font-medium">
              <AlertTriangle className="w-4 h-4" />{criticalCount} Critical
            </div>
          )}
          {urgentCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900 font-medium">
              <AlertTriangle className="w-4 h-4" />{urgentCount} Urgent
            </div>
          )}
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Filter by status:</span>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 h-8 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="ordered">Ordered</SelectItem>
            <SelectItem value="received">Received</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="all">All statuses</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">{requests.length} records</span>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {q.isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No restock requests with status "{statusFilter}".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-xs text-muted-foreground uppercase tracking-wide">
                  <th className="py-2 px-4 text-left">Farm</th>
                  <th className="py-2 px-4 text-left">Dairy Type</th>
                  <th className="py-2 px-4 text-left">Type</th>
                  <th className="py-2 px-4 text-left">Item</th>
                  <th className="py-2 px-4 text-left">Qty</th>
                  <th className="py-2 px-4 text-left">Urgency</th>
                  <th className="py-2 px-4 text-left">Requested By</th>
                  <th className="py-2 px-4 text-left">Date</th>
                  <th className="py-2 px-4 text-left">Status</th>
                  <th className="py-2 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(r => {
                  const sm = STATUS_META[r.status] ?? STATUS_META.pending;
                  const um = URGENCY_META[r.urgency] ?? URGENCY_META.normal;
                  return (
                    <>
                      <tr key={r.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 px-4 font-medium">{r.farmName}</td>
                        <td className="py-2.5 px-4 text-muted-foreground text-xs">{DAIRY_LABELS[r.dairyType] ?? r.dairyType}</td>
                        <td className="py-2.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${r.itemType === "ppe" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`}>
                            {r.itemType === "ppe" ? <Package className="w-3 h-3" /> : <FlaskConical className="w-3 h-3" />}
                            {r.itemType === "ppe" ? "PPE" : "Chemical"}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-medium max-w-[160px]">
                          <div className="truncate" title={r.itemName}>{r.itemName}</div>
                          {r.reason && <div className="text-xs text-muted-foreground truncate" title={r.reason}>{r.reason}</div>}
                        </td>
                        <td className="py-2.5 px-4 tabular-nums">{r.requestedQty} {r.unit}</td>
                        <td className="py-2.5 px-4"><Badge className={um.className}>{um.label}</Badge></td>
                        <td className="py-2.5 px-4 text-muted-foreground">{r.requestedBy || "—"}</td>
                        <td className="py-2.5 px-4 text-muted-foreground">{fmt(r.requestDate)}</td>
                        <td className="py-2.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${sm.className}`}>
                            <sm.icon className="w-3 h-3" />{sm.label}
                          </span>
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="flex gap-1 flex-wrap">
                            {r.status === "pending" && (
                              <Button size="sm" variant="outline" className="h-6 text-xs px-2"
                                onClick={() => update.mutate({ id: r.id, status: "approved" })}>Approve</Button>
                            )}
                            {r.status === "approved" && (
                              <Button size="sm" variant="outline" className="h-6 text-xs px-2"
                                onClick={() => update.mutate({ id: r.id, status: "ordered" })}>Mark Ordered</Button>
                            )}
                            {r.status === "ordered" && (
                              <Button size="sm" variant="outline" className="h-6 text-xs px-2 text-green-700 border-green-300"
                                onClick={() => update.mutate({ id: r.id, status: "received" })}>Mark Received</Button>
                            )}
                            {r.status !== "received" && r.status !== "rejected" && (
                              <Button size="sm" variant="ghost" className="h-6 text-xs px-2 text-red-500"
                                onClick={() => update.mutate({ id: r.id, status: "rejected" })}>Reject</Button>
                            )}
                            <Button size="sm" variant="ghost" className="h-6 text-xs px-2"
                              onClick={() => { setEditingId(editingId === r.id ? null : r.id); setEditNotes(r.adminNotes ?? ""); }}>
                              Notes
                            </Button>
                          </div>
                        </td>
                      </tr>
                      {editingId === r.id && (
                        <tr key={`${r.id}-notes`} className="border-b bg-muted/20">
                          <td colSpan={10} className="px-4 py-3">
                            <div className="flex items-start gap-3 max-w-xl">
                              <div className="flex-1">
                                <p className="text-xs text-muted-foreground mb-1">Admin notes for this request:</p>
                                <Textarea rows={2} value={editNotes} onChange={e => setEditNotes(e.target.value)} placeholder="Add notes visible to farm users..." className="text-sm" />
                              </div>
                              <div className="flex flex-col gap-1 pt-5">
                                <Button size="sm" className="h-7 text-xs" onClick={() => update.mutate({ id: r.id, status: r.status, adminNotes: editNotes })}>Save</Button>
                                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingId(null)}>Cancel</Button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
