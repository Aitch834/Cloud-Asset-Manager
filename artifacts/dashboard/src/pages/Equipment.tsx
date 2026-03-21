import { useState, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
  DialogFooter, DialogTrigger
} from "@/components/ui/dialog";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/hooks/use-app-store";
import { useEquipment, useAddEquipment } from "@/hooks/use-equipment";
import { Plus, Search, Tractor, Calendar, Camera, X, Pencil, Loader2, Printer, Trash2, Thermometer, FlaskConical } from "lucide-react";
import { useForm } from "react-hook-form";
import { Redirect } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getListEquipmentQueryKey } from "@workspace/api-client-react/src/generated/api";
import { useToast } from "@/hooks/use-toast";
import { printHtml } from "@/lib/utils";

interface EquipmentRecord {
  id: number;
  name?: string;
  type?: string;
  make?: string;
  model?: string;
  serialNumber?: string;
  registrationNumber?: string;
  yearOfManufacture?: number;
  location?: string;
  status?: string;
  notes?: string;
  photos?: string;
  nextCalibrationDue?: string;
  isActive?: boolean;
}

interface EquipmentFormData {
  name: string;
  type: string;
  make: string;
  model: string;
  serialNumber: string;
  registrationNumber: string;
  yearOfManufacture: string;
  location: string;
  notes: string;
}

const MAX_PHOTOS = 5;

function parsePhotos(raw?: string): string[] {
  if (!raw) return [];
  try { return JSON.parse(raw) as string[]; } catch { return []; }
}

function PhotoUploader({
  photos,
  onChange,
}: {
  photos: string[];
  onChange: (next: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const remaining = MAX_PHOTOS - photos.length;
    const toProcess = Array.from(files).slice(0, remaining);
    toProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        onChange([...photos, dataUrl]);
      };
      reader.readAsDataURL(file);
    });
  };

  const remove = (i: number) => onChange(photos.filter((_, idx) => idx !== i));

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {photos.map((src, i) => (
          <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border group">
            <img src={src} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ))}
        {photos.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-20 h-20 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1 text-foreground/40 hover:text-primary/60 transition-colors"
          >
            <Camera className="w-5 h-5" />
            <span className="text-xs">Add</span>
          </button>
        )}
      </div>
      <p className="text-xs text-foreground/40">
        Up to {MAX_PHOTOS} photos. JPG, PNG accepted.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}

