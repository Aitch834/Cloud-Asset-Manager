import { useState } from "react";

const MOCK_BATCHES = [
  {
    id: 1,
    batchNumber: "WW2024-001",
    cropName: "Winter Wheat",
    varietyName: "KWS Zyatt",
    supplierName: "Frontier Agriculture",
    quantityReceivedKg: 2000,
    quantityRemainingKg: 450,
    dateReceived: "2024-09-14",
    bagWeightKg: 25,
    tgwGrams: 48.2,
    isActive: true,
    allocations: [
      { fieldName: "North Field", bagsAllocated: 24, kgAllocated: 600, plantingDate: "2024-10-02", hectares: 12.4 },
      { fieldName: "South Paddock", bagsAllocated: 38, kgAllocated: 950, plantingDate: "2024-10-08", hectares: 19.8 },
    ],
  },
  {
    id: 2,
    batchNumber: "SB2024-003",
    cropName: "Spring Barley",
    varietyName: "Laureate",
    supplierName: "Openfield",
    quantityReceivedKg: 1500,
    quantityRemainingKg: 1500,
    dateReceived: "2025-01-22",
    bagWeightKg: 25,
    tgwGrams: 52.1,
    isActive: true,
    allocations: [],
  },
  {
    id: 3,
    batchNumber: "OSR2024-002",
    cropName: "Oilseed Rape",
    varietyName: "Aurelia CL",
    supplierName: "Limagrain UK",
    quantityReceivedKg: 400,
    quantityRemainingKg: 0,
    dateReceived: "2024-08-05",
    bagWeightKg: 2.5,
    tgwGrams: 5.8,
    isActive: true,
    allocations: [
      { fieldName: "Long Meadow", bagsAllocated: 80, kgAllocated: 200, plantingDate: "2024-08-28", hectares: 20.1 },
      { fieldName: "Far Acres", bagsAllocated: 80, kgAllocated: 200, plantingDate: "2024-08-29", hectares: 20.0 },
    ],
  },
];

function pct(remaining: number, received: number) {
  return received > 0 ? Math.max(0, Math.round(((received - remaining) / received) * 100)) : 0;
}

function StatusBadge({ batch }: { batch: typeof MOCK_BATCHES[0] }) {
  if (batch.allocations.length === 0) {
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">⚠ Unallocated</span>;
  }
  if (batch.quantityRemainingKg === 0) {
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">✓ Fully Used</span>;
  }
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">● In Stock</span>;
}

