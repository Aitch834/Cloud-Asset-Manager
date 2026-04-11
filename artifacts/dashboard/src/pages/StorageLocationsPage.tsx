import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Warehouse, Plus, Pencil, Trash2, CheckCircle, XCircle, MapPin, QrCode,
  Loader2, Printer, Thermometer, FlaskConical, ChevronDown, ChevronUp,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/hooks/use-app-store";
import { useToast } from "@/hooks/use-toast";
import { StorageLocationMapPicker } from "@/components/storage/StorageLocationMapPicker";
import { TabBar, TabButton } from "@/components/ui/tab-button";

interface LatLng { lat: number; lng: number; }

interface StorageLocation {
  id: number;
  name: string;
  type: string;
  capacityTonnes?: string | null;
  locationDescription?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  notes?: string | null;
  storageCode?: string | null;
  isActive: boolean;
  binType?: string | null;
  dryingSystem?: string | null;
  aerationSystem?: boolean | null;
  temperatureMonitoring?: boolean | null;
  sensorCount?: number | null;
  createdAt: string;
}

interface QualityTest {
  id: number;
  locationId?: number | null;
  testDate: string;
  cropType: string;
  variety?: string | null;
  harvestYear?: number | null;
  moisturePercent?: string | null;
  specificWeightKgHl?: string | null;
  proteinPercent?: string | null;
  hagbergFallingNumber?: number | null;
  screeningsPercent?: string | null;
  overallGrade?: string | null;
  testingLab?: string | null;
  certificateReference?: string | null;
  notes?: string | null;
}

interface TempLog {
  id: number;
  locationId?: number | null;
  logDate: string;
  logTime?: string | null;
  temperatureC: string;
  sensorPosition?: string | null;
  moisturePercent?: string | null;
  aerationRunning?: boolean;
  dryingRunning?: boolean;
  recordedBy?: string | null;
  notes?: string | null;
}

const LOCATION_TYPES: { value: string; label: string }[] = [
  { value: "grain_store", label: "Grain Store" },
  { value: "silo", label: "Silo" },
  { value: "bin", label: "Bin" },
  { value: "temporary", label: "Temporary / Field Heap" },
  { value: "merchant", label: "Merchant / Off-farm" },
  { value: "cold_store", label: "Cold Store" },
  { value: "other", label: "Other" },
];

const GRAIN_TYPES = ["grain_store", "silo", "bin"];

const BIN_SUBTYPES = ["Bin", "Flat Store", "Grain Silo", "Bag Store", "Tower Silo", "Bunker"];
const DRYING_SYSTEMS = ["None", "Hot Air Batch", "Continuous Flow", "In-Situ", "Ambient Aeration"];
const CROP_TYPES = ["Wheat", "Barley", "Oilseed Rape", "Oats", "Rye", "Triticale", "Peas", "Beans", "Linseed", "Other"];

function typeLabel(type: string) {
  return LOCATION_TYPES.find((t) => t.value === type)?.label ?? type;
}

function typeBadgeVariant(type: string): "default" | "secondary" | "outline" {
  if (type === "grain_store" || type === "silo") return "default";
  if (type === "bin") return "secondary";
  return "outline";
}

function locToLatLng(loc: StorageLocation): LatLng | null {
  if (loc.latitude && loc.longitude) {
    return { lat: parseFloat(loc.latitude), lng: parseFloat(loc.longitude) };
  }
  return null;
}

const emptyForm = () => ({
  name: "",
  type: "grain_store",
  capacityTonnes: "",
  locationDescription: "",
  notes: "",
  isActive: true,
  pin: null as LatLng | null,
  binType: "Bin",
  dryingSystem: "None",
  aerationSystem: false,
  temperatureMonitoring: false,
  sensorCount: "",
});

const emptyQualityTest = () => ({
  testDate: new Date().toISOString().slice(0, 10),
  cropType: "Wheat",
  variety: "",
  harvestYear: String(new Date().getFullYear()),
  moisturePercent: "",
  specificWeightKgHl: "",
  proteinPercent: "",
  hagbergFallingNumber: "",
  screeningsPercent: "",
  overallGrade: "",
  testingLab: "",
  certificateReference: "",
  notes: "",
});

const emptyTempLog = () => ({
  logDate: new Date().toISOString().slice(0, 10),
  logTime: "",
  temperatureC: "",
  sensorPosition: "",
  moisturePercent: "",
  aerationRunning: false,
  dryingRunning: false,
  recordedBy: "",
  notes: "",
});