// ─── Grain Storage Quality Section ──────────────────────────────────────────────
function GrainStorageSection({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [binOpen, setBinOpen] = useState(false);
  const [testOpen, setTestOpen] = useState(false);
  const [tempOpen, setTempOpen] = useState(false);
  const [editingBin, setEditingBin] = useState<Record<string, unknown> | null>(null);
  const [binForm, setBinForm] = useState<Record<string, string>>({});
  const [testForm, setTestForm] = useState<Record<string, string>>({});
  const [tempForm, setTempForm] = useState<Record<string, string>>({});
  const [selectedBinId, setSelectedBinId] = useState<number | null>(null);

  const binsQ = useQuery({
    queryKey: ["grain-storage-bins", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/grain-storage-bins`, { credentials: "include" }).then(r => r.json()),
    select: (d: any) => d.records ?? [],
  });

  const testsQ = useQuery({
    queryKey: ["grain-quality-tests", farmId, selectedBinId],
    queryFn: () => fetch(`/api/farms/${farmId}/grain-storage-quality-tests${selectedBinId ? `?binId=${selectedBinId}` : ""}`, { credentials: "include" }).then(r => r.json()),
    select: (d: any) => d.records ?? [],
  });

  const tempsQ = useQuery({
    queryKey: ["grain-temp-logs", farmId, selectedBinId],
    queryFn: () => fetch(`/api/farms/${farmId}/grain-storage-temperature-logs${selectedBinId ? `?binId=${selectedBinId}` : ""}`, { credentials: "include" }).then(r => r.json()),
    select: (d: any) => d.records ?? [],
  });

  const saveBin = useMutation({
    mutationFn: (body: Record<string, unknown>) => {
      const url = editingBin ? `/api/farms/${farmId}/grain-storage-bins/${editingBin.id}` : `/api/farms/${farmId}/grain-storage-bins`;
      return fetch(url, { method: editingBin ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["grain-storage-bins", farmId] }); setBinOpen(false); setBinForm({}); setEditingBin(null); toast({ title: "Bin saved" }); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const saveTest = useMutation({
    mutationFn: (body: Record<string, unknown>) => fetch(`/api/farms/${farmId}/grain-storage-quality-tests`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["grain-quality-tests", farmId, selectedBinId] }); setTestOpen(false); setTestForm({}); toast({ title: "Quality test saved" }); },
    onError: () => toast({ title: "Failed", variant: "destructive" }),
  });

  const saveTemp = useMutation({
    mutationFn: (body: Record<string, unknown>) => fetch(`/api/farms/${farmId}/grain-storage-temperature-logs`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["grain-temp-logs", farmId, selectedBinId] }); setTempOpen(false); setTempForm({}); toast({ title: "Temperature log saved" }); },
    onError: () => toast({ title: "Failed", variant: "destructive" }),
  });

  const bins = (binsQ.data ?? []) as Record<string, unknown>[];
  const tests = (testsQ.data ?? []) as Record<string, unknown>[];
  const temps = (tempsQ.data ?? []) as Record<string, unknown>[];

  return (
    <div className="space-y-6">
      {/* Bin Register */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold">Grain Storage Bins & Stores</h3>
            <p className="text-sm text-muted-foreground">Register each bin, flat store or grain silo and track crop, variety and harvest year.</p>
          </div>
          <Button size="sm" onClick={() => { setEditingBin(null); setBinForm({ binType: "Bin" }); setBinOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add Bin / Store
          </Button>
        </div>
        {binsQ.isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
          <div className="bg-white rounded-xl border border-border/50 shadow-sm overflow-x-auto">
            {bins.length === 0 ? <p className="text-sm text-muted-foreground italic py-6 text-center">No grain stores registered.</p> : (
              <table className="w-full text-sm">
                <thead className="bg-black/5 border-b">
                  <tr>{["Bin / Store", "Type", "Capacity (t)", "Crop", "Variety", "Harvest Year", "Moisture %", ""].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y">{bins.map((r, i) => (
                  <tr key={i} className={`hover:bg-black/5 cursor-pointer ${selectedBinId === (r.id as number) ? "bg-green-50" : ""}`} onClick={() => setSelectedBinId(selectedBinId === (r.id as number) ? null : (r.id as number))}>
                    <td className="px-4 py-3 font-medium">{String(r.binName ?? "—")}</td>
                    <td className="px-4 py-3">{String(r.binType ?? "—")}</td>
                    <td className="px-4 py-3">{String(r.capacityTonnes ?? "—")}</td>
                    <td className="px-4 py-3">{String(r.cropType ?? "—")}</td>
                    <td className="px-4 py-3">{String(r.cropVariety ?? "—")}</td>
                    <td className="px-4 py-3">{String(r.harvestYear ?? "—")}</td>
                    <td className="px-4 py-3">{r.moisture != null ? `${r.moisture}%` : "—"}</td>
                    <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                      <Button size="icon" variant="ghost" onClick={() => { setEditingBin(r); setBinForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, String(v ?? "")]))); setBinOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </div>
        )}
        {selectedBinId && <p className="text-xs text-muted-foreground">Showing quality tests and temperature logs for selected bin. Click again to deselect.</p>}
      </div>

      {/* Quality Tests */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold flex items-center gap-2"><FlaskConical className="w-4 h-4 text-blue-600" /> Quality Tests</h3>
          <Button size="sm" variant="outline" onClick={() => { setTestForm({ binId: selectedBinId ? String(selectedBinId) : "" }); setTestOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add Test
          </Button>
        </div>
        {testsQ.isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
          <Card><CardContent className="pt-4">
            {tests.length === 0 ? <p className="text-sm text-muted-foreground italic py-4 text-center">No quality tests recorded.</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b">{["Date", "Bin", "Lab", "Moisture %", "Sp. Weight", "Protein %", "Screenings %", "Mycotoxin", "Result"].map(h => <th key={h} className="text-left py-2 pr-4 font-medium text-muted-foreground text-xs">{h}</th>)}</tr></thead>
                  <tbody>{tests.map((t, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 pr-4">{t.testDate ? new Date(t.testDate as string).toLocaleDateString("en-GB") : "—"}</td>
                      <td className="py-2 pr-4">{String(t.binName ?? t.binId ?? "—")}</td>
                      <td className="py-2 pr-4">{String(t.laboratory ?? "—")}</td>
                      <td className="py-2 pr-4">{t.moisture != null ? `${t.moisture}%` : "—"}</td>
                      <td className="py-2 pr-4">{t.specificWeight ? `${t.specificWeight} kg/hl` : "—"}</td>
                      <td className="py-2 pr-4">{t.protein != null ? `${t.protein}%` : "—"}</td>
                      <td className="py-2 pr-4">{t.screenings != null ? `${t.screenings}%` : "—"}</td>
                      <td className="py-2 pr-4">{t.mycotoxinPresent === true ? "Present" : t.mycotoxinPresent === false ? "Not detected" : "—"}</td>
                      <td className="py-2 pr-4">{String(t.mycoResult ?? "—")}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </CardContent></Card>
        )}
      </div>

      {/* Temperature Logs */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold flex items-center gap-2"><Thermometer className="w-4 h-4 text-red-600" /> Temperature Monitoring</h3>
          <Button size="sm" variant="outline" onClick={() => { setTempForm({ binId: selectedBinId ? String(selectedBinId) : "" }); setTempOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Log Temperature
          </Button>
        </div>
        {tempsQ.isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
          <Card><CardContent className="pt-4">
            {temps.length === 0 ? <p className="text-sm text-muted-foreground italic py-4 text-center">No temperature readings recorded.</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b">{["Date", "Bin", "Probe 1 (°C)", "Probe 2 (°C)", "Probe 3 (°C)", "Average (°C)", "Trend", "Aeration"].map(h => <th key={h} className="text-left py-2 pr-4 font-medium text-muted-foreground text-xs">{h}</th>)}</tr></thead>
                  <tbody>{temps.map((t, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 pr-4">{t.logDate ? new Date(t.logDate as string).toLocaleDateString("en-GB") : "—"}</td>
                      <td className="py-2 pr-4">{String(t.binName ?? t.binId ?? "—")}</td>
                      <td className="py-2 pr-4">{t.probe1 != null ? `${t.probe1}°C` : "—"}</td>
                      <td className="py-2 pr-4">{t.probe2 != null ? `${t.probe2}°C` : "—"}</td>
                      <td className="py-2 pr-4">{t.probe3 != null ? `${t.probe3}°C` : "—"}</td>
                      <td className="py-2 pr-4 font-medium">{t.average != null ? `${t.average}°C` : "—"}</td>
                      <td className="py-2 pr-4">{String(t.trend ?? "—")}</td>
                      <td className="py-2 pr-4">{t.aeration === true ? "On" : t.aeration === false ? "Off" : "—"}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </CardContent></Card>
        )}
      </div>

      {/* Bin Dialog */}
      <Dialog open={binOpen} onOpenChange={setBinOpen}>
        <DialogContent style={{ maxWidth: "40rem" }}>
          <DialogHeader><DialogTitle>{editingBin ? "Edit Bin / Store" : "Add Grain Bin / Store"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Name *</Label><Input value={binForm.binName ?? ""} onChange={e => setBinForm(f => ({ ...f, binName: e.target.value }))} placeholder="e.g. Bin 1 — Wheat" /></div>
            <div><Label>Type *</Label>
              <Select value={binForm.binType ?? "Bin"} onValueChange={v => setBinForm(f => ({ ...f, binType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["Bin", "Flat Store", "Grain Silo", "Bag Store", "Tower Silo", "Bunker"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Capacity (tonnes)</Label><Input type="number" step="0.1" value={binForm.capacityTonnes ?? ""} onChange={e => setBinForm(f => ({ ...f, capacityTonnes: e.target.value }))} /></div>
            <div><Label>Current Occupancy (tonnes)</Label><Input type="number" step="0.1" value={binForm.currentOccupancy ?? ""} onChange={e => setBinForm(f => ({ ...f, currentOccupancy: e.target.value }))} /></div>
            <div><Label>Crop Type</Label><Input value={binForm.cropType ?? ""} onChange={e => setBinForm(f => ({ ...f, cropType: e.target.value }))} placeholder="e.g. Wheat, Barley" /></div>
            <div><Label>Crop Variety</Label><Input value={binForm.cropVariety ?? ""} onChange={e => setBinForm(f => ({ ...f, cropVariety: e.target.value }))} /></div>
            <div><Label>Harvest Year</Label><Input type="number" value={binForm.harvestYear ?? ""} onChange={e => setBinForm(f => ({ ...f, harvestYear: e.target.value }))} /></div>
            <div><Label>Moisture % at intake</Label><Input type="number" step="0.1" value={binForm.moisture ?? ""} onChange={e => setBinForm(f => ({ ...f, moisture: e.target.value }))} /></div>
            <div><Label>Specific Weight (kg/hl)</Label><Input type="number" step="0.1" value={binForm.specificWeight ?? ""} onChange={e => setBinForm(f => ({ ...f, specificWeight: e.target.value }))} /></div>
            <div><Label>Protein %</Label><Input type="number" step="0.1" value={binForm.protein ?? ""} onChange={e => setBinForm(f => ({ ...f, protein: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={binForm.notes ?? ""} onChange={e => setBinForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBinOpen(false)}>Cancel</Button>
            <Button onClick={() => saveBin.mutate(binForm)} disabled={saveBin.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quality Test Dialog */}
      <Dialog open={testOpen} onOpenChange={setTestOpen}>
        <DialogContent style={{ maxWidth: "38rem" }}>
          <DialogHeader><DialogTitle>Add Quality Test Result</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Bin / Store *</Label>
              <Select value={testForm.binId ?? ""} onValueChange={v => setTestForm(f => ({ ...f, binId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select bin" /></SelectTrigger>
                <SelectContent>{bins.map(b => <SelectItem key={String(b.id)} value={String(b.id)}>{String(b.binName ?? `Bin ${b.id}`)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Test Date *</Label><Input type="date" value={testForm.testDate ?? ""} onChange={e => setTestForm(f => ({ ...f, testDate: e.target.value }))} /></div>
            <div><Label>Laboratory</Label><Input value={testForm.laboratory ?? ""} onChange={e => setTestForm(f => ({ ...f, laboratory: e.target.value }))} /></div>
            <div><Label>Moisture %</Label><Input type="number" step="0.1" value={testForm.moisture ?? ""} onChange={e => setTestForm(f => ({ ...f, moisture: e.target.value }))} /></div>
            <div><Label>Specific Weight (kg/hl)</Label><Input type="number" step="0.1" value={testForm.specificWeight ?? ""} onChange={e => setTestForm(f => ({ ...f, specificWeight: e.target.value }))} /></div>
            <div><Label>Protein %</Label><Input type="number" step="0.1" value={testForm.protein ?? ""} onChange={e => setTestForm(f => ({ ...f, protein: e.target.value }))} /></div>
            <div><Label>Screenings %</Label><Input type="number" step="0.1" value={testForm.screenings ?? ""} onChange={e => setTestForm(f => ({ ...f, screenings: e.target.value }))} /></div>
            <div><Label>Mycotoxin</Label>
              <Select value={testForm.mycotoxinPresent ?? ""} onValueChange={v => setTestForm(f => ({ ...f, mycotoxinPresent: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent><SelectItem value="false">Not detected</SelectItem><SelectItem value="true">Present</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Mycotoxin Result (ppb)</Label><Input type="number" step="0.1" value={testForm.mycoResult ?? ""} onChange={e => setTestForm(f => ({ ...f, mycoResult: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={testForm.notes ?? ""} onChange={e => setTestForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestOpen(false)}>Cancel</Button>
            <Button onClick={() => saveTest.mutate(testForm)} disabled={saveTest.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Temperature Log Dialog */}
      <Dialog open={tempOpen} onOpenChange={setTempOpen}>
        <DialogContent style={{ maxWidth: "36rem" }}>
          <DialogHeader><DialogTitle>Log Temperature Reading</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Bin / Store *</Label>
              <Select value={tempForm.binId ?? ""} onValueChange={v => setTempForm(f => ({ ...f, binId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select bin" /></SelectTrigger>
                <SelectContent>{bins.map(b => <SelectItem key={String(b.id)} value={String(b.id)}>{String(b.binName ?? `Bin ${b.id}`)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Date *</Label><Input type="date" value={tempForm.logDate ?? ""} onChange={e => setTempForm(f => ({ ...f, logDate: e.target.value }))} /></div>
            <div><Label>Probe 1 (°C)</Label><Input type="number" step="0.1" value={tempForm.probe1 ?? ""} onChange={e => setTempForm(f => ({ ...f, probe1: e.target.value }))} /></div>
            <div><Label>Probe 2 (°C)</Label><Input type="number" step="0.1" value={tempForm.probe2 ?? ""} onChange={e => setTempForm(f => ({ ...f, probe2: e.target.value }))} /></div>
            <div><Label>Probe 3 (°C)</Label><Input type="number" step="0.1" value={tempForm.probe3 ?? ""} onChange={e => setTempForm(f => ({ ...f, probe3: e.target.value }))} /></div>
            <div><Label>Average (°C)</Label><Input type="number" step="0.1" value={tempForm.average ?? ""} onChange={e => setTempForm(f => ({ ...f, average: e.target.value }))} /></div>
            <div><Label>Trend</Label>
              <Select value={tempForm.trend ?? ""} onValueChange={v => setTempForm(f => ({ ...f, trend: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Rising", "Stable", "Falling"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Aeration</Label>
              <Select value={tempForm.aeration ?? ""} onValueChange={v => setTempForm(f => ({ ...f, aeration: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent><SelectItem value="true">On</SelectItem><SelectItem value="false">Off</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Fan Runtime (hrs)</Label><Input type="number" step="0.5" value={tempForm.fanRuntime ?? ""} onChange={e => setTempForm(f => ({ ...f, fanRuntime: e.target.value }))} /></div>
            <div><Label>CO₂ ppm</Label><Input type="number" step="1" value={tempForm.co2Ppm ?? ""} onChange={e => setTempForm(f => ({ ...f, co2Ppm: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={tempForm.notes ?? ""} onChange={e => setTempForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTempOpen(false)}>Cancel</Button>
            <Button onClick={() => saveTemp.mutate(tempForm)} disabled={saveTemp.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface FarmRecord { name?: string; address?: string; postcode?: string; cphNumber?: string; }

export default function EquipmentPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<"equipment" | "grain-storage">("equipment");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [managingItem, setManagingItem] = useState<EquipmentRecord | null>(null);
  const [addPhotos, setAddPhotos] = useState<string[]>([]);
  const [editPhotos, setEditPhotos] = useState<string[]>([]);
  const [printOpen, setPrintOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data, isLoading } = useEquipment(farmId ?? 0);

  const { data: farmData } = useQuery<{ record: FarmRecord }>({
    queryKey: ["farm-for-print", farmId],
    queryFn: async () => {
      const r = await fetch(`/api/farms/${farmId}`);
      return r.json();
    },
    enabled: !!farmId,
  });
  const farm = farmData?.record;
  const { mutate: createEquip, isPending } = useAddEquipment(farmId ?? 0);
  const { register, handleSubmit, reset } = useForm<EquipmentFormData>();
  const { register: regEdit, handleSubmit: handleEditSubmit, reset: resetEdit } = useForm<EquipmentFormData>();

  const updateMutation = useMutation({
    mutationFn: async ({ id, body }: { id: number; body: Record<string, unknown> }) => {
      const res = await fetch(`/api/farms/${farmId}/equipment/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListEquipmentQueryKey(farmId ?? 0) });
      setManagingItem(null);
      toast({ title: "Equipment updated" });
    },
    onError: () => {
      toast({ title: "Failed to update equipment", variant: "destructive" });
    },
  });

  if (!farmId) return <Redirect href="/select" />;

  const onAdd = (formValues: EquipmentFormData) => {
    createEquip(
      {
        farmId,
        data: {
          ...formValues,
          yearOfManufacture: formValues.yearOfManufacture ? parseInt(formValues.yearOfManufacture, 10) : undefined,
          photos: addPhotos.length ? JSON.stringify(addPhotos) : undefined,
        },
      },
      {
        onSuccess: () => {
          setIsAddOpen(false);
          reset();
          setAddPhotos([]);
          toast({ title: "Equipment registered" });
        },
        onError: () => {
          toast({ title: "Failed to register equipment", variant: "destructive" });
        },
      }
    );
  };

  const openManage = (item: EquipmentRecord) => {
    setManagingItem(item);
    setEditPhotos(parsePhotos(item.photos));
    resetEdit({
      name: item.name ?? "",
      type: item.type ?? "",
      make: item.make ?? "",
      model: item.model ?? "",
      serialNumber: item.serialNumber ?? "",
      registrationNumber: item.registrationNumber ?? "",
      yearOfManufacture: item.yearOfManufacture ? String(item.yearOfManufacture) : "",
      location: item.location ?? "",
      notes: item.notes ?? "",
    });
  };

  const onEdit = (formValues: EquipmentFormData) => {
    if (!managingItem) return;
    updateMutation.mutate({
      id: managingItem.id,
      body: {
        ...formValues,
        yearOfManufacture: formValues.yearOfManufacture ? parseInt(formValues.yearOfManufacture, 10) : undefined,
        photos: JSON.stringify(editPhotos),
      },
    });
  };

  const equipment = (data?.records ?? []) as EquipmentRecord[];
  const printedDate = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const handleEquipmentPrint = () => {
    const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>Machinery &amp; Equipment Register</title>
<style>body{font-family:Arial,sans-serif;font-size:11px;color:#000;margin:0;padding:24px}.hdr{display:flex;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:12px;margin-bottom:12px}.hdr h1{font-size:13px;font-weight:700;margin:0 0 2px}.hdr p{font-size:10px;color:#555;margin:1px 0}.hdr-r{text-align:right;font-size:10px;color:#666}.hdr-r b{display:block;font-size:12px;font-weight:600;color:#000}table{width:100%;border-collapse:collapse;font-size:10px}th{background:#f0fdf4;font-weight:600;text-align:left;border:1px solid #d1d5db;padding:5px 8px}td{border:1px solid #d1d5db;padding:5px 8px}tr:nth-child(even) td{background:#fafafa}.footer{font-size:9px;color:#888;border-top:1px solid #e5e7eb;padding-top:6px;margin-top:4px;font-style:italic}@media print{@page{margin:1.5cm}}</style>
</head><body><div class="hdr"><div><h1>${farm?.name ?? "Farm"}</h1>${farm?.address ? `<p>${farm.address}${farm.postcode ? ", " + farm.postcode : ""}</p>` : ""}${farm?.cphNumber ? `<p>CPH: <span style="font-family:monospace;font-weight:600">${farm.cphNumber}</span></p>` : ""}</div><div class="hdr-r"><b>Machinery &amp; Equipment Register</b>Printed: ${printedDate}<br>${equipment.length} item${equipment.length !== 1 ? "s" : ""}</div></div>
<table><thead><tr><th>Name</th><th>Type</th><th>Make / Model</th><th>Serial / Reg</th><th>Year</th><th>Status</th><th>Next Calibration</th></tr></thead><tbody>${equipment.map(item => `<tr><td>${item.name || "Asset #" + item.id}</td><td>${item.type || "—"}</td><td>${[item.make, item.model].filter(Boolean).join(" ") || "—"}</td><td style="font-family:monospace">${item.serialNumber || item.registrationNumber || "—"}</td><td>${item.yearOfManufacture || "—"}</td><td>${item.isActive !== false ? "Active" : "Inactive"}</td><td>${item.nextCalibrationDue ? new Date(item.nextCalibrationDue).toLocaleDateString("en-GB") : "—"}</td></tr>`).join("")}</tbody></table>
<div class="footer">On-farm record for Red Tractor compliance purposes. Retain for a minimum of 3 years and make available for inspection at audit. BDE Farm Trac · Printed ${printedDate}</div>
</body></html>`;
    printHtml(html, "equipment-register.html");
  };

  return (
    <AppLayout title="Machinery & Equipment">
      <style>{`
        @media print {
          body > * { display: none !important; }
          [role="dialog"] #equipment-print-area { display: block !important; position: fixed; top:0; left:0; width:100%; padding:24px; font-size:11px; color:#000; background:#fff; }
        }
      `}</style>
      <TabBar className="mb-6">
        <TabButton active={tab === "equipment"} onClick={() => setTab("equipment")}>Equipment Register</TabButton>
        <TabButton active={tab === "grain-storage"} onClick={() => setTab("grain-storage")}>
          <span className="flex items-center gap-1"><FlaskConical className="h-3.5 w-3.5" /> Grain Storage Quality</span>
        </TabButton>
      </TabBar>
      {tab === "grain-storage" && farmId && <GrainStorageSection farmId={farmId} />}
      {tab === "equipment" && <>
      <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
          <Input placeholder="Search equipment..." className="pl-10 bg-white" />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setPrintOpen(true)} disabled={equipment.length === 0}>
            <Printer className="w-4 h-4 mr-2" /> Print Register
          </Button>

        <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) { reset(); setAddPhotos([]); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Equipment</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Register Equipment</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onAdd)} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="add-name">Name / Description *</Label>
                  <Input id="add-name" {...register("name", { required: true })} placeholder="e.g. John Deere 6155R" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="add-make">Make</Label>
                  <Input id="add-make" {...register("make")} placeholder="e.g. John Deere" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="add-model">Model</Label>
                  <Input id="add-model" {...register("model")} placeholder="e.g. 6155R" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="add-type">Equipment Type</Label>
                  <Input id="add-type" {...register("type")} placeholder="e.g. Tractor, Sprayer" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="add-year">Year of Manufacture</Label>
                  <Input id="add-year" type="number" {...register("yearOfManufacture")} placeholder="e.g. 2021" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="add-serial">Serial Number</Label>
                  <Input id="add-serial" {...register("serialNumber")} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="add-reg">Registration Number</Label>
                  <Input id="add-reg" {...register("registrationNumber")} className="mt-1" />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="add-location">Location / Storage</Label>
                  <Input id="add-location" {...register("location")} placeholder="e.g. Main Yard" className="mt-1" />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="add-notes">Notes</Label>
                  <textarea
                    id="add-notes"
                    {...register("notes")}
                    placeholder="Service history, condition, etc."
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-y"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="mb-2 block">Photos (optional)</Label>
                  <PhotoUploader photos={addPhotos} onChange={setAddPhotos} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Register
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border/50 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-black/5 text-sm uppercase tracking-wider text-foreground/60 font-semibold border-b border-border/50">
            <tr>
              <th className="px-6 py-4">Equipment</th>
              <th className="px-6 py-4">Reg/Serial</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Next Calibration</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-foreground/50">Loading equipment...</td></tr>
            ) : equipment.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-foreground/50">No equipment registered.</td></tr>
            ) : equipment.map(item => (
              <tr key={item.id} className="hover:bg-black/5 transition-colors">
                <td className="px-6 py-4 font-medium">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-orange-50 flex-shrink-0 flex items-center justify-center">
                      {parsePhotos(item.photos)[0]
                        ? <img src={parsePhotos(item.photos)[0]} alt={item.name} className="w-full h-full object-cover" />
                        : <Tractor className="w-5 h-5 text-orange-600" />
                      }
                    </div>
                    <div>
                      <p>{item.name || `Asset #${item.id}`}</p>
                      {(item.make || item.model) && (
                        <p className="text-xs text-foreground/50">{[item.make, item.model].filter(Boolean).join(" ")}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-foreground/70">{item.serialNumber || item.registrationNumber || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${item.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {item.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-foreground/70">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 opacity-50" />
                    {item.nextCalibrationDue ? new Date(item.nextCalibrationDue).toLocaleDateString('en-GB') : '-'}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="sm" onClick={() => openManage(item)}>
                    <Pencil className="w-4 h-4 mr-1.5" /> Manage
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!managingItem} onOpenChange={(open) => { if (!open) setManagingItem(null); }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Equipment — {managingItem?.name}</DialogTitle>
          </DialogHeader>
          {managingItem && (
            <form onSubmit={handleEditSubmit(onEdit)} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Name / Description</Label>
                  <Input {...regEdit("name")} className="mt-1" />
                </div>
                <div>
                  <Label>Make</Label>
                  <Input {...regEdit("make")} className="mt-1" />
                </div>
                <div>
                  <Label>Model</Label>
                  <Input {...regEdit("model")} className="mt-1" />
                </div>
                <div>
                  <Label>Equipment Type</Label>
                  <Input {...regEdit("type")} className="mt-1" />
                </div>
                <div>
                  <Label>Year of Manufacture</Label>
                  <Input type="number" {...regEdit("yearOfManufacture")} className="mt-1" />
                </div>
                <div>
                  <Label>Serial Number</Label>
                  <Input {...regEdit("serialNumber")} className="mt-1" />
                </div>
                <div>
                  <Label>Registration Number</Label>
                  <Input {...regEdit("registrationNumber")} className="mt-1" />
                </div>
                <div className="col-span-2">
                  <Label>Location / Storage</Label>
                  <Input {...regEdit("location")} className="mt-1" />
                </div>
                <div className="col-span-2">
                  <Label>Notes</Label>
                  <textarea
                    {...regEdit("notes")}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-y"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="mb-2 block">Photos</Label>
                  <PhotoUploader photos={editPhotos} onChange={setEditPhotos} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setManagingItem(null)}>Cancel</Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ── PRINT DIALOG ── */}
      {printOpen && (
        <Dialog open onOpenChange={(o) => { if (!o) setPrintOpen(false); }}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-green-600" />
                Print — Machinery &amp; Equipment Register
              </DialogTitle>
              <DialogDescription>
                Review the asset list below, then click Print to produce a compliance document for Red Tractor audit.
              </DialogDescription>
            </DialogHeader>

            <div id="equipment-print-area" className="border border-border rounded-lg p-6 space-y-4 text-sm mt-2">
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <p className="text-base font-bold text-foreground">{farm?.name ?? "Farm"}</p>
                  {farm?.address && <p className="text-xs text-foreground/60">{farm.address}{farm.postcode ? `, ${farm.postcode}` : ""}</p>}
                  {farm?.cphNumber && <p className="text-xs text-foreground/60 mt-0.5">CPH: <span className="font-mono font-semibold">{farm.cphNumber}</span></p>}
                </div>
                <div className="text-right text-xs text-foreground/50">
                  <p className="font-semibold text-foreground text-sm">Machinery &amp; Equipment Register</p>
                  <p>Printed: {printedDate}</p>
                  <p>{equipment.length} item{equipment.length !== 1 ? "s" : ""}</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-green-50 text-foreground/70">
                      <th className="border border-border/60 px-3 py-2 text-left font-semibold">Name</th>
                      <th className="border border-border/60 px-3 py-2 text-left font-semibold">Type</th>
                      <th className="border border-border/60 px-3 py-2 text-left font-semibold">Make / Model</th>
                      <th className="border border-border/60 px-3 py-2 text-left font-semibold">Serial / Reg</th>
                      <th className="border border-border/60 px-3 py-2 text-left font-semibold">Year</th>
                      <th className="border border-border/60 px-3 py-2 text-left font-semibold">Status</th>
                      <th className="border border-border/60 px-3 py-2 text-left font-semibold">Next Calibration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {equipment.map((item, i) => (
                      <tr key={item.id} className={i % 2 === 0 ? "bg-white" : "bg-black/[0.02]"}>
                        <td className="border border-border/60 px-3 py-2">{item.name || `Asset #${item.id}`}</td>
                        <td className="border border-border/60 px-3 py-2">{item.type || "-"}</td>
                        <td className="border border-border/60 px-3 py-2">{[item.make, item.model].filter(Boolean).join(" ") || "-"}</td>
                        <td className="border border-border/60 px-3 py-2 font-mono">{item.serialNumber || item.registrationNumber || "-"}</td>
                        <td className="border border-border/60 px-3 py-2">{item.yearOfManufacture || "-"}</td>
                        <td className="border border-border/60 px-3 py-2">{item.isActive !== false ? "Active" : "Inactive"}</td>
                        <td className="border border-border/60 px-3 py-2">
                          {item.nextCalibrationDue ? new Date(item.nextCalibrationDue).toLocaleDateString("en-GB") : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="text-xs text-foreground/40 border-t pt-3 italic">
                This is an on-farm record for Red Tractor compliance purposes.
                Retain for a minimum of 3 years and make available for inspection at audit.
                BDE Farm Trac · Printed {printedDate}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setPrintOpen(false)}>Close</Button>
              <Button onClick={handleEquipmentPrint} className="gap-2">
                <Printer className="w-4 h-4" /> Print Register
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      </>}
    </AppLayout>
  );
}
