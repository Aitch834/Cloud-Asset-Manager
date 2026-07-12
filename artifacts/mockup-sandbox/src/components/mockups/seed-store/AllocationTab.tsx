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
    bagWeightKg: 25,
    dateReceived: "2024-09-14",
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
    bagWeightKg: 25,
    dateReceived: "2025-01-22",
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
    bagWeightKg: 2.5,
    dateReceived: "2024-08-05",
    allocations: [
      { fieldName: "Long Meadow", bagsAllocated: 80, kgAllocated: 200, plantingDate: "2024-08-28", hectares: 20.1 },
      { fieldName: "Far Acres", bagsAllocated: 80, kgAllocated: 200, plantingDate: "2024-08-29", hectares: 20.0 },
    ],
  },
];

function StockBar({ remaining, received }: { remaining: number; received: number }) {
  const usedPct = received > 0 ? Math.max(0, Math.round(((received - remaining) / received) * 100)) : 0;
  const remPct = 100 - usedPct;
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{(received - remaining).toLocaleString()} kg allocated</span>
        <span className={remaining === 0 ? "text-gray-400" : "text-green-600 font-medium"}>{remaining.toLocaleString()} kg remaining</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden flex">
        <div className="h-full bg-green-500 rounded-l-full transition-all" style={{ width: `${usedPct}%` }} />
        {remaining > 0 && <div className="h-full bg-emerald-100 rounded-r-full" style={{ width: `${remPct}%` }} />}
      </div>
    </div>
  );
}

