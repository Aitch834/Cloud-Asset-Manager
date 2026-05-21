import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFarmMembers, memberFullName } from "@/hooks/use-farm-members";
import { StaffSelect } from "@/components/ui/staff-select";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Printer, Eye, Pencil } from "lucide-react";

const CSS_PRINT = `
  body { font-family: Arial, sans-serif; font-size: 10.5pt; color: #111; margin: 20mm; }
  h1 { font-size: 15pt; color: #166534; margin-bottom: 4px; }
  h2 { font-size: 11pt; color: #166534; margin-top: 22px; margin-bottom: 7px; border-bottom: 1px solid #bbf7d0; padding-bottom: 3px; }
  .meta { font-size: 9pt; color: #555; margin-bottom: 14px; }
  table { width: 100%; border-collapse: collapse; font-size: 9pt; margin-bottom: 10px; }
  th { background: #f0fdf4; border: 1px solid #d1fae5; padding: 5px 7px; text-align: left; font-weight: 600; }
  td { border: 1px solid #e5e7eb; padding: 5px 7px; vertical-align: top; }
  tr:nth-child(even) td { background: #f9fafb; }
  .badge-pass { background:#dcfce7; color:#166534; padding:1px 6px; border-radius:4px; font-size:8.5pt; font-weight:600; }
  .badge-advisory { background:#fef3c7; color:#92400e; padding:1px 6px; border-radius:4px; font-size:8.5pt; font-weight:600; }
  .badge-fail { background:#fee2e2; color:#991b1b; padding:1px 6px; border-radius:4px; font-size:8.5pt; font-weight:600; }
  .notice { background:#fffbeb; border:1px solid #fde68a; border-radius:5px; padding:7px 10px; font-size:8.5pt; color:#92400e; margin-bottom:12px; }
  .footer { margin-top: 28px; font-size: 8pt; color: #888; border-top: 1px solid #e5e7eb; padding-top: 7px; }
  .sig-block { margin-top: 36px; }
  .sig-row { display: flex; gap: 32px; margin-top: 20px; }
  .sig-field { flex: 1; }
  .sig-line { border-bottom: 1px solid #333; height: 30px; margin-bottom: 3px; }
  .sig-label { font-size: 8.5pt; color: #555; }
  @page { margin: 14mm; }
  @media print { body { margin: 0; } }
`;

function openPrint(title: string, html: string) {
  const w = window.open("", "_blank", "width=920,height=700");
  if (!w) return;
  w.document.write(
    `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${title}</title><style>${CSS_PRINT}</style></head><body>${html}</body></html>`
  );
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 500);
}

function doSSAFOPrint(stores: any[], inspections: any[], farmId: number) {
  const now = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const storeRows = stores
    .map(
      (s) => `<tr>
      <td><strong>${s.storeName}</strong></td>
      <td>${s.storeType || "—"}</td>
      <td>${s.capacityM3 != null ? `${s.capacityM3} m³` : "—"}</td>
      <td>${s.material || "—"}</td>
      <td>${s.designStandard || "—"}</td>
      <td>${s.agencyRegistrationNumber || "—"}</td>
      <td>${s.lastInspectionDate ? new Date(s.lastInspectionDate).toLocaleDateString("en-GB") : "Not inspected"}</td>
      <td>${s.nextInspectionDue ? new Date(s.nextInspectionDue).toLocaleDateString("en-GB") : "—"}</td>
      <td><span class="badge-${s.status === "Compliant" ? "pass" : "fail"}">${s.status || "—"}</span></td>
    </tr>`
    )
    .join("");
  const inspRows = [...inspections]
    .sort((a, b) => new Date(b.inspectionDate).getTime() - new Date(a.inspectionDate).getTime())
    .map(
      (r) => `<tr>
        <td>${new Date(r.inspectionDate).toLocaleDateString("en-GB")}</td>
        <td><strong>${r.storeName || "—"}</strong></td>
        <td>${[r.inspectorName, r.inspectorOrganisation].filter(Boolean).join(", ") || "—"}</td>
        <td><span class="badge-${r.outcome === "Pass" ? "pass" : r.outcome === "Advisory" ? "advisory" : "fail"}">${r.outcome}</span></td>
        <td>${r.freeboardOk ? "Yes" : "No"}</td>
        <td>${r.leaksOrDamageFound ? "<strong style='color:#991b1b'>Yes</strong>" : "No"}</td>
        <td>${r.deficiencies || "—"}</td>
        <td>${r.actionsRequired || "—"}</td>
        <td>${r.nextInspectionDue ? new Date(r.nextInspectionDue).toLocaleDateString("en-GB") : "—"}</td>
      </tr>`
    )
    .join("");
  openPrint(
    "SSAFO Compliance Register",
    `<h1>SSAFO Compliance Register — Slurry &amp; Manure Stores</h1>
    <div class="meta">Farm ID: ${farmId} &nbsp;|&nbsp; Generated: ${now} &nbsp;|&nbsp; ${stores.length} store${stores.length !== 1 ? "s" : ""} | ${inspections.length} inspection record${inspections.length !== 1 ? "s" : ""}</div>
    <div class="notice"><strong>SSAFO requirement (England):</strong> The Silage, Slurry and Agricultural Fuel Oil Regulations 2010 require that slurry storage structures are maintained in good condition, regularly inspected, and that records are available on request by the Environment Agency.</div>
    <h2>Store Inventory (${stores.length})</h2>
    ${stores.length === 0 ? "<p>No stores recorded.</p>" : `<table><thead><tr><th>Store Name</th><th>Type</th><th>Capacity</th><th>Material</th><th>Design Std</th><th>EA Ref</th><th>Last Insp.</th><th>Next Due</th><th>Status</th></tr></thead><tbody>${storeRows}</tbody></table>`}
    <h2>Inspection History (${inspections.length})</h2>
    ${inspections.length === 0 ? "<p>No inspection records.</p>" : `<table><thead><tr><th>Date</th><th>Store</th><th>Inspector</th><th>Outcome</th><th>Freeboard OK</th><th>Leaks</th><th>Deficiencies</th><th>Actions</th><th>Next Due</th></tr></thead><tbody>${inspRows}</tbody></table>`}
    <div class="sig-block"><h2>EA Inspector Sign-off</h2>
      <div class="sig-row">
        <div class="sig-field"><div class="sig-line"></div><div class="sig-label">EA Officer signature</div></div>
        <div class="sig-field"><div class="sig-line"></div><div class="sig-label">Name (print)</div></div>
        <div class="sig-field"><div class="sig-line"></div><div class="sig-label">Date of visit</div></div>
        <div class="sig-field"><div class="sig-line"></div><div class="sig-label">Farmer signature</div></div>
      </div>
    </div>
    <div class="footer">Generated by BDE Farm Trac. SSAFO Regulations 2010 (SI 2010/639). Retain and make available for Environment Agency inspection on request.</div>`
  );
}

