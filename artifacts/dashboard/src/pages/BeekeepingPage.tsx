import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/hooks/use-app-store";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { api } from "@/lib/api";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useRawFarmName } from "@/hooks/use-farm-name";
import { printRecordReport } from "@/lib/record-report";
import { AlertTriangle, Plus, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type Apiary = { id: number; apiaryName: string; location: string | null; numberOfHives: number; beebaseRegistration: string | null; species: string; isActive: boolean; notes: string | null };
type Inspection = { id: number; apiaryId: number; hiveRef: string | null; inspectionDate: string; inspectedBy: string; queenSeen: boolean | null; queenCells: boolean | null; broodPattern: string | null; estimatedColonySize: string | null; storesAdequate: boolean | null; diseaseSigns: string | null; varroaWashCount: number | null; temper: string | null; actionsTaken: string | null; treatmentApplied: string | null; nextInspectionDue: string | null; notificationSentToApha: boolean; notes: string | null };
type HoneyRecord = { id: number; apiaryId: number; harvestDate: string; quantityKg: string; lotNumber: string | null; moisturePercent: string | null; sold: boolean; notes: string | null };

const EMPTY_APIARY: Partial<Apiary> = { species: "honeybee", numberOfHives: 1, isActive: true };
const EMPTY_INSPECTION: Partial<Inspection> = { inspectionDate: new Date().toISOString().slice(0, 10), notificationSentToApha: false };
const EMPTY_HONEY: Partial<HoneyRecord> = { harvestDate: new Date().toISOString().slice(0, 10), sold: false };

const DISEASE_SIGNS_LIST = ["none", "varroa", "afb", "efb", "nosema", "chalkbrood", "sacbrood", "deformed_wing_virus"];

export default function BeekeepingPage() {
  const { farmId } = useAppStore();
  const qc = useQueryClient();
  const { toast } = useToast();
  const rawFarmName = useRawFarmName(farmId ?? 0);
  const [tab, setTab] = usePersistedTab<"apiaries" | "inspections" | "honey" | "analytics">({ page: "beekeeping", farmId, validIds: ["apiaries", "inspections", "honey", "analytics"], defaultTab: "apiaries" });
  const [apiaryId, setApiaryId] = useState<number | null>(null);
  const [apiaryOpen, setApiaryOpen] = useState(false);
  const [inspOpen, setInspOpen] = useState(false);
  const [honeyOpen, setHoneyOpen] = useState(false);
  const [editApiary, setEditApiary] = useState<Apiary | null>(null);
  const [editInsp, setEditInsp] = useState<Inspection | null>(null);
  const [editHoney, setEditHoney] = useState<HoneyRecord | null>(null);
  const [apiaryForm, setApiaryForm] = useState<any>(EMPTY_APIARY);
  const [inspForm, setInspForm] = useState<any>(EMPTY_INSPECTION);
  const [honeyForm, setHoneyForm] = useState<any>(EMPTY_HONEY);

  const apiariesQ = useQuery<Apiary[]>({
    queryKey: ["farms", farmId, "apiaries"],
    queryFn: () => api.get(`/farms/${farmId}/apiaries`).then(r => r.apiaries ?? []),
    enabled: !!farmId,
  });

  const inspsQ = useQuery<Inspection[]>({
    queryKey: ["farms", farmId, "apiary-inspections"],
    queryFn: () => api.get(`/farms/${farmId}/apiary-inspections`).then(r => r.inspections ?? []),
    enabled: !!farmId,
  });

  const honeyQ = useQuery<HoneyRecord[]>({
    queryKey: ["farms", farmId, "apiary-honey"],
    queryFn: () => api.get(`/farms/${farmId}/apiary-honey`).then(r => r.records ?? []),
    enabled: !!farmId,
  });

  const saveMut = (endpoint: string, editing: any, onSuccess: () => void) => useMutation({
    mutationFn: (body: any) => editing ? api.put(`/farms/${farmId}/${endpoint}/${editing.id}`, body) : api.post(`/farms/${farmId}/${endpoint}`, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["farms", farmId] }); toast({ title: "Saved" }); onSuccess(); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const apiarySave = saveMut("apiaries", editApiary, () => { setApiaryOpen(false); setEditApiary(null); setApiaryForm(EMPTY_APIARY); });
  const inspSave = saveMut("apiary-inspections", editInsp, () => { setInspOpen(false); setEditInsp(null); setInspForm(EMPTY_INSPECTION); });
  const honeySave = saveMut("apiary-honey", editHoney, () => { setHoneyOpen(false); setEditHoney(null); setHoneyForm(EMPTY_HONEY); });

  const apiaries = apiariesQ.data ?? [];
  const inspections = inspsQ.data ?? [];
  const honeyRecords = honeyQ.data ?? [];

  const filteredInsps = apiaryId ? inspections.filter(i => i.apiaryId === apiaryId) : inspections;
  const filteredHoney = apiaryId ? honeyRecords.filter(r => r.apiaryId === apiaryId) : honeyRecords;

  const totalHives = apiaries.filter(a => a.isActive).reduce((s, a) => s + a.numberOfHives, 0);
  const totalHoneyKg = honeyRecords.reduce((s, r) => s + parseFloat(r.quantityKg), 0);
  const diseasePositive = inspections.filter(i => i.diseaseSigns && i.diseaseSigns !== "none" && !i.diseaseSigns.includes("none")).length;

  const monthlyHoney = Array.from({ length: 12 }, (_, i) => {
    const m = String(i + 1).padStart(2, "0");
    return { month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i], kg: honeyRecords.filter(r => r.harvestDate.slice(5, 7) === m).reduce((s, r) => s + parseFloat(r.quantityKg), 0) };
  });

  const fa = (field: string, val: any) => setApiaryForm((p: any) => ({ ...p, [field]: val }));
  const fi = (field: string, val: any) => setInspForm((p: any) => ({ ...p, [field]: val }));
  const fh = (field: string, val: any) => setHoneyForm((p: any) => ({ ...p, [field]: val }));

  const getApiaryName = (id: number) => apiaries.find(a => a.id === id)?.apiaryName ?? `Apiary ${id}`;
  const printInspection = (inspection: Inspection) => printRecordReport({
    title: "Hive Inspection Record",
    farmName: rawFarmName,
    authority: inspection.notificationSentToApha ? "APHA" : undefined,
    authorityReferenceLabel: inspection.notificationSentToApha ? "BeeBase registration" : undefined,
    authorityReference: inspection.notificationSentToApha ? apiaries.find(a => a.id === inspection.apiaryId)?.beebaseRegistration : undefined,
    subtitle: `${getApiaryName(inspection.apiaryId)}${inspection.hiveRef ? ` — Hive ${inspection.hiveRef}` : ""}`,
    record: { ...inspection, apiaryName: getApiaryName(inspection.apiaryId) },
  });

  return (
    <AppLayout title="Beekeeping">
      <div className="mb-4 flex gap-2 flex-wrap">
        {(["apiaries","inspections","honey","analytics"] as const).map(t => (
          <Button key={t} variant={tab === t ? "default" : "outline"} size="sm" onClick={() => setTab(t)}>
            {t === "apiaries" ? "Apiaries" : t === "inspections" ? "Inspections" : t === "honey" ? "Honey Harvest" : "Analytics"}
          </Button>
        ))}
        {tab !== "apiaries" && apiaries.length > 1 && (
          <Select value={apiaryId?.toString() ?? ""} onValueChange={v => setApiaryId(v ? Number(v) : null)}>
            <SelectTrigger className="w-44 h-8 text-sm"><SelectValue placeholder="All apiaries" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All apiaries</SelectItem>
              {apiaries.map(a => <SelectItem key={a.id} value={String(a.id)}>{a.apiaryName}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      {tab === "apiaries" && (
        <>
          <div className="flex justify-end mb-4">
            <Button onClick={() => { setEditApiary(null); setApiaryForm(EMPTY_APIARY); setApiaryOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Apiary</Button>
          </div>
          {apiaries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <span className="text-5xl mb-2 block">🍯</span>
              <p>No apiaries registered. Add your first apiary.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {apiaries.map(a => (
                <div key={a.id} className={`bg-white border rounded-lg p-4 cursor-pointer hover:shadow-sm transition-shadow ${!a.isActive ? "opacity-60" : ""}`} onClick={() => { setEditApiary(a); setApiaryForm({ ...a }); setApiaryOpen(true); }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold">{a.apiaryName}</div>
                    <Badge className={a.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}>{a.isActive ? "Active" : "Inactive"}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    {a.location && <p>Location: {a.location}</p>}
                    <p>Hives: <strong>{a.numberOfHives}</strong> · Species: {a.species}</p>
                    {a.beebaseRegistration && <p>BeeBase: {a.beebaseRegistration}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "inspections" && (
        <>
          <div className="flex justify-end mb-4">
            <Button onClick={() => { setEditInsp(null); setInspForm({ ...EMPTY_INSPECTION, apiaryId: apiaryId ?? (apiaries[0]?.id ?? null) }); setInspOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Inspection</Button>
          </div>
          {filteredInsps.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground"><p>No inspections recorded yet.</p></div>
          ) : (
            <div className="space-y-3">
              {filteredInsps.sort((a, b) => b.inspectionDate.localeCompare(a.inspectionDate)).map(i => {
                const diseased = i.diseaseSigns && i.diseaseSigns !== "none" && !i.diseaseSigns.includes("none");
                return (
                  <div key={i.id} className={`bg-white border rounded-lg p-4 cursor-pointer hover:shadow-sm transition-shadow ${diseased ? "border-amber-300" : ""}`} onClick={() => { setEditInsp(i); setInspForm({ ...i }); setInspOpen(true); }}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{i.inspectionDate}</span>
                        <span className="text-xs text-muted-foreground">{getApiaryName(i.apiaryId)}{i.hiveRef ? ` — Hive ${i.hiveRef}` : ""}</span>
                        {i.queenSeen && <Badge className="text-xs bg-purple-100 text-purple-800">Queen seen</Badge>}
                        {diseased && <Badge className="text-xs bg-amber-100 text-amber-800"><AlertTriangle className="w-3 h-3 mr-1 inline" />{i.diseaseSigns}</Badge>}
                        {i.notificationSentToApha && <Badge className="text-xs bg-blue-100 text-blue-800">APHA notified</Badge>}
                      </div>
                      <Button size="sm" variant="ghost" onClick={e => { e.stopPropagation(); printInspection(i); }}><Printer className="w-4 h-4" /></Button>
                    </div>
                    <div className="text-xs text-muted-foreground space-x-3">
                      {i.inspectedBy && <span>By: {i.inspectedBy}</span>}
                      {i.broodPattern && <span>Brood: {i.broodPattern}</span>}
                      {i.estimatedColonySize && <span>Colony: {i.estimatedColonySize}</span>}
                      {i.varroaWashCount != null && <span>Varroa: {i.varroaWashCount}/100</span>}
                      {i.nextInspectionDue && <span className="text-blue-700">Next: {i.nextInspectionDue}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {tab === "honey" && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground">Total harvested: <strong>{totalHoneyKg.toFixed(1)} kg</strong></div>
            <Button onClick={() => { setEditHoney(null); setHoneyForm({ ...EMPTY_HONEY, apiaryId: apiaryId ?? (apiaries[0]?.id ?? null) }); setHoneyOpen(true); }}><Plus className="w-4 h-4 mr-1" />Record Harvest</Button>
          </div>
          {filteredHoney.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground"><p>No honey harvest records yet.</p></div>
          ) : (
            <div className="space-y-2">
              {filteredHoney.sort((a, b) => b.harvestDate.localeCompare(a.harvestDate)).map(r => (
                <div key={r.id} className="bg-white border rounded-lg p-3 flex items-center justify-between cursor-pointer hover:shadow-sm transition-shadow" onClick={() => { setEditHoney(r); setHoneyForm({ ...r }); setHoneyOpen(true); }}>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap text-sm">
                      <span className="font-medium">{r.harvestDate}</span>
                      <span className="text-muted-foreground">{getApiaryName(r.apiaryId)}</span>
                      <Badge className="bg-yellow-100 text-yellow-800">{r.quantityKg} kg</Badge>
                      {r.sold && <Badge className="bg-green-100 text-green-800">Sold</Badge>}
                      {r.lotNumber && <span className="text-xs text-muted-foreground">Lot: {r.lotNumber}</span>}
                    </div>
                    {r.moisturePercent && <div className="text-xs text-muted-foreground mt-0.5">Moisture: {r.moisturePercent}%</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "analytics" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Active Apiaries", value: apiaries.filter(a => a.isActive).length },
              { label: "Total Hives", value: totalHives },
              { label: "Total Honey (kg)", value: totalHoneyKg.toFixed(1) },
              { label: "Disease Observations", value: diseasePositive, amber: diseasePositive > 0 },
            ].map((s, i) => (
              <div key={i} className="bg-white border rounded-lg p-4 text-center">
                <div className={`text-2xl font-bold ${s.amber ? "text-amber-600" : ""}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
          {monthlyHoney.some(m => m.kg > 0) && (
            <div className="bg-white border rounded-lg p-4">
              <div className="text-sm font-medium mb-3">Monthly Honey Harvest (kg)</div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={monthlyHoney}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: any) => [`${Number(v).toFixed(1)} kg`]} />
                  <Bar dataKey="kg" fill="#eab308" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      <Dialog open={apiaryOpen} onOpenChange={o => { setApiaryOpen(o); if (!o) { setEditApiary(null); setApiaryForm(EMPTY_APIARY); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editApiary ? "Edit Apiary" : "Add Apiary"}</DialogTitle></DialogHeader>
          <form onSubmit={e => { e.preventDefault(); apiarySave.mutate({ ...apiaryForm, numberOfHives: Number(apiaryForm.numberOfHives ?? 1), isActive: Boolean(apiaryForm.isActive) }); }} className="space-y-3">
            <div><Label>Apiary Name *</Label><Input value={apiaryForm.apiaryName ?? ""} onChange={e => fa("apiaryName", e.target.value)} required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Location</Label><Input value={apiaryForm.location ?? ""} onChange={e => fa("location", e.target.value)} /></div>
              <div><Label>Number of Hives</Label><Input type="number" min="1" value={apiaryForm.numberOfHives ?? 1} onChange={e => fa("numberOfHives", e.target.value)} /></div>
              <div><Label>Species</Label><Select value={apiaryForm.species ?? "honeybee"} onValueChange={v => fa("species", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="honeybee">Honeybee</SelectItem><SelectItem value="bumblebee">Bumblebee</SelectItem></SelectContent></Select></div>
              <div><Label>BeeBase Registration</Label><Input value={apiaryForm.beebaseRegistration ?? ""} onChange={e => fa("beebaseRegistration", e.target.value)} /></div>
            </div>
            <div className="flex items-center gap-2"><input type="checkbox" id="actv" checked={Boolean(apiaryForm.isActive)} onChange={e => fa("isActive", e.target.checked)} /><Label htmlFor="actv">Active</Label></div>
            <div><Label>Notes</Label><Textarea value={apiaryForm.notes ?? ""} onChange={e => fa("notes", e.target.value)} rows={2} /></div>
            <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={() => setApiaryOpen(false)}>Cancel</Button><Button type="submit" disabled={apiarySave.isPending}>{apiarySave.isPending ? "Saving…" : "Save Apiary"}</Button></div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={inspOpen} onOpenChange={o => { setInspOpen(o); if (!o) { setEditInsp(null); setInspForm(EMPTY_INSPECTION); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editInsp ? "Edit Inspection" : "Add Hive Inspection"}</DialogTitle></DialogHeader>
          <form onSubmit={e => { e.preventDefault(); inspSave.mutate({ ...inspForm, apiaryId: Number(inspForm.apiaryId), varroaWashCount: inspForm.varroaWashCount ? Number(inspForm.varroaWashCount) : null, supersOnHive: inspForm.supersOnHive ? Number(inspForm.supersOnHive) : null, queenCellCount: inspForm.queenCellCount ? Number(inspForm.queenCellCount) : null, queenSeen: Boolean(inspForm.queenSeen), queenCells: Boolean(inspForm.queenCells), storesAdequate: inspForm.storesAdequate != null ? Boolean(inspForm.storesAdequate) : null, notificationSentToApha: Boolean(inspForm.notificationSentToApha) }); }} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Apiary *</Label><Select value={inspForm.apiaryId?.toString() ?? ""} onValueChange={v => fi("apiaryId", Number(v))}><SelectTrigger><SelectValue placeholder="Select apiary…" /></SelectTrigger><SelectContent>{apiaries.map(a => <SelectItem key={a.id} value={String(a.id)}>{a.apiaryName}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Hive Reference</Label><Input value={inspForm.hiveRef ?? ""} onChange={e => fi("hiveRef", e.target.value)} placeholder="e.g. Hive 3" /></div>
              <div><Label>Inspection Date *</Label><Input type="date" value={inspForm.inspectionDate ?? ""} onChange={e => fi("inspectionDate", e.target.value)} required /></div>
              <div><Label>Inspected By *</Label><Input value={inspForm.inspectedBy ?? ""} onChange={e => fi("inspectedBy", e.target.value)} required /></div>
              <div><Label>Brood Pattern</Label><Select value={inspForm.broodPattern ?? ""} onValueChange={v => fi("broodPattern", v)}><SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger><SelectContent>{["excellent","good","fair","poor"].map(v => <SelectItem key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Colony Size</Label><Select value={inspForm.estimatedColonySize ?? ""} onValueChange={v => fi("estimatedColonySize", v)}><SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger><SelectContent>{["strong","medium","weak"].map(v => <SelectItem key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Temper</Label><Select value={inspForm.temper ?? ""} onValueChange={v => fi("temper", v)}><SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger><SelectContent>{["calm","normal","defensive"].map(v => <SelectItem key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Varroa Wash Count (/100)</Label><Input type="number" min="0" value={inspForm.varroaWashCount ?? ""} onChange={e => fi("varroaWashCount", e.target.value)} /></div>
              <div><Label>Supers on Hive</Label><Input type="number" min="0" value={inspForm.supersOnHive ?? ""} onChange={e => fi("supersOnHive", e.target.value)} /></div>
              <div><Label>Disease Signs</Label><Input value={inspForm.diseaseSigns ?? ""} onChange={e => fi("diseaseSigns", e.target.value)} placeholder="e.g. varroa, none" /></div>
              <div><Label>Next Inspection Due</Label><Input type="date" value={inspForm.nextInspectionDue ?? ""} onChange={e => fi("nextInspectionDue", e.target.value)} /></div>
            </div>
            <div className="flex flex-wrap gap-4">
              {[{id:"qs",f:"queenSeen",l:"Queen seen"},{id:"qc",f:"queenCells",l:"Queen cells present"},{id:"sa",f:"storesAdequate",l:"Stores adequate"},{id:"apha",f:"notificationSentToApha",l:"APHA notified (AFB/EFB)"}].map(cb => (
                <div key={cb.id} className="flex items-center gap-2"><input type="checkbox" id={cb.id} checked={Boolean(inspForm[cb.f])} onChange={e => fi(cb.f, e.target.checked)} /><Label htmlFor={cb.id}>{cb.l}</Label></div>
              ))}
            </div>
            <div><Label>Actions Taken</Label><Textarea value={inspForm.actionsTaken ?? ""} onChange={e => fi("actionsTaken", e.target.value)} rows={2} /></div>
            <div><Label>Treatment Applied</Label><Input value={inspForm.treatmentApplied ?? ""} onChange={e => fi("treatmentApplied", e.target.value)} placeholder="e.g. Apiguard, OA treatment" /></div>
            <div><Label>Notes</Label><Textarea value={inspForm.notes ?? ""} onChange={e => fi("notes", e.target.value)} rows={2} /></div>
            <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={() => setInspOpen(false)}>Cancel</Button><Button type="submit" disabled={inspSave.isPending}>{inspSave.isPending ? "Saving…" : "Save Inspection"}</Button></div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={honeyOpen} onOpenChange={o => { setHoneyOpen(o); if (!o) { setEditHoney(null); setHoneyForm(EMPTY_HONEY); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editHoney ? "Edit Harvest Record" : "Record Honey Harvest"}</DialogTitle></DialogHeader>
          <form onSubmit={e => { e.preventDefault(); honeySave.mutate({ ...honeyForm, apiaryId: Number(honeyForm.apiaryId), sold: Boolean(honeyForm.sold) }); }} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Apiary *</Label><Select value={honeyForm.apiaryId?.toString() ?? ""} onValueChange={v => fh("apiaryId", Number(v))}><SelectTrigger><SelectValue placeholder="Select apiary…" /></SelectTrigger><SelectContent>{apiaries.map(a => <SelectItem key={a.id} value={String(a.id)}>{a.apiaryName}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Harvest Date *</Label><Input type="date" value={honeyForm.harvestDate ?? ""} onChange={e => fh("harvestDate", e.target.value)} required /></div>
              <div><Label>Quantity (kg) *</Label><Input type="number" step="0.1" min="0" value={honeyForm.quantityKg ?? ""} onChange={e => fh("quantityKg", e.target.value)} required /></div>
              <div><Label>Lot Number</Label><Input value={honeyForm.lotNumber ?? ""} onChange={e => fh("lotNumber", e.target.value)} /></div>
              <div><Label>Moisture %</Label><Input type="number" step="0.1" min="0" max="25" value={honeyForm.moisturePercent ?? ""} onChange={e => fh("moisturePercent", e.target.value)} /></div>
            </div>
            <div className="flex items-center gap-2"><input type="checkbox" id="sold" checked={Boolean(honeyForm.sold)} onChange={e => fh("sold", e.target.checked)} /><Label htmlFor="sold">Sold</Label></div>
            <div><Label>Notes</Label><Textarea value={honeyForm.notes ?? ""} onChange={e => fh("notes", e.target.value)} rows={2} /></div>
            <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={() => setHoneyOpen(false)}>Cancel</Button><Button type="submit" disabled={honeySave.isPending}>{honeySave.isPending ? "Saving…" : "Save Record"}</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