// ─── Per-location Grain Monitoring Panel ────────────────────────────────────

function GrainMonitoringPanel({ farmId, locationId, locationType }: { farmId: number; locationId: number; locationType: string }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [tab, setTab] = useState<"quality" | "temperature">("quality");

  const [testOpen, setTestOpen] = useState(false);
  const [editTest, setEditTest] = useState<QualityTest | null>(null);
  const [testForm, setTestForm] = useState(emptyQualityTest());
  const [deleteTestId, setDeleteTestId] = useState<number | null>(null);

  const [tempOpen, setTempOpen] = useState(false);
  const [editTemp, setEditTemp] = useState<TempLog | null>(null);
  const [tempForm, setTempForm] = useState(emptyTempLog());
  const [deleteTempId, setDeleteTempId] = useState<number | null>(null);

  const testsQ = useQuery<QualityTest[]>({
    queryKey: ["grain-quality-tests", farmId, locationId],
    queryFn: () =>
      fetch(`/api/farms/${farmId}/grain-quality-tests?locationId=${locationId}`, { credentials: "include" })
        .then((r) => r.json()),
    enabled: !!farmId && tab === "quality",
  });
  const tests: QualityTest[] = Array.isArray(testsQ.data) ? testsQ.data : [];

  const tempsQ = useQuery<TempLog[]>({
    queryKey: ["grain-temperature-logs", farmId, locationId],
    queryFn: () =>
      fetch(`/api/farms/${farmId}/grain-temperature-logs?locationId=${locationId}`, { credentials: "include" })
        .then((r) => r.json()),
    enabled: !!farmId && tab === "temperature",
  });
  const temps: TempLog[] = Array.isArray(tempsQ.data) ? tempsQ.data : [];

  const saveTest = useMutation({
    mutationFn: (body: Record<string, unknown>) => {
      const url = editTest
        ? `/api/farms/${farmId}/grain-quality-tests/${editTest.id}`
        : `/api/farms/${farmId}/grain-quality-tests`;
      return fetch(url, { method: editTest ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grain-quality-tests", farmId, locationId] });
      setTestOpen(false); setEditTest(null); setTestForm(emptyQualityTest());
      toast({ title: editTest ? "Test updated" : "Test saved" });
    },
    onError: () => toast({ title: "Failed to save test", variant: "destructive" }),
  });

  const deleteTest = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/grain-quality-tests/${id}`, { method: "DELETE", credentials: "include" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grain-quality-tests", farmId, locationId] });
      setDeleteTestId(null); toast({ title: "Test deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const saveTemp = useMutation({
    mutationFn: (body: Record<string, unknown>) => {
      const url = editTemp
        ? `/api/farms/${farmId}/grain-temperature-logs/${editTemp.id}`
        : `/api/farms/${farmId}/grain-temperature-logs`;
      return fetch(url, { method: editTemp ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grain-temperature-logs", farmId, locationId] });
      setTempOpen(false); setEditTemp(null); setTempForm(emptyTempLog());
      toast({ title: editTemp ? "Log updated" : "Log saved" });
    },
    onError: () => toast({ title: "Failed to save log", variant: "destructive" }),
  });

  const deleteTemp = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/grain-temperature-logs/${id}`, { method: "DELETE", credentials: "include" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grain-temperature-logs", farmId, locationId] });
      setDeleteTempId(null); toast({ title: "Log deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  function openAddTest() { setEditTest(null); setTestForm(emptyQualityTest()); setTestOpen(true); }
  function openEditTest(t: QualityTest) {
    setEditTest(t);
    setTestForm({
      testDate: t.testDate, cropType: t.cropType, variety: t.variety ?? "",
      harvestYear: t.harvestYear != null ? String(t.harvestYear) : "",
      moisturePercent: t.moisturePercent ?? "", specificWeightKgHl: t.specificWeightKgHl ?? "",
      proteinPercent: t.proteinPercent ?? "",
      hagbergFallingNumber: t.hagbergFallingNumber != null ? String(t.hagbergFallingNumber) : "",
      screeningsPercent: t.screeningsPercent ?? "", overallGrade: t.overallGrade ?? "",
      testingLab: t.testingLab ?? "", certificateReference: t.certificateReference ?? "",
      notes: t.notes ?? "",
    });
    setTestOpen(true);
  }

  function openAddTemp() { setEditTemp(null); setTempForm(emptyTempLog()); setTempOpen(true); }
  function openEditTemp(l: TempLog) {
    setEditTemp(l);
    setTempForm({
      logDate: l.logDate, logTime: l.logTime ?? "", temperatureC: l.temperatureC,
      sensorPosition: l.sensorPosition ?? "", moisturePercent: l.moisturePercent ?? "",
      aerationRunning: l.aerationRunning ?? false, dryingRunning: l.dryingRunning ?? false,
      recordedBy: l.recordedBy ?? "", notes: l.notes ?? "",
    });
    setTempOpen(true);
  }

  const isGrainMonitored = GRAIN_TYPES.includes(locationType);

  return (
    <td colSpan={7} className="px-0 py-0">
      <div className="bg-muted/20 border-t px-6 py-4 space-y-3">
        {isGrainMonitored ? (
          <>
            <TabBar>
              <TabButton active={tab === "quality"} onClick={() => setTab("quality")}>
                <span className="flex items-center gap-1.5"><FlaskConical className="h-3.5 w-3.5" /> Quality Tests</span>
              </TabButton>
              <TabButton active={tab === "temperature"} onClick={() => setTab("temperature")}>
                <span className="flex items-center gap-1.5"><Thermometer className="h-3.5 w-3.5" /> Temperature Logs</span>
              </TabButton>
            </TabBar>

            {tab === "quality" && (
              <div className="space-y-2">
                <div className="flex justify-end">
                  <Button size="sm" onClick={openAddTest} className="gap-2"><Plus className="h-3.5 w-3.5" /> Record Quality Test</Button>
                </div>
                {testsQ.isLoading && <p className="text-sm text-muted-foreground">Loading tests…</p>}
                {!testsQ.isLoading && tests.length === 0 && (
                  <div className="border rounded-lg p-8 text-center text-muted-foreground">
                    <FlaskConical className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No quality tests for this location yet.</p>
                  </div>
                )}
                {tests.length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left px-3 py-2.5 font-medium">Date</th>
                          <th className="text-left px-3 py-2.5 font-medium">Crop</th>
                          <th className="text-left px-3 py-2.5 font-medium hidden sm:table-cell">Moisture</th>
                          <th className="text-left px-3 py-2.5 font-medium hidden md:table-cell">Protein</th>
                          <th className="text-left px-3 py-2.5 font-medium hidden lg:table-cell">Hagberg</th>
                          <th className="text-left px-3 py-2.5 font-medium hidden lg:table-cell">Grade</th>
                          <th className="px-3 py-2.5" />
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {tests.map((t) => (
                          <tr key={t.id} className="hover:bg-muted/30">
                            <td className="px-3 py-2.5 font-mono text-xs">{t.testDate}</td>
                            <td className="px-3 py-2.5">{t.cropType}{t.variety ? ` — ${t.variety}` : ""}</td>
                            <td className="px-3 py-2.5 hidden sm:table-cell text-muted-foreground">{t.moisturePercent ? `${t.moisturePercent}%` : "—"}</td>
                            <td className="px-3 py-2.5 hidden md:table-cell text-muted-foreground">{t.proteinPercent ? `${t.proteinPercent}%` : "—"}</td>
                            <td className="px-3 py-2.5 hidden lg:table-cell text-muted-foreground">{t.hagbergFallingNumber ?? "—"}</td>
                            <td className="px-3 py-2.5 hidden lg:table-cell text-muted-foreground">{t.overallGrade || "—"}</td>
                            <td className="px-3 py-2.5">
                              <div className="flex items-center gap-1 justify-end">
                                <Button variant="ghost" size="icon" onClick={() => openEditTest(t)}><Pencil className="h-3.5 w-3.5" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => setDeleteTestId(t.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {tab === "temperature" && (
              <div className="space-y-2">
                <div className="flex justify-end">
                  <Button size="sm" onClick={openAddTemp} className="gap-2"><Plus className="h-3.5 w-3.5" /> Log Temperature</Button>
                </div>
                {tempsQ.isLoading && <p className="text-sm text-muted-foreground">Loading logs…</p>}
                {!tempsQ.isLoading && temps.length === 0 && (
                  <div className="border rounded-lg p-8 text-center text-muted-foreground">
                    <Thermometer className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No temperature readings for this location yet.</p>
                  </div>
                )}
                {temps.length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left px-3 py-2.5 font-medium">Date / Time</th>
                          <th className="text-left px-3 py-2.5 font-medium">Temp (°C)</th>
                          <th className="text-left px-3 py-2.5 font-medium hidden sm:table-cell">Sensor</th>
                          <th className="text-left px-3 py-2.5 font-medium hidden md:table-cell">Moisture</th>
                          <th className="text-left px-3 py-2.5 font-medium hidden lg:table-cell">Systems</th>
                          <th className="px-3 py-2.5" />
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {temps.map((l) => (
                          <tr key={l.id} className="hover:bg-muted/30">
                            <td className="px-3 py-2.5 font-mono text-xs">{l.logDate}{l.logTime ? ` ${l.logTime}` : ""}</td>
                            <td className="px-3 py-2.5 font-semibold">{l.temperatureC}°C</td>
                            <td className="px-3 py-2.5 hidden sm:table-cell text-muted-foreground">{l.sensorPosition || "—"}</td>
                            <td className="px-3 py-2.5 hidden md:table-cell text-muted-foreground">{l.moisturePercent ? `${l.moisturePercent}%` : "—"}</td>
                            <td className="px-3 py-2.5 hidden lg:table-cell">
                              <div className="flex gap-1 text-xs">
                                {l.aerationRunning && <span className="bg-blue-50 text-blue-700 border border-blue-200 rounded px-1.5 py-0.5">Aeration</span>}
                                {l.dryingRunning && <span className="bg-orange-50 text-orange-700 border border-orange-200 rounded px-1.5 py-0.5">Drying</span>}
                              </div>
                            </td>
                            <td className="px-3 py-2.5">
                              <div className="flex items-center gap-1 justify-end">
                                <Button variant="ghost" size="icon" onClick={() => openEditTemp(l)}><Pencil className="h-3.5 w-3.5" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => setDeleteTempId(l.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Quality tests and temperature monitoring are available for grain stores, silos, and bins.
          </p>
        )}
      </div>

      {/* Quality Test Dialog */}
      <Dialog open={testOpen} onOpenChange={(o) => { setTestOpen(o); if (!o) { setEditTest(null); setTestForm(emptyQualityTest()); } }}>
        <DialogContent style={{ maxWidth: 580 }} aria-describedby={undefined}>
          <DialogHeader><DialogTitle>{editTest ? "Edit Quality Test" : "Record Quality Test"}</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2 max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Test Date <span className="text-destructive">*</span></Label>
                <Input type="date" value={testForm.testDate} onChange={(e) => setTestForm((f) => ({ ...f, testDate: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Crop Type <span className="text-destructive">*</span></Label>
                <Select value={testForm.cropType} onValueChange={(v) => setTestForm((f) => ({ ...f, cropType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CROP_TYPES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Variety</Label>
                <Input placeholder="e.g. Crusoe" value={testForm.variety} onChange={(e) => setTestForm((f) => ({ ...f, variety: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Harvest Year</Label>
                <Input type="number" placeholder="e.g. 2024" value={testForm.harvestYear} onChange={(e) => setTestForm((f) => ({ ...f, harvestYear: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Moisture (%)</Label>
                <Input type="number" step="0.01" placeholder="e.g. 14.5" value={testForm.moisturePercent} onChange={(e) => setTestForm((f) => ({ ...f, moisturePercent: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Specific Weight (kg/hl)</Label>
                <Input type="number" step="0.1" placeholder="e.g. 76.5" value={testForm.specificWeightKgHl} onChange={(e) => setTestForm((f) => ({ ...f, specificWeightKgHl: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Protein (%)</Label>
                <Input type="number" step="0.01" placeholder="e.g. 12.5" value={testForm.proteinPercent} onChange={(e) => setTestForm((f) => ({ ...f, proteinPercent: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Hagberg Falling Number</Label>
                <Input type="number" placeholder="e.g. 250" value={testForm.hagbergFallingNumber} onChange={(e) => setTestForm((f) => ({ ...f, hagbergFallingNumber: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Screenings (%)</Label>
                <Input type="number" step="0.01" placeholder="e.g. 2.1" value={testForm.screeningsPercent} onChange={(e) => setTestForm((f) => ({ ...f, screeningsPercent: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Overall Grade</Label>
                <Input placeholder="e.g. Group 1, Feed" value={testForm.overallGrade} onChange={(e) => setTestForm((f) => ({ ...f, overallGrade: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Testing Lab</Label>
                <Input placeholder="e.g. NRM Laboratories" value={testForm.testingLab} onChange={(e) => setTestForm((f) => ({ ...f, testingLab: e.target.value }))} />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Certificate Reference</Label>
                <Input placeholder="e.g. NRM-2024-001234" value={testForm.certificateReference} onChange={(e) => setTestForm((f) => ({ ...f, certificateReference: e.target.value }))} />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Notes</Label>
                <Textarea rows={2} value={testForm.notes} onChange={(e) => setTestForm((f) => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestOpen(false)}>Cancel</Button>
            <Button
              disabled={!testForm.testDate || !testForm.cropType || saveTest.isPending}
              onClick={() => saveTest.mutate({
                locationId,
                testDate: testForm.testDate, cropType: testForm.cropType,
                variety: testForm.variety || null,
                harvestYear: testForm.harvestYear ? parseInt(testForm.harvestYear) : null,
                moisturePercent: testForm.moisturePercent || null,
                specificWeightKgHl: testForm.specificWeightKgHl || null,
                proteinPercent: testForm.proteinPercent || null,
                hagbergFallingNumber: testForm.hagbergFallingNumber ? parseInt(testForm.hagbergFallingNumber) : null,
                screeningsPercent: testForm.screeningsPercent || null,
                overallGrade: testForm.overallGrade || null,
                testingLab: testForm.testingLab || null,
                certificateReference: testForm.certificateReference || null,
                notes: testForm.notes || null,
              })}
            >
              {saveTest.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : editTest ? "Save Changes" : "Save Test"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteTestId !== null} onOpenChange={(o) => { if (!o) setDeleteTestId(null); }}>
        <DialogContent style={{ maxWidth: 380 }} aria-describedby={undefined}>
          <DialogHeader><DialogTitle>Delete Quality Test</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure? This cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTestId(null)}>Cancel</Button>
            <Button variant="destructive" disabled={deleteTest.isPending} onClick={() => deleteTestId !== null && deleteTest.mutate(deleteTestId)}>
              {deleteTest.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Temperature Log Dialog */}
      <Dialog open={tempOpen} onOpenChange={(o) => { setTempOpen(o); if (!o) { setEditTemp(null); setTempForm(emptyTempLog()); } }}>
        <DialogContent style={{ maxWidth: 520 }} aria-describedby={undefined}>
          <DialogHeader><DialogTitle>{editTemp ? "Edit Temperature Log" : "Log Temperature Reading"}</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2 max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Date <span className="text-destructive">*</span></Label>
                <Input type="date" value={tempForm.logDate} onChange={(e) => setTempForm((f) => ({ ...f, logDate: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Time</Label>
                <Input type="time" value={tempForm.logTime} onChange={(e) => setTempForm((f) => ({ ...f, logTime: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Temperature (°C) <span className="text-destructive">*</span></Label>
                <Input type="number" step="0.1" placeholder="e.g. 15.5" value={tempForm.temperatureC} onChange={(e) => setTempForm((f) => ({ ...f, temperatureC: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Sensor Position</Label>
                <Input placeholder="e.g. Top centre, Bay 2" value={tempForm.sensorPosition} onChange={(e) => setTempForm((f) => ({ ...f, sensorPosition: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Moisture (%)</Label>
                <Input type="number" step="0.01" placeholder="e.g. 14.0" value={tempForm.moisturePercent} onChange={(e) => setTempForm((f) => ({ ...f, moisturePercent: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Recorded By</Label>
                <Input placeholder="Name" value={tempForm.recordedBy} onChange={(e) => setTempForm((f) => ({ ...f, recordedBy: e.target.value }))} />
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <input id={`tmp-aer-${locationId}`} type="checkbox" checked={tempForm.aerationRunning} onChange={(e) => setTempForm((f) => ({ ...f, aerationRunning: e.target.checked }))} className="h-4 w-4" />
                <Label htmlFor={`tmp-aer-${locationId}`} className="cursor-pointer font-normal">Aeration running</Label>
                <input id={`tmp-dry-${locationId}`} type="checkbox" checked={tempForm.dryingRunning} onChange={(e) => setTempForm((f) => ({ ...f, dryingRunning: e.target.checked }))} className="h-4 w-4 ml-4" />
                <Label htmlFor={`tmp-dry-${locationId}`} className="cursor-pointer font-normal">Drying running</Label>
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Notes</Label>
                <Textarea rows={2} value={tempForm.notes} onChange={(e) => setTempForm((f) => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTempOpen(false)}>Cancel</Button>
            <Button
              disabled={!tempForm.logDate || !tempForm.temperatureC || saveTemp.isPending}
              onClick={() => saveTemp.mutate({
                locationId,
                logDate: tempForm.logDate, logTime: tempForm.logTime || null,
                temperatureC: tempForm.temperatureC,
                sensorPosition: tempForm.sensorPosition || null,
                moisturePercent: tempForm.moisturePercent || null,
                aerationRunning: tempForm.aerationRunning,
                dryingRunning: tempForm.dryingRunning,
                recordedBy: tempForm.recordedBy || null,
                notes: tempForm.notes || null,
              })}
            >
              {saveTemp.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : editTemp ? "Save Changes" : "Save Log"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteTempId !== null} onOpenChange={(o) => { if (!o) setDeleteTempId(null); }}>
        <DialogContent style={{ maxWidth: 380 }} aria-describedby={undefined}>
          <DialogHeader><DialogTitle>Delete Temperature Log</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure? This cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTempId(null)}>Cancel</Button>
            <Button variant="destructive" disabled={deleteTemp.isPending} onClick={() => deleteTempId !== null && deleteTemp.mutate(deleteTempId)}>
              {deleteTemp.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </td>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StorageLocationsPage() {
  const { farmId } = useAppStore();
  const qc = useQueryClient();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [qrLocation, setQrLocation] = useState<StorageLocation | null>(null);
  const [isSavingStorageCode, setIsSavingStorageCode] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const locationsQ = useQuery({
    queryKey: ["storage-locations", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/storage-locations`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId,
  });

  const locations: StorageLocation[] = locationsQ.data?.records ?? [];

  const saveMut = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const url = editId
        ? `/api/farms/${farmId}/storage-locations/${editId}`
        : `/api/farms/${farmId}/storage-locations`;
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["storage-locations", farmId] });
      setDialogOpen(false); setEditId(null); setForm(emptyForm());
      toast({ title: editId ? "Location updated" : "Location added", description: "Storage location saved." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save storage location.", variant: "destructive" });
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/farms/${farmId}/storage-locations/${id}`, { method: "DELETE", credentials: "include" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["storage-locations", farmId] });
      setDeleteId(null); toast({ title: "Deleted", description: "Storage location removed." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete storage location.", variant: "destructive" });
    },
  });

  function openAdd() {
    setEditId(null); setForm(emptyForm()); setDialogOpen(true);
  }

  function openEdit(loc: StorageLocation) {
    setEditId(loc.id);
    setForm({
      name: loc.name,
      type: loc.type,
      capacityTonnes: loc.capacityTonnes ?? "",
      locationDescription: loc.locationDescription ?? "",
      notes: loc.notes ?? "",
      isActive: loc.isActive,
      pin: locToLatLng(loc),
      binType: loc.binType ?? "Bin",
      dryingSystem: loc.dryingSystem ?? "None",
      aerationSystem: loc.aerationSystem ?? false,
      temperatureMonitoring: loc.temperatureMonitoring ?? false,
      sensorCount: loc.sensorCount != null ? String(loc.sensorCount) : "",
    });
    setDialogOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const isGrain = GRAIN_TYPES.includes(form.type);
    saveMut.mutate({
      name: form.name,
      type: form.type,
      capacityTonnes: form.capacityTonnes || null,
      locationDescription: form.locationDescription || null,
      latitude: form.pin ? String(form.pin.lat) : null,
      longitude: form.pin ? String(form.pin.lng) : null,
      notes: form.notes || null,
      isActive: form.isActive,
      binType: isGrain ? (form.binType || null) : null,
      dryingSystem: isGrain ? (form.dryingSystem || null) : null,
      aerationSystem: isGrain ? form.aerationSystem : null,
      temperatureMonitoring: isGrain ? form.temperatureMonitoring : null,
      sensorCount: isGrain && form.sensorCount ? parseInt(form.sensorCount) : null,
    });
  }

  function openMapFor(loc: StorageLocation) {
    const pin = locToLatLng(loc);
    if (!pin) return;
    window.open(`https://www.openstreetmap.org/?mlat=${pin.lat}&mlon=${pin.lng}#map=17/${pin.lat}/${pin.lng}`, "_blank");
  }

  function toggleExpand(id: number) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  const isGrainForm = GRAIN_TYPES.includes(form.type);

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
              <Warehouse className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Storage Locations</h1>
              <p className="text-sm text-muted-foreground">
                All on-farm and off-farm storage — grain stores, silos, bins and more. Expand a row to view quality tests and temperature logs.
              </p>
            </div>
          </div>
          <Button onClick={openAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Location
          </Button>
        </div>

        {locationsQ.isLoading && (
          <p className="text-muted-foreground text-sm">Loading storage locations…</p>
        )}

        {!locationsQ.isLoading && locations.length === 0 && (
          <div className="border rounded-xl p-12 text-center text-muted-foreground">
            <Warehouse className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No storage locations yet. Click <strong>Add Location</strong> to create your first entry.</p>
          </div>
        )}

        {locations.length > 0 && (
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium min-w-[200px]">Name</th>
                  <th className="text-left px-4 py-3 font-medium w-[130px]">Type</th>
                  <th className="text-left px-4 py-3 font-medium w-[110px]">Capacity (t)</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell max-w-[200px]">Location</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell w-[130px]">GPS</th>
                  <th className="text-left px-4 py-3 font-medium w-[90px]">Status</th>
                  <th className="px-4 py-3 w-[156px]" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {locations.map((loc) => {
                  const pin = locToLatLng(loc);
                  const isExpanded = expandedId === loc.id;
                  const isGrain = GRAIN_TYPES.includes(loc.type);
                  return (
                    <>
                      <tr key={loc.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium">
                          <div>{loc.name}</div>
                          {isGrain && loc.binType && (
                            <div className="text-xs text-muted-foreground mt-0.5 flex gap-2">
                              <span>{loc.binType}</span>
                              {loc.dryingSystem && loc.dryingSystem !== "None" && <span>· {loc.dryingSystem}</span>}
                              {loc.aerationSystem && <span className="text-blue-600">· Aeration</span>}
                              {loc.temperatureMonitoring && <span className="text-orange-600">· Temp ×{loc.sensorCount ?? 1}</span>}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={typeBadgeVariant(loc.type)}>{typeLabel(loc.type)}</Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {loc.capacityTonnes ? `${loc.capacityTonnes} t` : "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell max-w-[200px] truncate">
                          {loc.locationDescription || "—"}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          {pin ? (
                            <button
                              onClick={() => openMapFor(loc)}
                              title="View on OpenStreetMap"
                              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline font-mono"
                            >
                              <MapPin className="h-3 w-3 shrink-0" />
                              {pin.lat.toFixed(4)}, {pin.lng.toFixed(4)}
                            </button>
                          ) : (
                            <span className="text-muted-foreground text-xs">Not set</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {loc.isActive ? (
                            <span className="flex items-center gap-1 text-green-600 text-xs">
                              <CheckCircle className="h-4 w-4" /> Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-muted-foreground text-xs">
                              <XCircle className="h-4 w-4" /> Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1 justify-end">
                            <Button
                              variant="ghost" size="icon"
                              title={isExpanded ? "Collapse" : (isGrain ? "Quality Tests & Temperature" : "Expand")}
                              onClick={() => toggleExpand(loc.id)}
                              className={isGrain ? "text-amber-600" : "text-muted-foreground"}
                            >
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" title="QR Code" onClick={() => setQrLocation(loc)}>
                              <QrCode className="h-4 w-4 text-teal-600" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openEdit(loc)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteId(loc.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && farmId && (
                        <tr key={`${loc.id}-panel`}>
                          <GrainMonitoringPanel farmId={farmId} locationId={loc.id} locationType={loc.type} />
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* QR Code Dialog */}
        {qrLocation && (() => {
          const autoCode = `STG-${String(qrLocation.id).padStart(4, "0")}`;
          const displayCode = qrLocation.storageCode || null;
          const saveStorageCode = async (code: string) => {
            setIsSavingStorageCode(true);
            try {
              await fetch(`/api/farms/${farmId}/storage-locations/${qrLocation.id}`, {
                method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include",
                body: JSON.stringify({ storageCode: code }),
              });
              qc.invalidateQueries({ queryKey: ["storage-locations", farmId] });
              setQrLocation((prev) => prev ? { ...prev, storageCode: code } : null);
            } finally { setIsSavingStorageCode(false); }
          };
          return (
            <Dialog open onOpenChange={(o) => { if (!o) setQrLocation(null); }}>
              <DialogContent style={{ maxWidth: "22rem" }} aria-describedby={undefined}>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2"><QrCode className="w-4 h-4 text-teal-600" /> Storage Location QR Label</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center gap-4 py-2">
                  <p className="text-xs text-muted-foreground font-medium">{qrLocation.name}</p>
                  {displayCode ? (
                    <>
                      <span className="font-mono text-lg font-bold tracking-widest text-teal-700">{displayCode}</span>
                      <QRCodeSVG value={displayCode} size={180} bgColor="#ffffff" fgColor="#0f766e" level="M" />
                      <p className="text-xs text-muted-foreground text-center">Fix to the store entrance so field workers can scan on arrival to log deliveries and stock movements.</p>
                      <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2"><Printer className="w-3.5 h-3.5" /> Print Label</Button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-center w-[180px] h-[180px] border-2 border-dashed border-muted-foreground/30 rounded-lg">
                        <QrCode className="w-16 h-16 text-muted-foreground/30" />
                      </div>
                      <p className="text-sm text-muted-foreground text-center">No QR code yet. Assign code <strong className="font-mono">{autoCode}</strong> to this location.</p>
                      <Button onClick={() => saveStorageCode(autoCode)} disabled={isSavingStorageCode} className="gap-2">
                        {isSavingStorageCode ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                        Generate QR Code
                      </Button>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          );
        })()}

        {/* Add / Edit Location Dialog */}
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditId(null); setForm(emptyForm()); } }}>
          <DialogContent style={{ maxWidth: 640 }} aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>{editId ? "Edit Storage Location" : "Add Storage Location"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2 max-h-[80vh] overflow-y-auto pr-1">
              <div className="space-y-1">
                <Label>Name <span className="text-destructive">*</span></Label>
                <Input
                  required
                  placeholder="e.g. Grain Store 1, North Silo, East Bin"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Type <span className="text-destructive">*</span></Label>
                  <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LOCATION_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Capacity (tonnes)</Label>
                  <Input
                    type="number" step="0.1" min="0" placeholder="e.g. 500"
                    value={form.capacityTonnes}
                    onChange={(e) => setForm((f) => ({ ...f, capacityTonnes: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label>Location description</Label>
                <Input
                  placeholder="e.g. North yard, adjacent to main barn"
                  value={form.locationDescription}
                  onChange={(e) => setForm((f) => ({ ...f, locationDescription: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  GPS Pin Location
                </Label>
                <StorageLocationMapPicker
                  key={dialogOpen ? "open" : "closed"}
                  value={form.pin}
                  onChange={(pin) => setForm((f) => ({ ...f, pin }))}
                />
              </div>

              {/* Grain-specific fields — only shown for grain_store, silo, bin */}
              {isGrainForm && (
                <div className="rounded-lg border bg-amber-50/50 p-4 space-y-3">
                  <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">Grain Storage Details</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Store Sub-type</Label>
                      <Select value={form.binType} onValueChange={(v) => setForm((f) => ({ ...f, binType: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{BIN_SUBTYPES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Drying System</Label>
                      <Select value={form.dryingSystem} onValueChange={(v) => setForm((f) => ({ ...f, dryingSystem: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{DRYING_SYSTEMS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Temperature Sensor Count</Label>
                      <Input
                        type="number" min="0" placeholder="e.g. 4"
                        value={form.sensorCount}
                        onChange={(e) => setForm((f) => ({ ...f, sensorCount: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2 flex flex-col justify-end">
                      <div className="flex items-center gap-2">
                        <input id="aer-sys" type="checkbox" checked={form.aerationSystem} onChange={(e) => setForm((f) => ({ ...f, aerationSystem: e.target.checked }))} className="h-4 w-4" />
                        <Label htmlFor="aer-sys" className="cursor-pointer font-normal text-sm">Aeration system fitted</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input id="temp-mon" type="checkbox" checked={form.temperatureMonitoring} onChange={(e) => setForm((f) => ({ ...f, temperatureMonitoring: e.target.checked }))} className="h-4 w-4" />
                        <Label htmlFor="temp-mon" className="cursor-pointer font-normal text-sm">Temperature monitoring</Label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Any additional details…"
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="isActive" type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="h-4 w-4"
                />
                <Label htmlFor="isActive" className="cursor-pointer">Active (available for harvest transport runs)</Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saveMut.isPending}>
                  {saveMut.isPending ? "Saving…" : editId ? "Save Changes" : "Add Location"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteId !== null} onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
          <DialogContent style={{ maxWidth: 400 }} aria-describedby={undefined}>
            <DialogHeader><DialogTitle>Delete Storage Location</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this storage location? This cannot be undone. Associated quality tests and temperature logs will remain in the database but will no longer be linked.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button
                variant="destructive"
                disabled={deleteMut.isPending}
                onClick={() => deleteId !== null && deleteMut.mutate(deleteId)}
              >
                {deleteMut.isPending ? "Deleting…" : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
