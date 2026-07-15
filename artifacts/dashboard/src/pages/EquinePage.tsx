import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/hooks/use-app-store";
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
import { BarChart3, Plus, Printer, Stethoscope } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

type EquineRecord = {
  id: number;
  horseName: string;
  passportNumber: string | null;
  uelnNumber: string | null;
  breed: string | null;
  colour: string | null;
  sex: string | null;
  dateOfBirth: string | null;
  microchipNumber: string | null;
  ownerName: string | null;
  liveryType: string | null;
  box: string | null;
  status: string;
  notes: string | null;
};

type EquineHealthEvent = {
  id: number;
  horseId: number;
  eventDate: string;
  eventType: string;
  vetOrFarrierName: string | null;
  treatmentGiven: string | null;
  productUsed: string | null;
  batchNumber: string | null;
  withdrawalPeriodDays: number | null;
  cost: string | null;
  notes: string | null;
};

const EMPTY_HORSE: Partial<EquineRecord> = { status: "active" };
const EMPTY_EVENT: Partial<EquineHealthEvent> = {
  eventDate: new Date().toISOString().slice(0, 10),
  eventType: "vet_visit",
};

const EVENT_TYPES = ["vet_visit", "vaccination", "dental", "farriery", "worming", "passport", "other"];
const STATUS_BADGE: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  sold: "bg-gray-100 text-gray-600",
  deceased: "bg-red-100 text-red-700",
  loaned: "bg-blue-100 text-blue-800",
};
const EVENT_COLOURS = ["#3b82f6", "#22c55e", "#8b5cf6", "#f97316", "#eab308", "#06b6d4", "#9ca3af"];