function doSpreadingPrint(spreadings: any[], farmId: number) {
  const now = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const sorted = [...spreadings].sort(
    (a, b) => new Date(b.spreadingDate ?? 0).getTime() - new Date(a.spreadingDate ?? 0).getTime()
  );
  const rows = sorted
    .map(
      (r) => `<tr>
    <td>${r.spreadingDate ? new Date(r.spreadingDate).toLocaleDateString("en-GB") : "—"}</td>
    <td>${r.fieldName || "—"}</td>
    <td>${r.fieldAreaHa != null ? `${r.fieldAreaHa} ha` : "—"}</td>
    <td>${r.materialType || "—"}</td>
    <td>${r.volumeOrTonnesApplied != null ? r.volumeOrTonnesApplied : "—"}</td>
    <td>${r.applicationMethod || "—"}</td>
    <td>${r.operatorName || "—"}</td>
    <td>${r.weatherConditions || "—"}</td>
    <td>${r.notes || "—"}</td>
  </tr>`
    )
    .join("");
  openPrint(
    "Organic Material Spreading Records",
    `<h1>Organic Material Spreading Records</h1>
    <div class="meta">Farm ID: ${farmId} &nbsp;|&nbsp; Generated: ${now} &nbsp;|&nbsp; ${spreadings.length} record${spreadings.length !== 1 ? "s" : ""}</div>
    <div class="notice"><strong>Farming Rules for Water (2018) &amp; NVZ requirements:</strong> Records of organic material applications must be retained for at least five years.</div>
    <h2>Spreading Records (${spreadings.length})</h2>
    ${spreadings.length === 0 ? "<p>No spreading records.</p>" : `<table><thead><tr><th>Date</th><th>Field</th><th>Area (ha)</th><th>Material</th><th>Volume/Tonnes</th><th>Method</th><th>Operator</th><th>Weather</th><th>Notes</th></tr></thead><tbody>${rows}</tbody></table>`}
    <div class="sig-block"><h2>Sign-off</h2>
      <div class="sig-row">
        <div class="sig-field" style="flex:2"><div class="sig-line"></div><div class="sig-label">Farm manager signature</div></div>
        <div class="sig-field"><div class="sig-line"></div><div class="sig-label">Name (print)</div></div>
        <div class="sig-field"><div class="sig-line"></div><div class="sig-label">Date</div></div>
      </div>
    </div>
    <div class="footer">Generated by BDE Farm Trac. Farming Rules for Water (SI 2018/151). Retain for a minimum of five years.</div>`
  );
}

