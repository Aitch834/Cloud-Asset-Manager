import { useEffect, useState, useMemo } from "react";
import { useLocation } from "wouter";
import { api, type Lead } from "@/lib/api";
import { getSecret } from "@/lib/auth";
import {
  Search, TrendingUp, Users, Mail, Calendar, ChevronRight,
  X, CheckCircle, Clock, PhoneCall, Presentation, XCircle, Leaf, Save, Tag, Sprout, BarChart3,
} from "lucide-react";

const STATUSES = [
  { value: "new", label: "New", color: "bg-blue-100 text-blue-700", icon: Clock },
  { value: "contacted", label: "Contacted", color: "bg-yellow-100 text-yellow-700", icon: PhoneCall },
  { value: "demo-booked", label: "Demo Booked", color: "bg-purple-100 text-purple-700", icon: Presentation },
  { value: "signed-up", label: "Signed Up", color: "bg-green-100 text-green-700", icon: CheckCircle },
  { value: "not-interested", label: "Not Interested", color: "bg-red-100 text-red-700", icon: XCircle },
];

const SOURCES = [
  "Farmers Weekly",
  "Farmers Guardian",
  "NFU",
  "AHDB",
  "Royal Welsh Show",
  "Royal Highland Show",
  "Cereals Event",
  "Referral",
  "Word of Mouth",
  "Social Media",
  "Google Search",
  "Direct Mail",
  "Other",
];

const MODULE_LABELS: Record<string, string> = {
  "red-tractor-compliance": "Red Tractor",
  "field-crop-management": "Field & Crops",
  "sprays-inputs": "Sprays & Inputs",
  "soil-management": "Soil Management",
  "equipment-management": "Equipment",
  "livestock-management": "Livestock",
  "biosecurity": "Biosecurity",
  "staff-training": "Staff & Training",
  "risk-waste": "Risk & Waste",
  "inspections": "Inspections",
  "environmental": "Environmental",
  "haulage-transport": "Haulage",
  "stock-suppliers": "Trade Contacts & Stock",
  "financial-records": "Financial",
  "document-management": "Documents",
  "weather-tracking": "Weather",
  "biofuel-rtfo": "Biofuel / RTFO",
};

const SECTORS = [
  "Beef & Dairy",
  "Sheep & Goat",
  "Arable",
  "Viticulture",
  "Mixed Farming",
  "Agricultural Contracting",
];

const SECTOR_COLORS: Record<string, string> = {
  "Beef & Dairy":              "bg-orange-100 text-orange-700",
  "Sheep & Goat":              "bg-amber-100 text-amber-700",
  "Arable":                    "bg-yellow-100 text-yellow-700",
  "Viticulture":               "bg-purple-100 text-purple-700",
  "Mixed Farming":             "bg-teal-100 text-teal-700",
  "Agricultural Contracting":  "bg-sky-100 text-sky-700",
};

const PACKED_FIELD_KEYS = ["Sector", "Farm type", "County", "CPH number"] as const;

const SECTOR_BAR_COLORS: Record<string, string> = {
  "Beef & Dairy":              "bg-orange-500",
  "Sheep & Goat":              "bg-amber-500",
  "Arable":                    "bg-yellow-500",
  "Viticulture":               "bg-purple-500",
  "Mixed Farming":             "bg-teal-500",
  "Agricultural Contracting":  "bg-sky-500",
};


function SectorBadge({ sector }: { sector: string }) {
  const color = SECTOR_COLORS[sector] ?? "bg-gray-100 text-gray-700";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${color}`}>
      <Sprout className="w-3 h-3" />
      {sector}
    </span>
  );
}

interface SectorStat {
  sector: string;
  total: number;
  converted: number;
  conversionPct: number;
}
function statusMeta(status: string) {
  return STATUSES.find((s) => s.value === status) ?? STATUSES[0];
}

function StatusBadge({ status }: { status: string }) {
  const meta = statusMeta(status);
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${meta.color}`}>
      <Icon className="w-3 h-3" />
      {meta.label}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function isThisWeek(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return d >= weekAgo;
}

interface PanelProps {
  lead: Lead;
  onClose: () => void;
  onSaved: (updated: Lead) => void;
}