export function InlineExpansion() {
  const [expanded, setExpanded] = useState<Set<number>>(new Set([1]));
  const [cropFilter, setCropFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const toggle = (id: number) => {
    setExpanded(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const filtered = MOCK_BATCHES.filter(b => {
    if (cropFilter !== "all" && b.cropName !== cropFilter) return false;
    if (statusFilter === "unallocated" && b.allocations.length > 0) return false;
    if (statusFilter === "instock" && (b.allocations.length === 0 || b.quantityRemainingKg === 0)) return false;
    if (statusFilter === "used" && b.quantityRemainingKg > 0) return false;
    return true;
  });

  const crops = [...new Set(MOCK_BATCHES.map(b => b.cropName))];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Seed Store</h1>
            <p className="text-sm text-gray-500 mt-0.5">Track seed batches, field allocations and stock levels</p>
          </div>
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
              🖨 Print Stocktake
            </button>
            <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-700 text-white text-sm font-medium hover:bg-green-800 shadow-sm">
              + Add Batch
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-1.5 p-1.5 bg-black/[0.07] rounded-xl w-fit mb-5">
          {["Seed Stock", "Seed Orders", "Segregation Checks"].map((t, i) => (
            <button key={t} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${i === 0 ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/[0.06]" : "text-gray-500 hover:text-gray-800 hover:bg-black/[0.05]"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Crop</label>
            <select value={cropFilter} onChange={e => setCropFilter(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="all">All crops</option>
              {crops.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Status</label>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="all">All</option>
              <option value="unallocated">Unallocated only</option>
              <option value="instock">In stock</option>
              <option value="used">Fully used</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Season</label>
            <select className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option>2024/25</option>
              <option>2023/24</option>
            </select>
          </div>
        </div>

        {/* Batch list */}
        <div className="space-y-3">
          {filtered.map(batch => {
            const used = batch.quantityReceivedKg - batch.quantityRemainingKg;
            const usedPct = pct(batch.quantityRemainingKg, batch.quantityReceivedKg);
            const isOpen = expanded.has(batch.id);

            return (
              <div key={batch.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${batch.allocations.length === 0 ? "border-amber-200 ring-1 ring-amber-100" : "border-gray-200"}`}>
                {/* Batch header row */}
                <div
                  className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggle(batch.id)}
                >
                  {/* Expand chevron */}
                  <span className={`text-gray-400 transition-transform text-sm ${isOpen ? "rotate-90" : ""}`}>▶</span>

                  {/* Batch info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-semibold text-gray-800">{batch.batchNumber}</span>
                      <StatusBadge batch={batch} />
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">{batch.cropName} · {batch.varietyName} · {batch.supplierName}</div>
                  </div>

                  {/* Stock summary */}
                  <div className="flex items-center gap-6 text-sm shrink-0">
                    <div className="text-right">
                      <div className="text-xs text-gray-400 uppercase tracking-wide">Received</div>
                      <div className="font-semibold text-gray-800">{batch.quantityReceivedKg.toLocaleString()} kg</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400 uppercase tracking-wide">Allocated</div>
                      <div className="font-semibold text-gray-700">{used.toLocaleString()} kg</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400 uppercase tracking-wide">Remaining</div>
                      <div className={`font-semibold ${batch.quantityRemainingKg === 0 ? "text-gray-400" : "text-green-700"}`}>{batch.quantityRemainingKg.toLocaleString()} kg</div>
                    </div>
                    {/* Progress bar */}
                    <div className="w-20">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${usedPct === 100 ? "bg-gray-400" : "bg-green-500"}`}
                          style={{ width: `${usedPct}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-400 text-right mt-0.5">{usedPct}% used</div>
                    </div>
                  </div>
                </div>

                {/* Expanded: field allocation breakdown */}
                {isOpen && (
                  <div className="border-t border-gray-100 bg-gray-50/60">
                    <div className="px-5 py-3">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Field Allocations</div>
                      {batch.allocations.length === 0 ? (
                        <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
                          <span className="text-lg">⚠️</span>
                          <span>This batch has not been assigned to any fields yet. Allocate it from the <strong>Fields</strong> section when creating a crop assignment.</span>
                        </div>
                      ) : (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-xs text-gray-400 uppercase tracking-wide">
                              <th className="text-left pb-2 font-medium">Field</th>
                              <th className="text-right pb-2 font-medium">Bags</th>
                              <th className="text-right pb-2 font-medium">Qty (kg)</th>
                              <th className="text-right pb-2 font-medium">Planted</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {batch.allocations.map(a => (
                              <tr key={a.fieldName} className="hover:bg-white/80">
                                <td className="py-2 font-medium text-gray-800">{a.fieldName}</td>
                                <td className="py-2 text-right text-gray-600">{a.bagsAllocated}</td>
                                <td className="py-2 text-right text-gray-700 font-medium">{a.kgAllocated.toLocaleString()} kg</td>
                                <td className="py-2 text-right text-gray-500">{new Date(a.plantingDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="border-t border-gray-200 text-xs text-gray-500">
                              <td className="pt-2 font-semibold">{batch.allocations.length} field{batch.allocations.length !== 1 ? "s" : ""}</td>
                              <td className="pt-2 text-right font-semibold text-gray-700">{batch.allocations.reduce((s, a) => s + a.bagsAllocated, 0)} bags</td>
                              <td className="pt-2 text-right font-semibold text-gray-700">{batch.allocations.reduce((s, a) => s + a.kgAllocated, 0).toLocaleString()} kg</td>
                              <td />
                            </tr>
                          </tfoot>
                        </table>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
