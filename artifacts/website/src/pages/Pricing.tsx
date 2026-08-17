import { Layout } from "@/components/layout/Layout";
import { useState, useMemo, useRef } from "react";
import { Info, Plus, X, Pencil, PoundSterling, CalendarCheck, ToggleRight, FlaskConical, Check, Gift, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BASE_FEE, MODULES, BUNDLE_INCLUSIONS, modulePrice } from "@/lib/pricing-data";
// ── Sector filter ──────────────────────────────────────────────────────────────
// Maps each sector pill label to the module IDs relevant to that sector.
// red-tractor-compliance is always shown regardless of the active filter.
const SECTORS = ["All", "Arable", "Livestock", "Viticulture", "Organic", "Fresh Produce", "Diversification"] as const;
type Sector = typeof SECTORS[number];

const SECTOR_MODULES: Partial<Record<Sector, string[]>> = {
  Arable: [
    "field-crop-management", "crop-trials", "sprays-inputs", "soil-management",
    "grain-crop-storage", "organic-arable", "weather-tracking", "water-irrigation",
    "environment-sustainability", "equipment-workshop", "staff-training",
    "safety-risk-audits", "finance-business", "resource-planner", "biosecurity",
    "platform-addons", "report-builder", "data-api", "biofuel-rtfo",
  ],
  Livestock: [
    "livestock-management", "biosecurity", "sheep-production", "goat-production",
    "beef-production", "pig-production", "poultry-production", "venison-production",
    "organic-livestock", "organic-dairy", "organic-venison", "organic-poultry",
    "staff-training", "equipment-workshop", "finance-business", "safety-risk-audits",
    "environment-sustainability", "water-irrigation", "platform-addons",
    "report-builder", "data-api",
  ],
  Viticulture: [
    "viticulture", "organic-viticulture", "sprays-inputs", "equipment-workshop",
    "staff-training", "safety-risk-audits", "finance-business", "platform-addons",
    "weather-tracking", "soil-management", "water-irrigation", "report-builder",
    "data-api", "organic-compliance",
  ],
  Organic: [
    "organic-compliance", "organic-arable", "organic-livestock", "organic-dairy",
    "organic-fresh-produce", "organic-viticulture", "organic-venison", "organic-poultry",
  ],
  "Fresh Produce": [
    "fresh-produce", "organic-fresh-produce", "sprays-inputs", "staff-training",
    "safety-risk-audits", "equipment-workshop", "finance-business", "water-irrigation",
    "environment-sustainability", "platform-addons", "report-builder", "data-api",
    "biosecurity",
  ],
  Diversification: [
    "farm-diversification", "farm-services-contracting", "equipment-workshop",
    "finance-business", "staff-training", "safety-risk-audits", "platform-addons",
    "report-builder", "data-api",
  ],
};

// Returns a Map of bundledModuleId → name of the parent module providing it.
// If two parents bundle the same module, the first one wins (e.g. both viticulture and organic-viticulture bundle sprays-inputs).
function getBundledModules(selectedModules: string[]): Map<string, string> {
  const result = new Map<string, string>();
  for (const modId of selectedModules) {
    const inclusions = BUNDLE_INCLUSIONS[modId];
    if (!inclusions) continue;
    const parentName = MODULES.find(m => m.id === modId)?.name ?? modId;
    for (const bid of inclusions) {
      if (!result.has(bid)) result.set(bid, parentName);
    }
  }
  return result;
}

interface Farm {
  id: number;
  name: string;
  selectedModules: string[];
}

function createFarm(id: number): Farm {
  return {
    id,
    name: `Farm ${id}`,
    selectedModules: ["red-tractor-compliance"],
  };
}

function getFarmDisplayName(farm: Farm): string {
  return farm.name.trim() || `Farm ${farm.id}`;
}

// Half-price discount when a holding subscribes to both Viticulture and Organic Viticulture
// (e.g. producing both certified-organic and conventional wines from the same estate).
function getDualVitDiscount(farm: Farm): number {
  const hasVit = farm.selectedModules.includes("viticulture");
  const hasOrgVit = farm.selectedModules.includes("organic-viticulture");
  return hasVit && hasOrgVit ? 22.5 : 0;
}