export function AllocationTab() {
  const [activeTab, setActiveTab] = useState("allocation");
  const [cropFilter, setCropFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [printPreview, setPrintPreview] = useState(false);

  const crops = [...new Set(MOCK_BATCHES.map(b => b.cropName))];

  const filtered = MOCK_BATCHES.filter(b => {
    if (cropFilter !== "all" && b.cropName !== cropFilter) return false;
    if (statusFilter === "unallocated" && b.allocations.length > 0) return false;
    if (statusFilter === "instock" && (b.allocations.length === 0 || b.quantityRemainingKg === 0)) return false;
    if (statusFilter === "used" && b.quantityRemainingKg > 0) return false;
    return true;
  });

  if (printPreview) {
    return (
      <div className="min-h-screen bg-white font-sans p-8 print:p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-start justify-between mb-6 border-b pb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Seed Store — Stocktake Sheet</h1>
              <p className="text-sm text-gray-500 mt-0.5">Green Valley Farm · Season 2024/25</p>
              <p className="text-xs text-gray-400 mt-1">Printed: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
            <button onClick={() => setPrintPreview(false)} className="text-sm text-gray-500 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50">
              ← Back
            </button>
          </div>

          {MOCK_BATCHES.map(batch => (
            <div key={batch.id} className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono font-bold text-gray-800">{batch.batchNumber}</span>
                <span className="text-gray-600">{batch.cropName} · {batch.varietyName}</span>
                {batch.allocations.length === 0 && (
                  <span className="text-xs font-semibold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full border border-amber-200">Unallocated</span>
                )}
              </div>
              <div className="text-xs text-gray-500 mb-3">Supplier: {batch.supplierName} · Received: {new Date(batch.dateReceived).toLocaleDateString("en-GB")} · Bag: {batch.bagWeightKg}kg</div>

              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr className="text-xs text-gray-500 uppercase tracking-wide">
                    <th className="text-left px-3 py-2 font-medium border-b border-gray-200">Field / Description</th>
                    <th className="text-right px-3 py-2 font-medium border-b border-gray-200">Bags</th>
                    <th className="text-right px-3 py-2 font-medium border-b border-gray-200">System (kg)</th>
                    <th className="text-right px-3 py-2 font-medium border-b border-gray-200 w-28">Physical count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {batch.allocations.map(a => (
                    <tr key={a.fieldName}>
                      <td className="px-3 py-2.5 font-medium text-gray-800">{a.fieldName}</td>
                      <td className="px-3 py-2.5 text-right text-gray-600">{a.bagsAllocated}</td>
                      <td className="px-3 py-2.5 text-right text-gray-700">{a.kgAllocated.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-right">
                        <div className="border-b border-gray-400 border-dashed h-5 w-24 ml-auto" />
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-semibold text-sm">
                    <td className="px-3 py-2.5 text-gray-700">Unallocated / in store</td>
                    <td className="px-3 py-2.5 text-right text-gray-600">{Math.round(batch.quantityRemainingKg / batch.bagWeightKg)}</td>
                    <td className="px-3 py-2.5 text-right text-green-700">{batch.quantityRemainingKg.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="border-b border-gray-400 border-dashed h-5 w-24 ml-auto" />
                    </td>
                  </tr>
                  <tr className="bg-gray-100 font-bold text-sm">
                    <td className="px-3 py-2.5 text-gray-900">Total received</td>
                    <td className="px-3 py-2.5 text-right text-gray-800">{Math.round(batch.quantityReceivedKg / batch.bagWeightKg)}</td>
                    <td className="px-3 py-2.5 text-right text-gray-900">{batch.quantityReceivedKg.toLocaleString()}</td>
                    <td />
                  </tr>
                </tbody>
              </table>
              <div className="mt-1.5 text-xs text-gray-400 italic">Notes / discrepancies: _______________________________________________</div>
            </div>
          ))}

          <div className="mt-8 border-t pt-4 text-xs text-gray-400 flex justify-between">
            <span>Counted by: ________________________</span>
            <span>Date: ________________________</span>
            <span>Signature: ________________________</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Seed Store</h1>
            <p className="text-sm text-gray-500 mt-0.5">Track seed batches, field allocations and stock levels</p>
          </div>
          <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-700 text-white text-sm font-medium hover:bg-green-800 shadow-sm">
            + Add Batch
          </button>
        </div>

        {/* Tab bar — 4 tabs including Field Allocation */}
        <div className="flex items-center gap-1.5 p-1.5 bg-black/[0.07] rounded-xl w-fit mb-5 flex-wrap">
          {[
            { key: "stock", label: "Seed Stock" },
            { key: "allocation", label: "Field Allocation" },
            { key: "orders", label: "Seed Orders" },
            { key: "segregation", label: "Segregation Checks" },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === t.key ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/[0.06]" : "text-gray-500 hover:text-gray-800 hover:bg-black/[0.05]"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === "allocation" && (
          <>
            {/* Filters + print button */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
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
              <div className="ml-auto">
                <button onClick={() => setPrintPreview(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
                  🖨 Print Stocktake Sheet
                </button>
              </div>
            </div>

            {/* Allocation cards */}
            <div className="space-y-4">
              {filtered.map(batch => {
                const allocated = batch.quantityReceivedKg - batch.quantityRemainingKg;

                return (
                  <div key={batch.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${batch.allocations.length === 0 ? "border-amber-200 ring-1 ring-amber-100" : "border-gray-200"}`}>
                    {/* Card header */}
                    <div className="px-5 pt-4 pb-3 border-b border-gray-100">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-sm font-bold text-gray-800">{batch.batchNumber}</span>
                            {batch.allocations.length === 0 ? (
                              <span className="text-xs font-semibold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full border border-amber-200">⚠ Unallocated</span>
                            ) : batch.quantityRemainingKg === 0 ? (
                              <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full border border-gray-200">✓ Fully Used</span>
                            ) : (
                              <span className="text-xs font-semibold px-2 py-0.5 bg-green-100 text-green-700 rounded-full border border-green-200">● In Stock</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 mt-0.5">{batch.cropName} · {batch.varietyName} · {batch.supplierName}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs text-gray-400">Total received</div>
                          <div className="text-lg font-bold text-gray-900">{batch.quantityReceivedKg.toLocaleString()} kg</div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <StockBar remaining={batch.quantityRemainingKg} received={batch.quantityReceivedKg} />
                      </div>
                    </div>

                    {/* Allocations body */}
                    <div className="px-5 py-3">
                      {batch.allocations.length === 0 ? (
                        <div className="flex items-center gap-2.5 text-sm text-amber-600 bg-amber-50 rounded-lg px-4 py-3 border border-amber-100">
                          <span className="text-lg shrink-0">⚠️</span>
                          <span>No fields have been assigned from this batch yet. Go to <strong>Fields → Field Crop Assignments</strong> and select this batch when drilling a crop.</span>
                        </div>
                      ) : (
                        <>
                          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Field breakdown</div>
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                                <th className="text-left pb-1.5 font-medium">Field</th>
                                <th className="text-right pb-1.5 font-medium">Bags</th>
                                <th className="text-right pb-1.5 font-medium">Allocated (kg)</th>
                                <th className="text-right pb-1.5 font-medium">Planted</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {batch.allocations.map(a => (
                                <tr key={a.fieldName} className="hover:bg-gray-50/60">
                                  <td className="py-2 font-medium text-gray-800">{a.fieldName}</td>
                                  <td className="py-2 text-right text-gray-500">{a.bagsAllocated}</td>
                                  <td className="py-2 text-right text-gray-700">{a.kgAllocated.toLocaleString()} kg</td>
                                  <td className="py-2 text-right text-gray-500">{new Date(a.plantingDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="border-t border-gray-200 text-xs text-gray-500 font-semibold">
                                <td className="pt-2">{batch.allocations.length} field{batch.allocations.length !== 1 ? "s" : ""}</td>
                                <td className="pt-2 text-right">{batch.allocations.reduce((s, a) => s + a.bagsAllocated, 0)}</td>
                                <td className="pt-2 text-right text-gray-700">{allocated.toLocaleString()} kg</td>
                                <td />
                              </tr>
                            </tfoot>
                          </table>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeTab === "stock" && (
          <div className="text-center text-gray-400 py-20">
            <div className="text-4xl mb-3">📦</div>
            <p className="font-medium text-gray-600">Seed Stock tab</p>
            <p className="text-sm mt-1">Batch list with add / edit / delete</p>
          </div>
        )}
        {activeTab === "orders" && (
          <div className="text-center text-gray-400 py-20">
            <div className="text-4xl mb-3">🛒</div>
            <p className="font-medium text-gray-600">Seed Orders tab</p>
          </div>
        )}
        {activeTab === "segregation" && (
          <div className="text-center text-gray-400 py-20">
            <div className="text-4xl mb-3">🔍</div>
            <p className="font-medium text-gray-600">Segregation Checks tab</p>
          </div>
        )}
      </div>
    </div>
  );
}