export default function EquinePage() {
  const { farmId } = useAppStore();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [tab, setTab] = useState<"horses" | "health" | "analytics">("horses");
  const [search, setSearch] = useState("");
  const [selectedHorse, setSelectedHorse] = useState<number | null>(null);
  const [horseOpen, setHorseOpen] = useState(false);
  const [eventOpen, setEventOpen] = useState(false);
  const [editingHorse, setEditingHorse] = useState<EquineRecord | null>(null);
  const [editingEvent, setEditingEvent] = useState<EquineHealthEvent | null>(null);
  const [horseForm, setHorseForm] = useState<any>(EMPTY_HORSE);
  const [eventForm, setEventForm] = useState<any>(EMPTY_EVENT);

  const horsesQ = useQuery<EquineRecord[]>({
    queryKey: ["farms", farmId, "equine-records"],
    queryFn: () => api.get(`/farms/${farmId}/equine-records`).then(r => r.horses ?? r.records ?? []),
    enabled: !!farmId,
  });

  const eventsQ = useQuery<EquineHealthEvent[]>({
    queryKey: ["farms", farmId, "equine-health-events"],
    queryFn: () => api.get(`/farms/${farmId}/equine-health-events`).then(r => r.events ?? r.records ?? []),
    enabled: !!farmId,
  });

  const horseMut = useMutation({
    mutationFn: (body: any) =>
      editingHorse
        ? api.put(`/farms/${farmId}/equine-records/${editingHorse.id}`, body)
        : api.post(`/farms/${farmId}/equine-records`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["farms", farmId, "equine-records"] });
      toast({ title: editingHorse ? "Horse record updated" : "Horse added" });
      setHorseOpen(false);
      setEditingHorse(null);
      setHorseForm(EMPTY_HORSE);
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const eventMut = useMutation({
    mutationFn: (body: any) =>
      editingEvent
        ? api.put(`/farms/${farmId}/equine-health-events/${editingEvent.id}`, body)
        : api.post(`/farms/${farmId}/equine-health-events`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["farms", farmId, "equine-health-events"] });
      toast({ title: editingEvent ? "Event updated" : "Health event saved" });
      setEventOpen(false);
      setEditingEvent(null);
      setEventForm(EMPTY_EVENT);
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const horses = horsesQ.data ?? [];
  const events = eventsQ.data ?? [];

  const filteredHorses = horses.filter(h =>
    !search || h.horseName.toLowerCase().includes(search.toLowerCase()) ||
    (h.ownerName ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (h.breed ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const filteredEvents = selectedHorse ? events.filter(e => e.horseId === selectedHorse) : events;
  const getHorseName = (id: number) => horses.find(h => h.id === id)?.horseName ?? `Horse ${id}`;
  const fh = (field: string, val: any) => setHorseForm((p: any) => ({ ...p, [field]: val }));
  const fe = (field: string, val: any) => setEventForm((p: any) => ({ ...p, [field]: val }));

  const today = new Date().toISOString().slice(0, 10);
  const activeHorses = horses.filter(h => h.status === "active").length;
  const onWithdrawal = events.filter(e => e.withdrawalPeriodDays && e.withdrawalPeriodDays > 0 &&
    new Date(e.eventDate).getTime() + e.withdrawalPeriodDays * 86400000 > Date.now()).length;

  const eventTypeData = EVENT_TYPES.map(t => ({
    type: t.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    count: events.filter(e => e.eventType === t).length,
  })).filter(d => d.count > 0);

  const monthlyEvents = Array.from({ length: 12 }, (_, i) => {
    const m = String(i + 1).padStart(2, "0");
    return {
      month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
      count: events.filter(e => e.eventDate.slice(5, 7) === m).length,
    };
  });

  const totalCost = events.reduce((s, e) => s + (parseFloat(e.cost ?? "0") || 0), 0);

  return (
    <AppLayout title="Equine Register">
      <div className="mb-4 flex gap-2">
        {(["horses", "health", "analytics"] as const).map(t => (
          <Button key={t} variant={tab === t ? "default" : "outline"} size="sm" onClick={() => setTab(t)}>
            {t === "horses" ? `Horses & Ponies (${horses.length})` : t === "health" ? "Health Events" : <><BarChart3 className="w-3.5 h-3.5 mr-1 inline" />Analytics</>}
          </Button>
        ))}
      </div>

      {tab === "horses" && (
        <>
          <div className="flex items-center justify-between mb-4 gap-3">
            <Input placeholder="Search by name, owner, breed…" value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
            <Button onClick={() => { setEditingHorse(null); setHorseForm({ ...EMPTY_HORSE }); setHorseOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Horse</Button>
          </div>
          {horsesQ.isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : filteredHorses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <span className="text-5xl mb-2 block">🐴</span>
              <p>No horses registered. Add your first equine.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredHorses.map(h => (
                <div key={h.id} className="bg-white border rounded-lg p-4 cursor-pointer hover:shadow-sm transition-shadow" onClick={() => { setEditingHorse(h); setHorseForm({ ...h }); setHorseOpen(true); }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold">{h.horseName}</div>
                    <Badge className={`text-xs ${STATUS_BADGE[h.status] ?? "bg-gray-100 text-gray-600"}`}>{h.status}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    {h.breed && <p>Breed: {h.breed}{h.colour ? ` · ${h.colour}` : ""}{h.sex ? ` · ${h.sex}` : ""}</p>}
                    {h.ownerName && <p>Owner: {h.ownerName}</p>}
                    {h.passportNumber && <p>Passport: {h.passportNumber}</p>}
                    {h.uelnNumber && <p>UELN: {h.uelnNumber}</p>}
                    {h.microchipNumber && <p>Chip: {h.microchipNumber}</p>}
                    {h.box && <p>Box/Location: {h.box}</p>}
                    {h.liveryType && <p>Livery: {h.liveryType}</p>}
                    {h.dateOfBirth && <p>DOB: {h.dateOfBirth}</p>}
                  </div>
                  <Button size="sm" className="mt-3" variant="outline" onClick={e => {
                    e.stopPropagation();
                    setSelectedHorse(h.id);
                    setTab("health");
                  }}>
                    <Stethoscope className="w-3 h-3 mr-1" />View Health Events
                  </Button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "health" && (
        <>
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              {horses.length > 0 && (
                <Select value={selectedHorse?.toString() ?? ""} onValueChange={v => setSelectedHorse(v ? Number(v) : null)}>
                  <SelectTrigger className="w-44"><SelectValue placeholder="All horses" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All horses</SelectItem>
                    {horses.map(h => <SelectItem key={h.id} value={String(h.id)}>{h.horseName}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </div>
            <Button onClick={() => {
              setEditingEvent(null);
              setEventForm({ ...EMPTY_EVENT, horseId: selectedHorse ?? (horses[0]?.id ?? null) });
              setEventOpen(true);
            }}><Plus className="w-4 h-4 mr-1" />Add Health Event</Button>
          </div>
          {eventsQ.isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Stethoscope className="mx-auto mb-2 w-10 h-10 opacity-30" />
              <p>No health events recorded{selectedHorse ? ` for ${getHorseName(selectedHorse)}` : ""}.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvents.sort((a, b) => b.eventDate.localeCompare(a.eventDate)).map(e => (
                <div key={e.id} className="bg-white border rounded-lg p-4 flex items-start justify-between gap-4 cursor-pointer hover:shadow-sm" onClick={() => { setEditingEvent(e); setEventForm({ ...e }); setEventOpen(true); }}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-sm">{e.eventDate}</span>
                      <Badge className="text-xs bg-blue-100 text-blue-800 capitalize">{e.eventType.replace(/_/g, " ")}</Badge>
                      {!selectedHorse && <span className="text-xs text-muted-foreground">{getHorseName(e.horseId)}</span>}
                    </div>
                    <div className="text-xs text-muted-foreground space-x-3">
                      {e.vetOrFarrierName && <span>By: {e.vetOrFarrierName}</span>}
                      {e.treatmentGiven && <span>Treatment: {e.treatmentGiven}</span>}
                      {e.productUsed && <span>Product: {e.productUsed}</span>}
                      {e.withdrawalPeriodDays != null && e.withdrawalPeriodDays > 0 && <span className="text-orange-700">Withdrawal: {e.withdrawalPeriodDays}d</span>}
                      {e.cost && <span>Cost: £{e.cost}</span>}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={ev => { ev.stopPropagation(); window.print(); }}><Printer className="w-4 h-4" /></Button>
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
              { label: "Total Horses", value: horses.length },
              { label: "Active", value: activeHorses, green: activeHorses > 0 },
              { label: "Health Events", value: events.length },
              { label: "Total Vet/Farrier Cost", value: totalCost > 0 ? `£${totalCost.toFixed(2)}` : "—" },
            ].map((s, i) => (
              <div key={i} className="bg-white border rounded-lg p-4 text-center">
                <div className={`text-2xl font-bold ${(s as any).green ? "text-green-600" : ""}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>

          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border rounded-lg">
              <BarChart3 className="mx-auto mb-2 w-8 h-8 opacity-30" />
              <p>Add health events to see analytics.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {eventTypeData.length > 0 && (
                <div className="bg-white border rounded-lg p-4">
                  <div className="text-sm font-medium mb-3">Events by Type</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={eventTypeData} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={65}>
                        {eventTypeData.map((_, i) => <Cell key={i} fill={EVENT_COLOURS[i % EVENT_COLOURS.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="bg-white border rounded-lg p-4">
                <div className="text-sm font-medium mb-3">Monthly Event Frequency</div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={monthlyEvents}>
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Events" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {onWithdrawal > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="text-sm font-semibold text-amber-800 mb-1">Withdrawal Periods Active</div>
              <p className="text-xs text-amber-700">{onWithdrawal} horse{onWithdrawal > 1 ? "s" : ""} currently under a medicine withdrawal period. Check health events for details before competition or slaughter.</p>
            </div>
          )}

          {horses.length > 0 && (
            <div className="bg-white border rounded-lg p-4">
              <div className="text-sm font-medium mb-3">Register Summary</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {["active", "loaned", "sold", "deceased"].map(st => (
                  <div key={st} className="rounded border p-2 text-center">
                    <div className="text-lg font-bold">{horses.filter(h => h.status === st).length}</div>
                    <div className="text-muted-foreground capitalize">{st}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog open={horseOpen} onOpenChange={o => { setHorseOpen(o); if (!o) { setEditingHorse(null); setHorseForm(EMPTY_HORSE); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingHorse ? "Edit Horse Record" : "Add Horse / Pony"}</DialogTitle></DialogHeader>
          <form onSubmit={e => { e.preventDefault(); horseMut.mutate(horseForm); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Name *</Label><Input value={horseForm.horseName ?? ""} onChange={e => fh("horseName", e.target.value)} required /></div>
              <div><Label>Status</Label><Select value={horseForm.status ?? "active"} onValueChange={v => fh("status", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["active","sold","deceased","loaned"].map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Passport Number</Label><Input value={horseForm.passportNumber ?? ""} onChange={e => fh("passportNumber", e.target.value)} /></div>
              <div><Label>UELN</Label><Input value={horseForm.uelnNumber ?? ""} onChange={e => fh("uelnNumber", e.target.value)} placeholder="15-digit passport ID" /></div>
              <div><Label>Breed</Label><Input value={horseForm.breed ?? ""} onChange={e => fh("breed", e.target.value)} /></div>
              <div><Label>Colour</Label><Input value={horseForm.colour ?? ""} onChange={e => fh("colour", e.target.value)} /></div>
              <div><Label>Sex</Label><Select value={horseForm.sex ?? ""} onValueChange={v => fh("sex", v)}><SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger><SelectContent>{["stallion","gelding","mare","colt","filly"].map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Date of Birth</Label><Input type="date" value={horseForm.dateOfBirth ?? ""} onChange={e => fh("dateOfBirth", e.target.value)} /></div>
              <div><Label>Microchip Number</Label><Input value={horseForm.microchipNumber ?? ""} onChange={e => fh("microchipNumber", e.target.value)} /></div>
              <div><Label>Owner Name</Label><Input value={horseForm.ownerName ?? ""} onChange={e => fh("ownerName", e.target.value)} /></div>
              <div><Label>Box / Location</Label><Input value={horseForm.box ?? ""} onChange={e => fh("box", e.target.value)} placeholder="e.g. Box 3, Stable B" /></div>
              <div><Label>Livery Type</Label><Input value={horseForm.liveryType ?? ""} onChange={e => fh("liveryType", e.target.value)} placeholder="e.g. Full, DIY, Part" /></div>
            </div>
            <div><Label>Notes</Label><Textarea value={horseForm.notes ?? ""} onChange={e => fh("notes", e.target.value)} rows={2} /></div>
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setHorseOpen(false)}>Cancel</Button><Button type="submit" disabled={horseMut.isPending}>{horseMut.isPending ? "Saving…" : "Save"}</Button></div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={eventOpen} onOpenChange={o => { setEventOpen(o); if (!o) { setEditingEvent(null); setEventForm(EMPTY_EVENT); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingEvent ? "Edit Health Event" : "Add Health Event"}</DialogTitle></DialogHeader>
          <form onSubmit={e => {
            e.preventDefault();
            eventMut.mutate({
              ...eventForm,
              horseId: Number(eventForm.horseId),
              withdrawalPeriodDays: eventForm.withdrawalPeriodDays ? Number(eventForm.withdrawalPeriodDays) : null,
            });
          }} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Horse *</Label><Select value={eventForm.horseId?.toString() ?? ""} onValueChange={v => fe("horseId", Number(v))}><SelectTrigger><SelectValue placeholder="Select horse…" /></SelectTrigger><SelectContent>{horses.map(h => <SelectItem key={h.id} value={String(h.id)}>{h.horseName}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Event Date *</Label><Input type="date" value={eventForm.eventDate ?? ""} onChange={e => fe("eventDate", e.target.value)} required /></div>
              <div><Label>Event Type *</Label><Select value={eventForm.eventType ?? "vet_visit"} onValueChange={v => fe("eventType", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{EVENT_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Vet / Farrier</Label><Input value={eventForm.vetOrFarrierName ?? ""} onChange={e => fe("vetOrFarrierName", e.target.value)} /></div>
              <div><Label>Treatment Given</Label><Input value={eventForm.treatmentGiven ?? ""} onChange={e => fe("treatmentGiven", e.target.value)} /></div>
              <div><Label>Product Used</Label><Input value={eventForm.productUsed ?? ""} onChange={e => fe("productUsed", e.target.value)} /></div>
              <div><Label>Batch Number</Label><Input value={eventForm.batchNumber ?? ""} onChange={e => fe("batchNumber", e.target.value)} /></div>
              <div><Label>Withdrawal (days)</Label><Input type="number" min="0" value={eventForm.withdrawalPeriodDays ?? ""} onChange={e => fe("withdrawalPeriodDays", e.target.value)} /></div>
              <div><Label>Cost (£)</Label><Input type="number" step="0.01" min="0" value={eventForm.cost ?? ""} onChange={e => fe("cost", e.target.value)} /></div>
            </div>
            <div><Label>Notes</Label><Textarea value={eventForm.notes ?? ""} onChange={e => fe("notes", e.target.value)} rows={2} /></div>
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setEventOpen(false)}>Cancel</Button><Button type="submit" disabled={eventMut.isPending}>{eventMut.isPending ? "Saving…" : "Save Event"}</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