function LeadPanel({ lead, onClose, onSaved }: PanelProps) {
  const secret = getSecret()!;
  const [, navigate] = useLocation();
  const [status, setStatus] = useState(lead.status);
  // Sector is a dedicated DB column — editable dropdown
  const [sector, setSector] = useState(lead.sector ?? "");
  // County/farmType/cphNumber are still packed in notes — read-only display
  const [userNotes, setUserNotes] = useState(() => userNotesFromPacked(lead.notes));
  const [source, setSource] = useState(lead.source ?? "");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const packed = parsePackedFields(lead.notes);

  const handleSave = async () => {
    setSaving(true);
    try {
      const fullNotes = rebuildNotes(packed, userNotes);
      const updates: Parameters<typeof api.updateLead>[1] = {
        status,
        notes: fullNotes ?? "",
        source: source || undefined,
      };
      // Omit sector unless the admin changed it. The API treats an omitted
      // field as "leave unchanged", while null is an intentional clear.
      if (sector !== (lead.sector ?? "")) {
        updates.sector = sector || null;
      }
      const result = await api.updateLead(lead.id, updates, secret);
      onSaved(result.lead);
      setDirty(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div
        className="w-full max-w-xl h-full bg-background border-l border-border shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Lead #{lead.id}</p>
            <h2 className="text-xl font-bold text-foreground mt-0.5">{lead.businessName}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Contact</p>
              <p className="font-semibold text-foreground">{lead.contactName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Farms</p>
              <p className="font-semibold text-foreground">{lead.farmCount} farm{lead.farmCount !== 1 ? "s" : ""}</p>
            </div>
            <div className="space-y-1 col-span-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</p>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-foreground">{lead.email}</p>
                <button
                  onClick={() => {
                    onClose();
                    navigate(`/email?tab=compose&to=${encodeURIComponent(lead.email)}&toName=${encodeURIComponent(lead.contactName)}`);
                  }}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                >
                  <Mail className="w-3 h-3" />
                  Open in Mail
                </button>
              </div>
            </div>
            {lead.phone && (
              <div className="space-y-1 col-span-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Phone</p>
                <p className="font-semibold text-foreground">{lead.phone}</p>
              </div>
            )}
            {packed.county && (
              <div className="space-y-1 col-span-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">County</p>
                <p className="font-semibold text-foreground">{packed.county}</p>
              </div>
            )}
            {packed.farmType && (
              <div className="space-y-1 col-span-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Farm Type</p>
                <p className="font-semibold text-foreground">{packed.farmType}</p>
              </div>
            )}
            {packed.cphNumber && (
              <div className="space-y-1 col-span-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">CPH Number</p>
                <p className="font-semibold text-foreground">{packed.cphNumber}</p>
              </div>
            )}
            <div className="space-y-1 col-span-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Registered</p>
              <p className="font-semibold text-foreground">{formatDate(lead.createdAt)}</p>
            </div>
            {lead.lastContactedAt && (
              <div className="space-y-1 col-span-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Last Contacted</p>
                <p className="font-semibold text-foreground">{formatDate(lead.lastContactedAt)}</p>
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Sprout className="w-3 h-3" />
              Sector of Interest
            </p>
            <select
              value={sector}
              onChange={(e) => { setSector(e.target.value); setDirty(true); }}
              className="w-full h-10 px-3 pr-8 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">— Not set —</option>
              {SECTORS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {sector && (
              <div className="mt-2">
                <SectorBadge sector={sector} />
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Modules Interested In</p>
            <div className="flex flex-wrap gap-2">
              {lead.modulesInterested.map((m) => (
                <span key={m} className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full">
                  {MODULE_LABELS[m] ?? m}
                </span>
              ))}
            </div>
          </div>

          {lead.message && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Their Message</p>
              <div className="bg-muted/50 rounded-lg p-4 text-sm text-foreground leading-relaxed border border-border">
                {lead.message}
              </div>
            </div>
          )}

          {/* Source */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Tag className="w-3 h-3" />
              Lead Source
            </p>
            <select
              value={source}
              onChange={(e) => { setSource(e.target.value); setDirty(true); }}
              className="w-full h-10 px-3 pr-8 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">— Not set —</option>
              {SOURCES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Pipeline Status</p>
            <div className="grid grid-cols-1 gap-2">
              {STATUSES.map((s) => {
                const Icon = s.icon;
                const active = status === s.value;
                return (
                  <button
                    key={s.value}
                    onClick={() => { setStatus(s.value); setDirty(true); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium transition-colors text-left ${
                      active
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-card hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`} />
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Internal Notes</p>
            <textarea
              value={userNotes}
              onChange={(e) => { setUserNotes(e.target.value); setDirty(true); }}
              rows={5}
              placeholder="Add follow-up notes, call outcomes, next steps…"
              className="w-full px-3 py-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border shrink-0">
          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            className="w-full flex items-center justify-center gap-2 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSector, setFilterSector] = useState<string>("all");
  const [selected, setSelected] = useState<Lead | null>(null);
  const secret = getSecret()!;

  useEffect(() => {
    api.getLeads(secret)
      .then((d) => setLeads(d.leads))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSaved = (updated: Lead) => {
    setLeads((prev) => prev.map((l) => l.id === updated.id ? updated : l));
    setSelected(updated);
  };

  const filtered = useMemo(() => {
    let list = leads;
    if (filterStatus !== "all") list = list.filter((l) => l.status === filterStatus);
    if (filterSector !== "all") list = list.filter((l) => l.sector === filterSector);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((l) =>
        [l.businessName, l.contactName, l.email, l.phone ?? ""].some((f) => f.toLowerCase().includes(q))
      );
    }
    return list;
  }, [leads, filterStatus, filterSector, query]);

  const stats = useMemo(() => ({
    total: leads.length,
    newThisWeek: leads.filter((l) => isThisWeek(l.createdAt)).length,
    pending: leads.filter((l) => ["new", "contacted"].includes(l.status)).length,
    converted: leads.filter((l) => l.status === "signed-up").length,
  }), [leads]);

  const sectorBreakdown = useMemo<SectorStat[]>(() => {
    const map = new Map<string, { total: number; converted: number }>();
    for (const lead of leads) {
      const sector = lead.sector;
      if (!sector) continue;
      if (!map.has(sector)) map.set(sector, { total: 0, converted: 0 });
      const entry = map.get(sector)!;
      entry.total++;
      if (lead.status === "signed-up") entry.converted++;
    }
    return Array.from(map.entries())
      .map(([sector, { total, converted }]) => ({
        sector,
        total,
        converted,
        conversionPct: total > 0 ? Math.round((converted / total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [leads]);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Leads Pipeline</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Register Interest submissions from the website — track and manage your sales pipeline.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Leads", value: stats.total, icon: Users, color: "bg-blue-50 text-blue-600" },
          { label: "New This Week", value: stats.newThisWeek, icon: Calendar, color: "bg-purple-50 text-purple-600" },
          { label: "Awaiting Contact", value: stats.pending, icon: Clock, color: "bg-yellow-50 text-yellow-600" },
          { label: "Converted", value: stats.converted, icon: CheckCircle, color: "bg-green-50 text-green-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-5 flex items-start gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">{label}</p>
              <p className="text-2xl font-bold text-foreground mt-0.5">{loading ? "—" : value}</p>
            </div>
          </div>
        ))}
      </div>

      <SectorBreakdown rows={sectorBreakdown} loading={loading} />

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search by name, business or email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 h-10 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={filterSector}
          onChange={(e) => setFilterSector(e.target.value)}
          className="h-10 px-3 pr-8 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All Sectors</option>
          {SECTORS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-10 px-3 pr-8 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-card border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Leaf className="w-10 h-10 mx-auto mb-3 opacity-25" />
          <p className="font-medium">No leads found</p>
          <p className="text-sm mt-1">
            {leads.length === 0
              ? "No Register Interest submissions yet."
              : "Try adjusting your search or filter."}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {filtered.map((lead, i) => (
            <div
              key={lead.id}
              onClick={() => setSelected(lead)}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                i < filtered.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary font-bold text-sm">
                  {lead.businessName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground">{lead.businessName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {lead.contactName} · {lead.email}
                </p>
              </div>
              {lead.sector ? (
                <span className="hidden lg:block shrink-0">
                  <SectorBadge sector={lead.sector} />
                </span>
              ) : null}
              {lead.source && (
                <span className="hidden lg:inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded shrink-0">
                  <Tag className="w-3 h-3" />
                  {lead.source}
                </span>
              )}
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                <TrendingUp className="w-3.5 h-3.5" />
                {lead.farmCount} farm{lead.farmCount !== 1 ? "s" : ""}
              </div>
              <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(lead.createdAt)}
              </div>
              <StatusBadge status={lead.status} />
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </div>
          ))}
        </div>
      )}

      {selected && (
        <LeadPanel
          lead={selected}
          onClose={() => setSelected(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

function SectorBreakdown({ rows, loading }: { rows: SectorStat[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 mb-8">
        <div className="h-4 w-40 bg-muted rounded animate-pulse mb-5" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-7 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Sector Breakdown</h2>
        </div>
        <p className="text-sm text-muted-foreground text-center py-6">
          No sector data yet — sectors are set when leads register on the website.
        </p>
      </div>
    );
  }

  const maxTotal = Math.max(...rows.map((r) => r.total), 1);

  return (
    <div className="bg-card border border-border rounded-xl p-6 mb-8">
      <div className="flex items-center gap-2 mb-5">
        <BarChart3 className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-foreground">Sector Breakdown</h2>
        <span className="ml-auto text-xs text-muted-foreground">
          {rows.reduce((s, r) => s + r.total, 0)} leads with sector set
        </span>
      </div>
      <div className="space-y-3">
        {rows.map((row) => {
          const widthPct = Math.round((row.total / maxTotal) * 100);
          const barColor = SECTOR_BAR_COLORS[row.sector] ?? "bg-gray-400";
          return (
            <div key={row.sector}>
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-2">
                  <SectorBadge sector={row.sector} />
                </div>
                <div className="flex items-center gap-3 text-muted-foreground shrink-0 ml-3">
                  <span>{row.total} lead{row.total !== 1 ? "s" : ""}</span>
                  {row.converted > 0 && (
                    <span className="inline-flex items-center gap-1 text-green-600 font-semibold">
                      <CheckCircle className="w-3 h-3" />
                      {row.converted} signed up ({row.conversionPct}%)
                    </span>
                  )}
                </div>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full ${barColor} transition-all`}
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type PackedFieldKey = typeof PACKED_FIELD_KEYS[number];

/** Reconstruct full notes by prepending packed system fields before user notes.
 * Sector is now a dedicated DB column so it is NOT re-packed here. */
function rebuildNotes(packed: PackedFields, userNotes: string): string | null {
  const parts: string[] = [];
  if (packed.farmType) parts.push(`Farm type: ${packed.farmType}`);
  if (packed.county) parts.push(`County: ${packed.county}`);
  if (packed.cphNumber) parts.push(`CPH number: ${packed.cphNumber}`);
  if (userNotes.trim()) parts.push(userNotes.trim());
  return parts.length > 0 ? parts.join("\n") : null;
}

interface PackedFields {
  sector: string | null;
  farmType: string | null;
  county: string | null;
  cphNumber: string | null;
}

/** Parse all packed system fields from the notes string. */
function parsePackedFields(notes: string | null | undefined): PackedFields {
  const result: PackedFields = { sector: null, farmType: null, county: null, cphNumber: null };
  if (!notes) return result;
  for (const line of notes.split("\n")) {
    const m = line.match(/^(Sector|Farm type|County|CPH number):\s*(.+)$/);
    if (!m) continue;
    const key = m[1] as PackedFieldKey;
    const val = m[2].trim();
    if (key === "Sector") result.sector = val;
    else if (key === "Farm type") result.farmType = val;
    else if (key === "County") result.county = val;
    else if (key === "CPH number") result.cphNumber = val;
  }
  return result;
}


/** Extract only the user-entered lines (non-system packed lines) from notes. */
function userNotesFromPacked(notes: string | null | undefined): string {
  if (!notes) return "";
  return notes
    .split("\n")
    .filter((line) => !PACKED_FIELD_KEYS.some((k) => line.startsWith(`${k}:`)))
    .join("\n")
    .trim();
}
