import { b as useAppStore, t as useQueryClient, a as useToast, r as reactExports, l as useQuery, O as useMutation, j as jsxRuntimeExports, c as Button, I as Input, S as Plus, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, L as Label } from "./index-D4lObZN-.js";
import { a as api } from "./api-Bry3C6Hl.js";
import { A as AppLayout, e as ChartColumn, q as Stethoscope } from "./AppLayout-BKBsldGd.js";
import { T as Textarea } from "./textarea-B0Gm6AoE.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-C4Pq2gVb.js";
import { B as Badge } from "./badge-BLSjTRgK.js";
import { P as Printer } from "./printer-BiWKKgmh.js";
import { R as ResponsiveContainer, C as Cell, T as Tooltip, L as Legend, X as XAxis, Y as YAxis, B as Bar } from "./generateCategoricalChart-G5vbZpMK.js";
import { P as PieChart, a as Pie } from "./PieChart-CS-g80k4.js";
import { B as BarChart } from "./BarChart-CwIW9W42.js";
import "./use-safe-clerk-DorCPl21.js";
import "./trash-2-DroCO_jq.js";
import "./database-BEwUBe6M.js";
import "./shield-alert-7Mof_4Bm.js";
import "./triangle-alert-Pybqs7xh.js";
import "./shield-check-B9upXApD.js";
import "./tractor-Pk_eE9Ho.js";
import "./index-BgBWDs_s.js";
import "./index-vcfRMgR_.js";
import "./chevron-up-B6ojcm9k.js";
const EMPTY_HORSE = { status: "active" };
const EMPTY_EVENT = {
  eventDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
  eventType: "vet_visit"
};
const EVENT_TYPES = ["vet_visit", "vaccination", "dental", "farriery", "worming", "passport", "other"];
const STATUS_BADGE = {
  active: "bg-green-100 text-green-800",
  sold: "bg-gray-100 text-gray-600",
  deceased: "bg-red-100 text-red-700",
  loaned: "bg-blue-100 text-blue-800"
};
const EVENT_COLOURS = ["#3b82f6", "#22c55e", "#8b5cf6", "#f97316", "#eab308", "#06b6d4", "#9ca3af"];
function EquinePage() {
  const { farmId } = useAppStore();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [tab, setTab] = reactExports.useState("horses");
  const [search, setSearch] = reactExports.useState("");
  const [selectedHorse, setSelectedHorse] = reactExports.useState(null);
  const [horseOpen, setHorseOpen] = reactExports.useState(false);
  const [eventOpen, setEventOpen] = reactExports.useState(false);
  const [editingHorse, setEditingHorse] = reactExports.useState(null);
  const [editingEvent, setEditingEvent] = reactExports.useState(null);
  const [horseForm, setHorseForm] = reactExports.useState(EMPTY_HORSE);
  const [eventForm, setEventForm] = reactExports.useState(EMPTY_EVENT);
  const horsesQ = useQuery({
    queryKey: ["farms", farmId, "equine-records"],
    queryFn: () => api.get(`/farms/${farmId}/equine-records`).then((r) => r.horses ?? r.records ?? []),
    enabled: !!farmId
  });
  const eventsQ = useQuery({
    queryKey: ["farms", farmId, "equine-health-events"],
    queryFn: () => api.get(`/farms/${farmId}/equine-health-events`).then((r) => r.events ?? r.records ?? []),
    enabled: !!farmId
  });
  const horseMut = useMutation({
    mutationFn: (body) => editingHorse ? api.put(`/farms/${farmId}/equine-records/${editingHorse.id}`, body) : api.post(`/farms/${farmId}/equine-records`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["farms", farmId, "equine-records"] });
      toast({ title: editingHorse ? "Horse record updated" : "Horse added" });
      setHorseOpen(false);
      setEditingHorse(null);
      setHorseForm(EMPTY_HORSE);
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const eventMut = useMutation({
    mutationFn: (body) => editingEvent ? api.put(`/farms/${farmId}/equine-health-events/${editingEvent.id}`, body) : api.post(`/farms/${farmId}/equine-health-events`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["farms", farmId, "equine-health-events"] });
      toast({ title: editingEvent ? "Event updated" : "Health event saved" });
      setEventOpen(false);
      setEditingEvent(null);
      setEventForm(EMPTY_EVENT);
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const horses = horsesQ.data ?? [];
  const events = eventsQ.data ?? [];
  const filteredHorses = horses.filter(
    (h) => !search || h.horseName.toLowerCase().includes(search.toLowerCase()) || (h.ownerName ?? "").toLowerCase().includes(search.toLowerCase()) || (h.breed ?? "").toLowerCase().includes(search.toLowerCase())
  );
  const filteredEvents = selectedHorse ? events.filter((e) => e.horseId === selectedHorse) : events;
  const getHorseName = (id) => horses.find((h) => h.id === id)?.horseName ?? `Horse ${id}`;
  const fh = (field, val) => setHorseForm((p) => ({ ...p, [field]: val }));
  const fe = (field, val) => setEventForm((p) => ({ ...p, [field]: val }));
  (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const activeHorses = horses.filter((h) => h.status === "active").length;
  const onWithdrawal = events.filter((e) => e.withdrawalPeriodDays && e.withdrawalPeriodDays > 0 && new Date(e.eventDate).getTime() + e.withdrawalPeriodDays * 864e5 > Date.now()).length;
  const eventTypeData = EVENT_TYPES.map((t) => ({
    type: t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    count: events.filter((e) => e.eventType === t).length
  })).filter((d) => d.count > 0);
  const monthlyEvents = Array.from({ length: 12 }, (_, i) => {
    const m = String(i + 1).padStart(2, "0");
    return {
      month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
      count: events.filter((e) => e.eventDate.slice(5, 7) === m).length
    };
  });
  const totalCost = events.reduce((s, e) => s + (parseFloat(e.cost ?? "0") || 0), 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { title: "Equine Register", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 flex gap-2", children: ["horses", "health", "analytics"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: tab === t ? "default" : "outline", size: "sm", onClick: () => setTab(t), children: t === "horses" ? `Horses & Ponies (${horses.length})` : t === "health" ? "Health Events" : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "w-3.5 h-3.5 mr-1 inline" }),
      "Analytics"
    ] }) }, t)) }),
    tab === "horses" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search by name, owner, breed…", value: search, onChange: (e) => setSearch(e.target.value), className: "max-w-xs" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          setEditingHorse(null);
          setHorseForm({ ...EMPTY_HORSE });
          setHorseOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Add Horse"
        ] })
      ] }),
      horsesQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading…" }) : filteredHorses.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-5xl mb-2 block", children: "🐴" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No horses registered. Add your first equine." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: filteredHorses.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-lg p-4 cursor-pointer hover:shadow-sm transition-shadow", onClick: () => {
        setEditingHorse(h);
        setHorseForm({ ...h });
        setHorseOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: h.horseName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: `text-xs ${STATUS_BADGE[h.status] ?? "bg-gray-100 text-gray-600"}`, children: h.status })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground space-y-1", children: [
          h.breed && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "Breed: ",
            h.breed,
            h.colour ? ` · ${h.colour}` : "",
            h.sex ? ` · ${h.sex}` : ""
          ] }),
          h.ownerName && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "Owner: ",
            h.ownerName
          ] }),
          h.passportNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "Passport: ",
            h.passportNumber
          ] }),
          h.uelnNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "UELN: ",
            h.uelnNumber
          ] }),
          h.microchipNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "Chip: ",
            h.microchipNumber
          ] }),
          h.box && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "Box/Location: ",
            h.box
          ] }),
          h.liveryType && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "Livery: ",
            h.liveryType
          ] }),
          h.dateOfBirth && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "DOB: ",
            h.dateOfBirth
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "mt-3", variant: "outline", onClick: (e) => {
          e.stopPropagation();
          setSelectedHorse(h.id);
          setTab("health");
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stethoscope, { className: "w-3 h-3 mr-1" }),
          "View Health Events"
        ] })
      ] }, h.id)) })
    ] }),
    tab === "health" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4 gap-3 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: horses.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedHorse?.toString() ?? "", onValueChange: (v) => setSelectedHorse(v ? Number(v) : null), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-44", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All horses" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "", children: "All horses" }),
            horses.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(h.id), children: h.horseName }, h.id))
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          setEditingEvent(null);
          setEventForm({ ...EMPTY_EVENT, horseId: selectedHorse ?? (horses[0]?.id ?? null) });
          setEventOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Add Health Event"
        ] })
      ] }),
      eventsQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading…" }) : filteredEvents.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stethoscope, { className: "mx-auto mb-2 w-10 h-10 opacity-30" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "No health events recorded",
          selectedHorse ? ` for ${getHorseName(selectedHorse)}` : "",
          "."
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: filteredEvents.sort((a, b) => b.eventDate.localeCompare(a.eventDate)).map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-lg p-4 flex items-start justify-between gap-4 cursor-pointer hover:shadow-sm", onClick: () => {
        setEditingEvent(e);
        setEventForm({ ...e });
        setEventOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: e.eventDate }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs bg-blue-100 text-blue-800 capitalize", children: e.eventType.replace(/_/g, " ") }),
            !selectedHorse && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: getHorseName(e.horseId) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground space-x-3", children: [
            e.vetOrFarrierName && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "By: ",
              e.vetOrFarrierName
            ] }),
            e.treatmentGiven && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Treatment: ",
              e.treatmentGiven
            ] }),
            e.productUsed && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Product: ",
              e.productUsed
            ] }),
            e.withdrawalPeriodDays != null && e.withdrawalPeriodDays > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-orange-700", children: [
              "Withdrawal: ",
              e.withdrawalPeriodDays,
              "d"
            ] }),
            e.cost && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Cost: £",
              e.cost
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: (ev) => {
          ev.stopPropagation();
          window.print();
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4" }) })
      ] }, e.id)) })
    ] }),
    tab === "analytics" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
        { label: "Total Horses", value: horses.length },
        { label: "Active", value: activeHorses, green: activeHorses > 0 },
        { label: "Health Events", value: events.length },
        { label: "Total Vet/Farrier Cost", value: totalCost > 0 ? `£${totalCost.toFixed(2)}` : "—" }
      ].map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-lg p-4 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-2xl font-bold ${s.green ? "text-green-600" : ""}`, children: s.value }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: s.label })
      ] }, i)) }),
      events.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8 text-muted-foreground border rounded-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "mx-auto mb-2 w-8 h-8 opacity-30" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Add health events to see analytics." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        eventTypeData.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-lg p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium mb-3", children: "Events by Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 180, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: eventTypeData, dataKey: "count", nameKey: "type", cx: "50%", cy: "50%", outerRadius: 65, children: eventTypeData.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: EVENT_COLOURS[i % EVENT_COLOURS.length] }, i)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {})
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-lg p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium mb-3", children: "Monthly Event Frequency" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 180, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: monthlyEvents, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "month", tick: { fontSize: 11 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { allowDecimals: false, tick: { fontSize: 11 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "count", fill: "#8b5cf6", radius: [4, 4, 0, 0], name: "Events" })
          ] }) })
        ] })
      ] }),
      onWithdrawal > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-lg p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold text-amber-800 mb-1", children: "Withdrawal Periods Active" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-700", children: [
          onWithdrawal,
          " horse",
          onWithdrawal > 1 ? "s" : "",
          " currently under a medicine withdrawal period. Check health events for details before competition or slaughter."
        ] })
      ] }),
      horses.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-lg p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium mb-3", children: "Register Summary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 text-xs", children: ["active", "loaned", "sold", "deceased"].map((st) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded border p-2 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold", children: horses.filter((h) => h.status === st).length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground capitalize", children: st })
        ] }, st)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: horseOpen, onOpenChange: (o) => {
      setHorseOpen(o);
      if (!o) {
        setEditingHorse(null);
        setHorseForm(EMPTY_HORSE);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingHorse ? "Edit Horse Record" : "Add Horse / Pony" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
        e.preventDefault();
        horseMut.mutate(horseForm);
      }, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: horseForm.horseName ?? "", onChange: (e) => fh("horseName", e.target.value), required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: horseForm.status ?? "active", onValueChange: (v) => fh("status", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["active", "sold", "deceased", "loaned"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s.charAt(0).toUpperCase() + s.slice(1) }, s)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Passport Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: horseForm.passportNumber ?? "", onChange: (e) => fh("passportNumber", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "UELN" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: horseForm.uelnNumber ?? "", onChange: (e) => fh("uelnNumber", e.target.value), placeholder: "15-digit passport ID" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Breed" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: horseForm.breed ?? "", onChange: (e) => fh("breed", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Colour" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: horseForm.colour ?? "", onChange: (e) => fh("colour", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sex" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: horseForm.sex ?? "", onValueChange: (v) => fh("sex", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["stallion", "gelding", "mare", "colt", "filly"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s.charAt(0).toUpperCase() + s.slice(1) }, s)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date of Birth" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: horseForm.dateOfBirth ?? "", onChange: (e) => fh("dateOfBirth", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Microchip Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: horseForm.microchipNumber ?? "", onChange: (e) => fh("microchipNumber", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Owner Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: horseForm.ownerName ?? "", onChange: (e) => fh("ownerName", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Box / Location" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: horseForm.box ?? "", onChange: (e) => fh("box", e.target.value), placeholder: "e.g. Box 3, Stable B" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Livery Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: horseForm.liveryType ?? "", onChange: (e) => fh("liveryType", e.target.value), placeholder: "e.g. Full, DIY, Part" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: horseForm.notes ?? "", onChange: (e) => fh("notes", e.target.value), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => setHorseOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: horseMut.isPending, children: horseMut.isPending ? "Saving…" : "Save" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: eventOpen, onOpenChange: (o) => {
      setEventOpen(o);
      if (!o) {
        setEditingEvent(null);
        setEventForm(EMPTY_EVENT);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingEvent ? "Edit Health Event" : "Add Health Event" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
        e.preventDefault();
        eventMut.mutate({
          ...eventForm,
          horseId: Number(eventForm.horseId),
          withdrawalPeriodDays: eventForm.withdrawalPeriodDays ? Number(eventForm.withdrawalPeriodDays) : null
        });
      }, className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Horse *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: eventForm.horseId?.toString() ?? "", onValueChange: (v) => fe("horseId", Number(v)), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select horse…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: horses.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(h.id), children: h.horseName }, h.id)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Event Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: eventForm.eventDate ?? "", onChange: (e) => fe("eventDate", e.target.value), required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Event Type *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: eventForm.eventType ?? "vet_visit", onValueChange: (v) => fe("eventType", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: EVENT_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) }, t)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet / Farrier" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: eventForm.vetOrFarrierName ?? "", onChange: (e) => fe("vetOrFarrierName", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Treatment Given" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: eventForm.treatmentGiven ?? "", onChange: (e) => fe("treatmentGiven", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product Used" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: eventForm.productUsed ?? "", onChange: (e) => fe("productUsed", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Batch Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: eventForm.batchNumber ?? "", onChange: (e) => fe("batchNumber", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Withdrawal (days)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: eventForm.withdrawalPeriodDays ?? "", onChange: (e) => fe("withdrawalPeriodDays", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cost (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", value: eventForm.cost ?? "", onChange: (e) => fe("cost", e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: eventForm.notes ?? "", onChange: (e) => fe("notes", e.target.value), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => setEventOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: eventMut.isPending, children: eventMut.isPending ? "Saving…" : "Save Event" })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  EquinePage as default
};