// Cost excludes any module that is provided for free via a bundle from another selected module,
// and applies the dual-viticulture discount where eligible.
function getFarmCost(farm: Farm): number {
  const bundled = getBundledModules(farm.selectedModules);
  const moduleCost = BASE_FEE + MODULES
    .filter(m => farm.selectedModules.includes(m.id) && !bundled.has(m.id))
    .reduce((acc, m) => acc + m.price, 0);
  return moduleCost - getDualVitDiscount(farm);
}

// Sum of the retail prices of all bundled-in modules (those included free, not separately charged),
// plus the dual-viticulture discount where eligible.
function getFarmBundleSaving(farm: Farm): number {
  const bundled = getBundledModules(farm.selectedModules);
  // Count savings for bundled modules whether or not separately selected — they aren't charged either way.
  const bundleSaving = MODULES
    .filter(m => bundled.has(m.id))
    .reduce((acc, m) => acc + m.price, 0);
  return bundleSaving + getDualVitDiscount(farm);
}

export default function Pricing() {
  const [farms, setFarms] = useState<Farm[]>([
    { id: 1, name: "Farm 1", selectedModules: ["red-tractor-compliance", "field-crop-management", "equipment-workshop"] },
  ]);
  const [activeFarmId, setActiveFarmId] = useState(1);
  const [editingNameId, setEditingNameId] = useState<number | null>(null);
  const [sectorFilter, setSectorFilter] = useState<Sector>(() => {
    const param = new URLSearchParams(window.location.search).get("sector") as Sector | null;
    return param && (SECTORS as readonly string[]).includes(param) ? param : "All";
  });
  const [linkCopied, setLinkCopied] = useState(false);
  const nextFarmIdRef = useRef(2);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  const handleSectorChange = (sector: Sector) => {
    setSectorFilter(sector);
    const url = new URL(window.location.href);
    if (sector === "All") {
      url.searchParams.delete("sector");
    } else {
      url.searchParams.set("sector", sector);
    }
    history.replaceState(null, "", url.toString());
  };

  const activeFarm = farms.find(f => f.id === activeFarmId) || farms[0];
  const activeBundled = useMemo(() => getBundledModules(activeFarm.selectedModules), [activeFarm.selectedModules]);

  // Modules visible in the grid given the active sector filter.
  // red-tractor-compliance is always shown; bundled modules are always shown (as green cards).
  const visibleModules = useMemo(() => {
    if (sectorFilter === "All") return MODULES;
    const allowed = new Set(SECTOR_MODULES[sectorFilter] ?? []);
    return MODULES.filter(m => m.required || allowed.has(m.id) || activeBundled.has(m.id));
  }, [sectorFilter, activeBundled]);

  // Count of modules each sector pill would show (including bundled modules for the active farm).
  const sectorModuleCount = useMemo(() => {
    const counts: Partial<Record<Sector, number>> = {};
    counts["All"] = MODULES.length;
    for (const sector of SECTORS.filter(s => s !== "All")) {
      const allowed = new Set(SECTOR_MODULES[sector] ?? []);
      counts[sector] = MODULES.filter(m => m.required || allowed.has(m.id) || activeBundled.has(m.id)).length;
    }
    return counts;
  }, [activeBundled]);

  const toggleModule = (moduleId: string, required?: boolean) => {
    if (required) return;
    // Don't allow toggling a module that is currently bundled (it's included for free; it doesn't need selecting)
    if (activeBundled.has(moduleId)) return;
    setFarms(prev => prev.map(f => {
      if (f.id !== activeFarmId) return f;
      const has = f.selectedModules.includes(moduleId);
      return {
        ...f,
        selectedModules: has
          ? f.selectedModules.filter(m => m !== moduleId)
          : [...f.selectedModules, moduleId],
      };
    }));
  };

  const addFarm = () => {
    const id = nextFarmIdRef.current++;
    const newFarm = createFarm(id);
    setFarms(prev => [...prev, newFarm]);
    setActiveFarmId(id);
  };

  const removeFarm = (farmId: number) => {
    if (farms.length <= 1) return;
    const updated = farms.filter(f => f.id !== farmId);
    if (activeFarmId === farmId) {
      setActiveFarmId(updated[0].id);
    }
    setFarms(updated);
  };

  const renameFarm = (farmId: number, name: string) => {
    setFarms(prev => prev.map(f => f.id === farmId ? { ...f, name } : f));
  };

  const totalMonthly = useMemo(() => farms.reduce((acc, f) => acc + getFarmCost(f), 0), [farms]);
  const totalBundleSaving = useMemo(() => farms.reduce((acc, f) => acc + getFarmBundleSaving(f), 0), [farms]);

  return (
    <Layout>
      <div className="bg-brand-forest text-white py-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">Transparent, Module-Based Pricing</h1>
          <p className="text-brand-pale/80 text-lg max-w-2xl mx-auto">
            Pay a low base platform fee plus only the specific modules you need for each farm.
          </p>
        </div>
      </div>

      {/* Small Farm Reassurance Strip */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 mb-12 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-border/60 p-6 md:p-8">
          <p className="text-center text-sm font-semibold text-brand-forest uppercase tracking-wider mb-6">Whether you farm 40 acres or 4,000 — this is built for you</p>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/40 gap-0">
            <div className="flex flex-col items-center text-center px-6 py-4 gap-3">
              <div className="w-11 h-11 bg-brand-pale rounded-xl flex items-center justify-center">
                <PoundSterling className="w-5 h-5 text-brand-forest" />
              </div>
              <div>
                <p className="font-bold text-foreground">Start from £{BASE_FEE + modulePrice("red-tractor-compliance")}/month</p>
                <p className="text-sm text-muted-foreground mt-0.5">Base platform + Red Tractor Compliance. Under £{Math.ceil((BASE_FEE + modulePrice("red-tractor-compliance")) * 12 / 100) * 100} a year for a fully compliant farm.</p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center px-6 py-4 gap-3">
              <div className="w-11 h-11 bg-brand-pale rounded-xl flex items-center justify-center">
                <CalendarCheck className="w-5 h-5 text-brand-forest" />
              </div>
              <div>
                <p className="font-bold text-foreground">Month to month, no contracts</p>
                <p className="text-sm text-muted-foreground mt-0.5">No annual commitments and nothing to pay upfront. Cancel any time with no questions asked.</p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center px-6 py-4 gap-3">
              <div className="w-11 h-11 bg-brand-pale rounded-xl flex items-center justify-center">
                <ToggleRight className="w-5 h-5 text-brand-forest" />
              </div>
              <div>
                <p className="font-bold text-foreground">Only pay for what you need</p>
                <p className="text-sm text-muted-foreground mt-0.5">Pick exactly the modules your farm uses today. Add or remove them as your needs change.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="bg-white rounded-3xl shadow-2xl border border-border p-6 md:p-10 flex flex-col lg:flex-row gap-12">
          
          <div className="flex-1 space-y-8">
            <div>
              <h3 className="text-xl font-bold mb-4">1. Your Farms</h3>
              <div className="flex flex-wrap items-center gap-2">
                {farms.map(farm => (
                  <div
                    key={farm.id}
                    className={`group relative flex items-center gap-1.5 px-4 py-2 rounded-full border-2 cursor-pointer transition-all text-sm font-medium ${
                      activeFarmId === farm.id
                        ? "border-brand-forest bg-brand-forest text-white"
                        : "border-border bg-white text-foreground hover:border-brand-light"
                    }`}
                    onClick={() => setActiveFarmId(farm.id)}
                  >
                    {editingNameId === farm.id ? (
                      <input
                        autoFocus
                        className="bg-transparent border-none outline-none w-24 text-sm font-medium"
                        value={farm.name}
                        onChange={e => renameFarm(farm.id, e.target.value)}
                        onBlur={() => setEditingNameId(null)}
                        onKeyDown={e => { if (e.key === "Enter") setEditingNameId(null); }}
                        onClick={e => e.stopPropagation()}
                      />
                    ) : (
                      <>
                        <span>{getFarmDisplayName(farm)}</span>
                        <button
                          className={`sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-white/20 ${
                            activeFarmId === farm.id ? "text-white/80" : "text-muted-foreground"
                          }`}
                          onClick={e => { e.stopPropagation(); setEditingNameId(farm.id); }}
                          title="Rename farm"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      </>
                    )}
                    <button
                      className={`sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-0.5 rounded ${
                        farms.length <= 1
                          ? "!opacity-30 cursor-not-allowed"
                          : `hover:bg-white/20 ${activeFarmId === farm.id ? "text-white/80" : "text-muted-foreground"}`
                      }`}
                      disabled={farms.length <= 1}
                      onClick={e => { e.stopPropagation(); removeFarm(farm.id); }}
                      title="Remove farm"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addFarm}
                  className="flex items-center gap-1 px-4 py-2 rounded-full border-2 border-dashed border-brand-light text-brand-forest text-sm font-medium hover:bg-brand-pale/30 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Farm
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-1">2. Select Modules</h3>

              {/* Sector filter pills */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {SECTORS.map(sector => {
                  const count = sectorModuleCount[sector] ?? 0;
                  const isActive = sectorFilter === sector;
                  return (
                    <button
                      key={sector}
                      onClick={() => handleSectorChange(sector)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border transition-all ${
                        isActive
                          ? "bg-brand-forest text-white border-brand-forest"
                          : "bg-white text-muted-foreground border-border hover:border-brand-light hover:text-foreground"
                      }`}
                    >
                      {sector}
                      <span className={`text-xs font-normal tabular-nums ${
                        isActive ? "text-white/70" : "text-muted-foreground/60"
                      }`}>{count}</span>
                    </button>
                  );
                })}
                <button
                  onClick={handleCopyLink}
                  title="Copy link to this view"
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border transition-all ${
                    linkCopied
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                      : "bg-white text-muted-foreground border-border hover:border-brand-light hover:text-foreground"
                  }`}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  {linkCopied ? "Copied!" : "Copy link"}
                </button>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                Configuring modules for <span className="font-semibold text-brand-forest">{getFarmDisplayName(activeFarm)}</span>
                {activeBundled.size > 0 && (
                  <span className="ml-2 inline-flex items-center gap-1 text-emerald-700 font-medium">
                    <Gift className="w-3.5 h-3.5" />
                    {activeBundled.size} module{activeBundled.size !== 1 ? "s" : ""} included free via bundle
                  </span>
                )}
                {sectorFilter !== "All" && (
                  <span className="ml-2 text-muted-foreground">
                    · Showing {visibleModules.length} of {MODULES.length} modules
                  </span>
                )}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visibleModules.map(mod => {
                  const isSelected = activeFarm.selectedModules.includes(mod.id);
                  const bundledBy = activeBundled.get(mod.id);
                  const isBundled = !!bundledBy;

                  if (isBundled) {
                    // Module is included for free via a bundle — show as green "included" card
                    return (
                      <div
                        key={mod.id}
                        className="relative p-4 rounded-xl border-2 border-emerald-400 bg-emerald-50 cursor-default"
                        title={`Included with ${bundledBy}`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-semibold text-emerald-900">{mod.name}</span>
                          <span className="flex items-center gap-1 text-emerald-600 font-semibold text-sm whitespace-nowrap flex-shrink-0">
                            <Check className="w-3.5 h-3.5" />
                            Included
                          </span>
                        </div>
                        <p className="text-xs text-emerald-700 mt-1">
                          Bundled with <span className="font-medium">{bundledBy}</span> — <span className="line-through opacity-60">£{mod.price}/mo</span> free
                        </p>
                        {"note" in mod && mod.note && (
                          <p className="text-xs text-emerald-800/60 mt-1 line-clamp-2">{mod.note}</p>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={mod.id}
                      onClick={() => toggleModule(mod.id, mod.required)}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? "border-brand-forest bg-brand-pale/50"
                          : "border-border hover:border-brand-light"
                      } ${mod.required ? "opacity-80 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-foreground">{mod.name}</span>
                        <span className="text-muted-foreground font-mono ml-2 flex-shrink-0">£{mod.price}/mo</span>
                      </div>
                      {"note" in mod && mod.note && (
                        <p className="text-xs text-muted-foreground mt-1">{mod.note}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Estimated Cost box ─────────────────────────────────────── */}
          <div className="w-full lg:w-96 bg-earth-cream rounded-2xl p-8 sticky top-24 h-fit border border-earth-tan/20">
            <h3 className="text-lg font-bold text-earth-brown mb-6">Estimated Cost</h3>
            
            <div className="space-y-5 mb-6 pb-6 border-b border-earth-tan/30">
              {farms.map(farm => {
                const bundled = getBundledModules(farm.selectedModules);
                const bundleSaving = getFarmBundleSaving(farm);
                const farmCost = getFarmCost(farm);
                const dualVitDiscount = getDualVitDiscount(farm);

                // Charged modules = selected and NOT bundled
                const chargedModules = MODULES.filter(m => farm.selectedModules.includes(m.id) && !bundled.has(m.id));
                // Bundled modules = provided free via bundle (whether or not separately selected)
                const bundledModules = MODULES.filter(m => bundled.has(m.id));

                return (
                  <div key={farm.id}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-sm text-earth-brown">{getFarmDisplayName(farm)}</span>
                      <span className="font-bold text-base">£{farmCost}<span className="text-xs font-normal text-muted-foreground">/mo</span></span>
                    </div>
                    <div className="space-y-1 pl-3 border-l-2 border-earth-tan/20">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Platform Base Fee</span>
                        <span>£{BASE_FEE}</span>
                      </div>
                      {chargedModules.map(mod => (
                        <div key={mod.id} className="flex justify-between text-xs text-muted-foreground">
                          <span>{mod.name}</span>
                          <span>£{mod.price}</span>
                        </div>
                      ))}
                      {bundledModules.length > 0 && (
                        <>
                          <div className="pt-1 pb-0.5">
                            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                              <Gift className="w-3 h-3" />
                              Bundle inclusions
                            </div>
                          </div>
                          {bundledModules.map(mod => (
                            <div key={mod.id} className="flex justify-between text-xs text-emerald-700">
                              <span>{mod.name}</span>
                              <span className="font-medium">Included</span>
                            </div>
                          ))}
                          <div className="flex justify-between text-xs font-semibold text-emerald-700 pt-0.5 border-t border-emerald-200/60 mt-1">
                            <span>Bundle saving</span>
                            <span>−£{bundleSaving - dualVitDiscount}/mo</span>
                          </div>
                        </>
                      )}
                      {dualVitDiscount > 0 && (
                        <div className="flex justify-between text-xs font-semibold text-violet-700 pt-1 border-t border-violet-200/60 mt-1">
                          <span>Dual Viticulture discount (50% off one module)</span>
                          <span>−£{dualVitDiscount}/mo</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {totalBundleSaving > 0 && (
              <div className="mb-4 flex items-center justify-between rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2">
                <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5" />
                  Total bundle saving
                </span>
                <span className="text-sm font-bold text-emerald-700">−£{totalBundleSaving}/mo</span>
              </div>
            )}

            <div className="flex justify-between items-end mb-8 text-brand-forest">
              <span className="font-bold text-lg">Total ({farms.length} {farms.length === 1 ? "farm" : "farms"})</span>
              <span className="text-4xl font-extrabold tracking-tight">£{totalMonthly}<span className="text-base font-normal opacity-80">/mo</span></span>
            </div>

            <Button className="w-full h-14 text-base bg-brand-forest hover:bg-brand-sage shadow-lg" asChild>
              <Link href={(() => {
                const params = new URLSearchParams();
                if (sectorFilter !== "All") params.set("sector", sectorFilter);
                // Deduplicated union of every farm's module selections so no
                // selections are lost when the prospect has configured multiple farms.
                const allModules = [...new Set(farms.flatMap(f => f.selectedModules))];
                params.set("modules", allModules.join(","));
                // Pass the farm count so the Register Interest form can pre-fill it.
                params.set("farms", String(farms.length));
                return `/contact?${params.toString()}`;
              })()}>Start Custom Setup</Link>
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-4 flex items-center justify-center gap-1">
              <Info className="w-3 h-3" /> All prices exclude VAT.
            </p>
          </div>
        </div>
      </div>

      {/* Sandbox callout */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-14 h-14 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
            <FlaskConical className="w-7 h-7 text-amber-600" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="font-bold text-foreground text-lg mb-1">Sandbox Test Environment — included at no extra cost</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every subscription includes a full sandbox copy of your account. Enter records, explore every module, and train new staff with zero risk of affecting your live data or submitting to any government or third-party system.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