export function SlurryTab({ farmId, openId }: { farmId: number; openId?: number | null }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: membersData, isLoading: membersLoading } = useFarmMembers(farmId);
  const staffNames = (membersData?.members ?? []).map((m) => memberFullName(m));
  const activeMembers = (membersData?.members ?? []).filter((m) => m.isActive);

  const [storeOpen, setStoreOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Record<string, unknown> | null>(null);
  const [storeForm, setStoreForm] = useState<Record<string, string>>({});
  const [viewStore, setViewStore] = useState<Record<string, unknown> | null>(null);

  const [spreadOpen, setSpreadOpen] = useState(false);
  const [spreadForm, setSpreadForm] = useState<Record<string, string>>({});

  const [inspOpen, setInspOpen] = useState(false);
  const [editingInsp, setEditingInsp] = useState<Record<string, unknown> | null>(null);
  const [inspForm, setInspForm] = useState<Record<string, string>>({});
  const [inspStoreId, setInspStoreId] = useState("");
  const [deleteInspId, setDeleteInspId] = useState<number | null>(null);

  const [raiseTaskOpen, setRaiseTaskOpen] = useState(false);
  const [pendingTask, setPendingTask] = useState<{ title: string; description: string } | null>(null);
  const [taskAssigneeId, setTaskAssigneeId] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");

  const [hlId, setHlId] = useState<number | null>(openId ?? null);
  const storeRowRefs = useRef<Map<number, HTMLElement>>(new Map());
  const autoOpened = useRef(false);

  const fieldsQ = useQuery({
    queryKey: ["fields", farmId],
    queryFn: () =>
      fetch(`/api/farms/${farmId}/fields`, { credentials: "include" })
        .then((r) => r.json())
        .then((d: any) => d.records ?? []),
  });

  const storesQ = useQuery({
    queryKey: ["slurry-stores", farmId],
    queryFn: () =>
      fetch(`/api/farms/${farmId}/slurry-stores`, { credentials: "include" }).then((r) => r.json()),
    select: (d: any) => (d.records ?? []) as Record<string, unknown>[],
  });

  const spreadQ = useQuery({
    queryKey: ["slurry-spreading", farmId],
    queryFn: () =>
      fetch(`/api/farms/${farmId}/slurry-spreading-records`, { credentials: "include" }).then((r) =>
        r.json()
      ),
    select: (d: any) => (d.records ?? []) as Record<string, unknown>[],
  });

  const inspQ = useQuery({
    queryKey: ["slurry-inspections", farmId],
    queryFn: () =>
      fetch(`/api/farms/${farmId}/slurry-store-inspections`, { credentials: "include" }).then((r) =>
        r.json()
      ),
    select: (d: any) => (d.records ?? []) as Record<string, unknown>[],
  });

  const saveStoreMut = useMutation({
    mutationFn: (body: Record<string, unknown>) => {
      const url = editingStore
        ? `/api/farms/${farmId}/slurry-stores/${editingStore.id}`
        : `/api/farms/${farmId}/slurry-stores`;
      return fetch(url, {
        method: editingStore ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["slurry-stores", farmId] });
      setStoreOpen(false);
      setStoreForm({});
      setEditingStore(null);
      toast({ title: "Store saved" });
    },
    onError: () => toast({ title: "Failed to save store", variant: "destructive" }),
  });

  const saveSpreadMut = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      fetch(`/api/farms/${farmId}/slurry-spreading-records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["slurry-spreading", farmId] });
      setSpreadOpen(false);
      setSpreadForm({});
      toast({ title: "Spreading record saved" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const saveInspMut = useMutation({
    mutationFn: (body: Record<string, unknown>) => {
      const url = editingInsp
        ? `/api/farms/${farmId}/slurry-store-inspections/${editingInsp.id}`
        : `/api/farms/${farmId}/slurry-store-inspections`;
      return fetch(url, {
        method: editingInsp ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      }).then((r) => r.json());
    },
    onSuccess: (_data: unknown, variables: any) => {
      qc.invalidateQueries({ queryKey: ["slurry-inspections", farmId] });
      qc.invalidateQueries({ queryKey: ["slurry-stores", farmId] });
      setInspOpen(false);
      setInspForm({});
      setEditingInsp(null);
      toast({ title: editingInsp ? "Inspection updated" : "Inspection recorded" });
      if (variables?.actionsRequired?.trim()) {
        const store = (storesQ.data ?? []).find(
          (s) => String(s.id) === String(variables.storeId)
        );
        const storeName = store ? String(store.storeName ?? "store") : "store";
        const dateStr = variables.inspectionDate
          ? new Date(variables.inspectionDate).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "";
        setPendingTask({
          title: `Slurry Store Inspection Follow-up — ${storeName} (${dateStr})`,
          description: variables.actionsRequired.trim(),
        });
        setTaskAssigneeId("");
        setTaskDueDate("");
        setRaiseTaskOpen(true);
      }
    },
    onError: () => toast({ title: "Failed to save inspection", variant: "destructive" }),
  });

  const deleteInspMut = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/farms/${farmId}/slurry-store-inspections/${id}`, {
        method: "DELETE",
        credentials: "include",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["slurry-inspections", farmId] });
      setDeleteInspId(null);
      toast({ title: "Inspection deleted" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const raiseTaskMut = useMutation({
    mutationFn: (body: object) =>
      fetch(`/api/farms/${farmId}/task-assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Task raised — assignee will be notified by SMS" });
      setRaiseTaskOpen(false);
      setPendingTask(null);
    },
    onError: () => toast({ title: "Failed to raise task", variant: "destructive" }),
  });

  useEffect(() => {
    if (!openId || autoOpened.current || (storesQ.data ?? []).length === 0) return;
    const target = (storesQ.data ?? []).find((r) => Number(r.id) === openId);
    if (target) {
      autoOpened.current = true;
      setTimeout(() => setViewStore(target), 100);
    }
  }, [openId, storesQ.data]);

  const stores = storesQ.data ?? [];
  const spreadings = spreadQ.data ?? [];
  const inspections = inspQ.data ?? [];

  function openInspDialog(store: Record<string, unknown> | null) {
    setEditingInsp(null);
    setInspForm({
      inspectionDate: new Date().toISOString().slice(0, 10),
      outcome: "Pass",
      storeId: store ? String(store.id) : "",
    });
    setInspStoreId(store ? String(store.id) : "");
    setInspOpen(true);
  }

  const statusBadge = (status: unknown) =>
    String(status) === "Compliant"
      ? "bg-green-100 text-green-700"
      : "bg-amber-100 text-amber-700";

  const outcomeBadge = (outcome: unknown) =>
    outcome === "Pass"
      ? "bg-green-100 text-green-700"
      : outcome === "Advisory"
      ? "bg-amber-100 text-amber-700"
      : "bg-red-100 text-red-700";

  return (
    <div className="space-y-6">
      {/* ── Stores ─────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Slurry &amp; Manure Stores</h3>
          <div className="flex gap-2">
            {stores.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => doSSAFOPrint(stores, inspections, farmId)}
              >
                <Printer className="w-4 h-4 mr-1" /> SSAFO Register
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => {
                setEditingStore(null);
                setStoreForm({ status: "Compliant" });
                setStoreOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" /> Add Store
            </Button>
          </div>
        </div>
        {storesQ.isLoading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : (
          <div className="bg-white rounded-xl border border-border/50 shadow-sm overflow-x-auto">
            {stores.length === 0 ? (
              <p className="text-sm text-muted-foreground italic py-6 text-center">
                No slurry stores recorded.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-black/5 border-b">
                  <tr>
                    {["Store Name", "Type", "Capacity (m³)", "Material", "Last Inspection", "Next Due", "Status", ""].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-left px-4 py-3 font-medium text-muted-foreground text-xs"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {stores.map((r) => (
                    <tr
                      key={Number(r.id)}
                      ref={(el) => {
                        if (el) storeRowRefs.current.set(Number(r.id), el as HTMLElement);
                      }}
                      className={`transition-colors${
                        hlId === Number(r.id)
                          ? " bg-amber-50 outline outline-2 outline-amber-400 -outline-offset-2"
                          : " hover:bg-black/5"
                      }`}
                    >
                      <td className="px-4 py-3 font-medium">{String(r.storeName ?? "—")}</td>
                      <td className="px-4 py-3">{String(r.storeType ?? "—")}</td>
                      <td className="px-4 py-3">{String(r.capacityM3 ?? "—")}</td>
                      <td className="px-4 py-3">{String(r.material ?? "—")}</td>
                      <td className="px-4 py-3">
                        {r.lastInspectionDate
                          ? new Date(r.lastInspectionDate as string).toLocaleDateString("en-GB")
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {r.nextInspectionDue
                          ? new Date(r.nextInspectionDue as string).toLocaleDateString("en-GB")
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadge(r.status)}`}
                        >
                          {String(r.status ?? "—")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setViewStore(r)}
                            title="View"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            style={{ fontSize: "0.75rem", height: 28, padding: "0 10px" }}
                            onClick={() => openInspDialog(r)}
                          >
                            Inspect
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setEditingStore(r);
                              setStoreForm(
                                Object.fromEntries(
                                  Object.entries(r).map(([k, v]) => [k, String(v ?? "")])
                                )
                              );
                              setStoreOpen(true);
                            }}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* ── View Store dialog ──────────────────────────────── */}
      {viewStore && (
        <Dialog open onOpenChange={() => setViewStore(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Slurry / Manure Store</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm py-1">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground uppercase font-medium mb-0.5">
                    Store Name
                  </p>
                  <p className="font-semibold">{String(viewStore.storeName ?? "—")}</p>
                </div>
                {!!viewStore.storeType && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-medium mb-0.5">Type</p>
                    <p>{String(viewStore.storeType)}</p>
                  </div>
                )}
                {!!viewStore.capacityM3 && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-medium mb-0.5">
                      Capacity (m³)
                    </p>
                    <p>{String(viewStore.capacityM3)}</p>
                  </div>
                )}
                {!!viewStore.material && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-medium mb-0.5">
                      Material
                    </p>
                    <p>{String(viewStore.material)}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-medium mb-0.5">Status</p>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadge(viewStore.status)}`}
                  >
                    {String(viewStore.status ?? "—")}
                  </span>
                </div>
                {!!viewStore.lastInspectionDate && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-medium mb-0.5">
                      Last Inspection
                    </p>
                    <p>
                      {new Date(viewStore.lastInspectionDate as string).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                )}
                {!!viewStore.nextInspectionDue && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-medium mb-0.5">
                      Next Inspection Due
                    </p>
                    <p>
                      {new Date(viewStore.nextInspectionDue as string).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  const s = viewStore;
                  setViewStore(null);
                  setEditingStore(s);
                  setStoreForm(
                    Object.fromEntries(Object.entries(s).map(([k, v]) => [k, String(v ?? "")]))
                  );
                  setStoreOpen(true);
                }}
              >
                Edit
              </Button>
              <Button variant="ghost" onClick={() => setViewStore(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Spreading Records ──────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Spreading Records</h3>
          <div className="flex gap-2">
            {spreadings.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => doSpreadingPrint(spreadings, farmId)}
              >
                <Printer className="w-4 h-4 mr-1" /> Print Log
              </Button>
            )}
            <Button size="sm" onClick={() => { setSpreadForm({}); setSpreadOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Log Spreading
            </Button>
          </div>
        </div>
        {spreadQ.isLoading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : (
          <div className="bg-white rounded-xl border border-border/50 shadow-sm overflow-x-auto">
            {spreadings.length === 0 ? (
              <p className="text-sm text-muted-foreground italic py-6 text-center">
                No spreading records yet.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-black/5 border-b">
                  <tr>
                    {["Date", "Field", "Area (ha)", "Material", "Volume/Tonnes", "Method", "Operator"].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-left px-4 py-3 font-medium text-muted-foreground text-xs"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {spreadings.map((r, i) => (
                    <tr key={i} className="hover:bg-black/5">
                      <td className="px-4 py-3">
                        {r.spreadingDate
                          ? new Date(r.spreadingDate as string).toLocaleDateString("en-GB")
                          : "—"}
                      </td>
                      <td className="px-4 py-3">{String(r.fieldName ?? "—")}</td>
                      <td className="px-4 py-3">{String(r.fieldAreaHa ?? "—")}</td>
                      <td className="px-4 py-3">{String(r.materialType ?? "—")}</td>
                      <td className="px-4 py-3">{String(r.volumeOrTonnesApplied ?? "—")}</td>
                      <td className="px-4 py-3">{String(r.applicationMethod ?? "—")}</td>
                      <td className="px-4 py-3">{String(r.operatorName ?? "—")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* ── Inspection Records ─────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Store Inspection Records</h3>
          <Button size="sm" onClick={() => openInspDialog(null)}>
            <Plus className="w-4 h-4 mr-2" /> Log Inspection
          </Button>
        </div>
        {inspQ.isLoading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : (
          <div className="bg-white rounded-xl border border-border/50 shadow-sm overflow-x-auto">
            {inspections.length === 0 ? (
              <p className="text-sm text-muted-foreground italic py-6 text-center">
                No inspections recorded. Use the "Inspect" button on a store row to log one.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-black/5 border-b">
                  <tr>
                    {["Date", "Store", "Inspector", "Outcome", "Leaks / Damage", "Next Due", "Actions", ""].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-left px-4 py-3 font-medium text-muted-foreground text-xs"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {inspections.map((r: any) => (
                    <tr key={r.id} className="hover:bg-black/5">
                      <td className="px-4 py-3">
                        {r.inspectionDate
                          ? new Date(r.inspectionDate).toLocaleDateString("en-GB")
                          : "—"}
                      </td>
                      <td className="px-4 py-3 font-medium">{r.storeName ?? "—"}</td>
                      <td className="px-4 py-3">
                        {[r.inspectorName, r.inspectorOrganisation].filter(Boolean).join(", ") || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${outcomeBadge(r.outcome)}`}
                        >
                          {r.outcome}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {r.leaksOrDamageFound ? (
                          <span className="text-red-600 font-medium">Yes</span>
                        ) : (
                          "No"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {r.nextInspectionDue
                          ? new Date(r.nextInspectionDue).toLocaleDateString("en-GB")
                          : "—"}
                      </td>
                      <td
                        className="px-4 py-3 text-gray-600 text-xs"
                        style={{ maxWidth: 200 }}
                      >
                        {r.actionsRequired || "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setEditingInsp(r);
                              setInspForm(
                                Object.fromEntries(
                                  Object.entries(r).map(([k, v]) => [k, String(v ?? "")])
                                )
                              );
                              setInspStoreId(String(r.storeId));
                              setInspOpen(true);
                            }}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => setDeleteInspId(Number(r.id))}
                          >
                            <span style={{ fontSize: "0.75rem" }}>✕</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* ── Add/Edit Store dialog ─────────────────────────── */}
      <Dialog open={storeOpen} onOpenChange={setStoreOpen}>
        <DialogContent style={{ maxWidth: "40rem" }}>
          <DialogHeader>
            <DialogTitle>{editingStore ? "Edit Store" : "Add Slurry / Manure Store"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Store Name *</Label>
              <Input
                value={storeForm.storeName ?? ""}
                onChange={(e) => setStoreForm((f) => ({ ...f, storeName: e.target.value }))}
              />
            </div>
            <div>
              <Label>Store Type *</Label>
              <Select
                value={storeForm.storeType ?? ""}
                onValueChange={(v) => setStoreForm((f) => ({ ...f, storeType: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Slurry Lagoon",
                    "Slurry Tank",
                    "Reception Pit",
                    "Silage Clamp",
                    "Dung Pad",
                    "Manure Store",
                    "Earth Bank Store",
                  ].map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Capacity (m³)</Label>
              <Input
                type="number"
                value={storeForm.capacityM3 ?? ""}
                onChange={(e) => setStoreForm((f) => ({ ...f, capacityM3: e.target.value }))}
              />
            </div>
            <div>
              <Label>Material</Label>
              <Select
                value={storeForm.material ?? ""}
                onValueChange={(v) => setStoreForm((f) => ({ ...f, material: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Cattle Slurry",
                    "Pig Slurry",
                    "Poultry Slurry",
                    "FYM (Cattle)",
                    "FYM (Pig)",
                    "FYM (Poultry)",
                    "Digestate",
                    "Mixed",
                  ].map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Design Standard</Label>
              <Input
                value={storeForm.designStandard ?? ""}
                onChange={(e) => setStoreForm((f) => ({ ...f, designStandard: e.target.value }))}
                placeholder="e.g. CIRIA 126"
              />
            </div>
            <div>
              <Label>Required Storage (months)</Label>
              <Input
                type="number"
                value={storeForm.requiredStorage ?? ""}
                onChange={(e) =>
                  setStoreForm((f) => ({ ...f, requiredStorage: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={storeForm.status ?? "Compliant"}
                onValueChange={(v) => setStoreForm((f) => ({ ...f, status: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Compliant", "Non-Compliant", "Under Repair", "Decommissioned"].map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Agency Ref / Permit No.</Label>
              <Input
                value={storeForm.agencyRegistrationNumber ?? ""}
                onChange={(e) =>
                  setStoreForm((f) => ({ ...f, agencyRegistrationNumber: e.target.value }))
                }
                placeholder="EA permit or RPID ref"
              />
            </div>
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={storeForm.notes ?? ""}
                onChange={(e) => setStoreForm((f) => ({ ...f, notes: e.target.value }))}
                rows={2}
                placeholder="General notes about this store…"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStoreOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => saveStoreMut.mutate(storeForm)}
              disabled={saveStoreMut.isPending}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Spreading dialog ──────────────────────────────── */}
      <Dialog open={spreadOpen} onOpenChange={setSpreadOpen}>
        <DialogContent style={{ maxWidth: "40rem" }}>
          <DialogHeader>
            <DialogTitle>Log Slurry / Manure Spreading</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Spreading Date *</Label>
              <Input
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                value={spreadForm.spreadingDate ?? ""}
                onChange={(e) => setSpreadForm((f) => ({ ...f, spreadingDate: e.target.value }))}
              />
            </div>
            <div>
              <Label>Field *</Label>
              <Select
                value={spreadForm.fieldId || "__select__"}
                onValueChange={(v) => {
                  if (v === "__select__" || v === "__noop__") return;
                  const field = (fieldsQ.data ?? []).find((f: any) => f.id.toString() === v);
                  setSpreadForm((f) => ({
                    ...f,
                    fieldId: v,
                    fieldName: field?.name ?? "",
                    fieldAreaHa:
                      f.fieldAreaHa ||
                      (field?.areaHectares
                        ? parseFloat(field.areaHectares).toFixed(2)
                        : ""),
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select field…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__select__" disabled>
                    Select field…
                  </SelectItem>
                  {(fieldsQ.data ?? []).length === 0 && (
                    <SelectItem value="__noop__" disabled>
                      No fields registered — add in Fields &amp; Crops
                    </SelectItem>
                  )}
                  {(fieldsQ.data ?? []).map((f: any) => (
                    <SelectItem key={f.id} value={f.id.toString()}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Field Area (ha)</Label>
              <Input
                type="number"
                step="0.01"
                value={spreadForm.fieldAreaHa ?? ""}
                onChange={(e) => setSpreadForm((f) => ({ ...f, fieldAreaHa: e.target.value }))}
              />
            </div>
            <div>
              <Label>Material Type *</Label>
              <Select
                value={spreadForm.materialType ?? ""}
                onValueChange={(v) => setSpreadForm((f) => ({ ...f, materialType: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Cattle Slurry",
                    "Pig Slurry",
                    "Poultry Slurry",
                    "FYM (Cattle)",
                    "FYM (Pig)",
                    "FYM (Poultry)",
                    "Digestate",
                  ].map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Volume / Tonnes Applied</Label>
              <Input
                type="number"
                step="0.1"
                value={spreadForm.volumeOrTonnesApplied ?? ""}
                onChange={(e) =>
                  setSpreadForm((f) => ({ ...f, volumeOrTonnesApplied: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Application Method</Label>
              <Select
                value={spreadForm.applicationMethod ?? ""}
                onValueChange={(v) => setSpreadForm((f) => ({ ...f, applicationMethod: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Broadcast",
                    "Trailing shoe",
                    "Shallow injection",
                    "Deep injection",
                    "Band spread",
                    "Splash plate",
                  ].map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Incorporation Method</Label>
              <Select
                value={spreadForm.incorporationMethod ?? ""}
                onValueChange={(v) => setSpreadForm((f) => ({ ...f, incorporationMethod: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Not applicable",
                    "Ploughed in (6 hrs)",
                    "Cultivated (12 hrs)",
                    "Applied to bare soil",
                  ].map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Operator Name</Label>
              <StaffSelect
                value={spreadForm.operatorName ?? ""}
                onChange={(v) => setSpreadForm((f) => ({ ...f, operatorName: v }))}
                staffNames={staffNames}
                loading={membersLoading}
              />
            </div>
            <div>
              <Label>Soil Temperature (°C)</Label>
              <Input
                type="number"
                step="0.1"
                value={spreadForm.soilTemperature ?? ""}
                onChange={(e) => setSpreadForm((f) => ({ ...f, soilTemperature: e.target.value }))}
              />
            </div>
            <div>
              <Label>Weather Conditions</Label>
              <Input
                value={spreadForm.weatherConditions ?? ""}
                onChange={(e) =>
                  setSpreadForm((f) => ({ ...f, weatherConditions: e.target.value }))
                }
              />
            </div>
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={spreadForm.notes ?? ""}
                onChange={(e) => setSpreadForm((f) => ({ ...f, notes: e.target.value }))}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSpreadOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => saveSpreadMut.mutate(spreadForm)}
              disabled={saveSpreadMut.isPending}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Inspection dialog ─────────────────────────────── */}
      <Dialog
        open={inspOpen}
        onOpenChange={(o) => {
          if (!o) {
            setInspOpen(false);
            setEditingInsp(null);
            setInspForm({});
          }
        }}
      >
        <DialogContent style={{ maxWidth: "44rem" }}>
          <DialogHeader>
            <DialogTitle>
              {editingInsp ? "Edit Inspection Record" : "Log Store Inspection"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Store *</Label>
              <Select
                value={inspForm.storeId ?? inspStoreId}
                onValueChange={(v) => {
                  setInspForm((f) => ({ ...f, storeId: v }));
                  setInspStoreId(v);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select store…" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((s) => (
                    <SelectItem key={String(s.id)} value={String(s.id)}>
                      {String(s.storeName)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Inspection Date *</Label>
              <Input
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                value={inspForm.inspectionDate ?? ""}
                onChange={(e) => setInspForm((f) => ({ ...f, inspectionDate: e.target.value }))}
              />
            </div>
            <div>
              <Label>Inspector Name</Label>
              <Input
                value={inspForm.inspectorName ?? ""}
                onChange={(e) => setInspForm((f) => ({ ...f, inspectorName: e.target.value }))}
              />
            </div>
            <div>
              <Label>Inspector Organisation</Label>
              <Input
                value={inspForm.inspectorOrganisation ?? ""}
                onChange={(e) =>
                  setInspForm((f) => ({ ...f, inspectorOrganisation: e.target.value }))
                }
                placeholder="e.g. Internal, AHDB, EA"
              />
            </div>
            <div>
              <Label>Outcome *</Label>
              <Select
                value={inspForm.outcome ?? "Pass"}
                onValueChange={(v) => setInspForm((f) => ({ ...f, outcome: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pass">Pass — No deficiencies</SelectItem>
                  <SelectItem value="Advisory">Advisory — Minor issues noted</SelectItem>
                  <SelectItem value="Fail">Fail — Deficiencies requiring action</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Next Inspection Due</Label>
              <Input
                type="date"
                value={inspForm.nextInspectionDue ?? ""}
                onChange={(e) =>
                  setInspForm((f) => ({ ...f, nextInspectionDue: e.target.value }))
                }
              />
            </div>
            <div className="col-span-2 grid grid-cols-2 gap-3">
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={inspForm.freeboardOk === "true"}
                  onChange={(e) =>
                    setInspForm((f) => ({
                      ...f,
                      freeboardOk: e.target.checked ? "true" : "false",
                    }))
                  }
                  style={{ width: 16, height: 16 }}
                />
                Freeboard adequate
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={inspForm.leaksOrDamageFound === "true"}
                  onChange={(e) =>
                    setInspForm((f) => ({
                      ...f,
                      leaksOrDamageFound: e.target.checked ? "true" : "false",
                    }))
                  }
                  style={{ width: 16, height: 16 }}
                />
                <span
                  style={{
                    color: inspForm.leaksOrDamageFound === "true" ? "#dc2626" : "inherit",
                  }}
                >
                  Leaks or structural damage found
                </span>
              </label>
            </div>
            {inspForm.freeboardOk !== "true" && (
              <div>
                <Label>Freeboard (mm)</Label>
                <Input
                  type="number"
                  value={inspForm.freeboardMm ?? ""}
                  onChange={(e) => setInspForm((f) => ({ ...f, freeboardMm: e.target.value }))}
                />
              </div>
            )}
            <div className="col-span-2">
              <Label>Deficiencies Found</Label>
              <Textarea
                value={inspForm.deficiencies ?? ""}
                onChange={(e) => setInspForm((f) => ({ ...f, deficiencies: e.target.value }))}
                rows={2}
                placeholder="Describe any deficiencies observed…"
              />
            </div>
            <div className="col-span-2">
              <Label>Actions Required</Label>
              <Textarea
                value={inspForm.actionsRequired ?? ""}
                onChange={(e) =>
                  setInspForm((f) => ({ ...f, actionsRequired: e.target.value }))
                }
                rows={2}
                placeholder="Describe actions needed to remedy deficiencies…"
              />
              {inspForm.actionsRequired?.trim() && (
                <p style={{ fontSize: "0.75rem", color: "#92400e", marginTop: 4 }}>
                  A task will be raised on the Task Board when you save — you can assign it to
                  the responsible person.
                </p>
              )}
            </div>
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={inspForm.notes ?? ""}
                onChange={(e) => setInspForm((f) => ({ ...f, notes: e.target.value }))}
                rows={2}
                placeholder="Any other observations…"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setInspOpen(false);
                setEditingInsp(null);
                setInspForm({});
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={
                !inspForm.storeId ||
                !inspForm.inspectionDate ||
                !inspForm.outcome ||
                saveInspMut.isPending
              }
              onClick={() =>
                saveInspMut.mutate({
                  ...inspForm,
                  storeId: inspForm.storeId ?? inspStoreId,
                })
              }
            >
              {editingInsp ? "Save Changes" : "Save Inspection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Raise task dialog ────────────────────────────── */}
      <Dialog
        open={raiseTaskOpen}
        onOpenChange={(o) => {
          if (!o) {
            setRaiseTaskOpen(false);
            setPendingTask(null);
          }
        }}
      >
        <DialogContent style={{ maxWidth: 480 }}>
          <DialogHeader>
            <DialogTitle>Raise a Task for Inspection Actions?</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div
              style={{
                background: "#fef3c7",
                border: "1px solid #f59e0b",
                borderRadius: 6,
                padding: "0.625rem 0.875rem",
              }}
            >
              <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#92400e", marginBottom: 4 }}>
                Actions required:
              </p>
              <p style={{ fontSize: "0.8rem", color: "#78350f", margin: 0 }}>
                {pendingTask?.description}
              </p>
            </div>
            <div>
              <Label>
                Assign to <span style={{ color: "#ef4444" }}>*</span>
              </Label>
              <Select value={taskAssigneeId} onValueChange={setTaskAssigneeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select staff member…" />
                </SelectTrigger>
                <SelectContent>
                  {activeMembers.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>
                      {memberFullName(m)}
                      {m.jobTitle ? ` — ${m.jobTitle}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Due Date</Label>
              <Input
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
              />
            </div>
            <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>
              The assignee will receive an SMS notification. The task will appear on the Task Board
              and stay open until marked complete.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRaiseTaskOpen(false);
                setPendingTask(null);
              }}
            >
              Skip for now
            </Button>
            <Button
              disabled={!taskAssigneeId || raiseTaskMut.isPending}
              onClick={() => {
                if (!pendingTask || !taskAssigneeId) return;
                raiseTaskMut.mutate({
                  assignedToMemberId: Number(taskAssigneeId),
                  title: pendingTask.title,
                  description: pendingTask.description,
                  module: "Environmental",
                  taskType: "compliance",
                  href: "/environmental-management?tab=slurry",
                  ...(taskDueDate ? { dueDate: taskDueDate } : {}),
                });
              }}
            >
              Raise Task &amp; Notify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete inspection confirm ─────────────────────── */}
      <Dialog
        open={deleteInspId !== null}
        onOpenChange={(o) => {
          if (!o) setDeleteInspId(null);
        }}
      >
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader>
            <DialogTitle>Delete Inspection Record</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 py-2">
            Delete this inspection record? This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteInspId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteInspId !== null && deleteInspMut.mutate(deleteInspId)}
              disabled={deleteInspMut.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
