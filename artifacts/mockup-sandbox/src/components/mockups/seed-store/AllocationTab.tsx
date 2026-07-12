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
      { id: 1, fieldName: "North Field", bagsAllocated: 24, kgAllocated: 600, plantingDate: "2024-10-02" },
      { id: 2, fieldName: "South Paddock", bagsAllocated: 38, kgAllocated: 950, plantingDate: "2024-10-08" },
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
      { id: 3, fieldName: "Long Meadow", bagsAllocated: 80, kgAllocated: 200, plantingDate: "2024-08-28" },
      { id: 4, fieldName: "Far Acres", bagsAllocated: 80, kgAllocated: 200, plantingDate: "2024-08-29" },
    ],
  },
];

const MOCK_STOCKTAKES = [
  {
    id: 1,
    date: "2025-01-15",
    conductedBy: "James Watkins",
    batchesCounted: 3,
    variances: 1,
    notes: "Minor shortfall on OSR2024-002 — 2 bags unaccounted for. Likely split bags.",
    status: "variance",
  },
  {
    id: 2,
    date: "2024-10-30",
    conductedBy: "Sarah Ellis",
    batchesCounted: 2,
    variances: 0,
    notes: "All counts match system. No issues.",
    status: "ok",
  },
];

const MOCK_FIELDS = ["North Field", "South Paddock", "Long Meadow", "Far Acres", "Barn Close", "Top Field"];

function StockBar({ remaining, received }: { remaining: number; received: number }) {
  const usedPct = received > 0 ? Math.max(0, Math.round(((received - remaining) / received) * 100)) : 0;
  const remPct = 100 - usedPct;
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{(received - remaining).toLocaleString()} kg allocated</span>
        <span className={remaining === 0 ? "text-gray-400" : "text-green-600 font-medium"}>
          {remaining.toLocaleString()} kg remaining
        </span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden flex">
        <div className="h-full bg-green-500 transition-all" style={{ width: `${usedPct}%` }} />
        {remaining > 0 && <div className="h-full bg-emerald-100" style={{ width: `${remPct}%` }} />}
      </div>
    </div>
  );
}

type DialogMode = { type: "assign"; batchId: number } | { type: "edit"; batchId: number; alloc: typeof MOCK_BATCHES[0]["allocations"][0] } | { type: "stocktake" } | null;

export function AllocationTab() {
  const [activeTab, setActiveTab] = useState("allocation");
  const [cropFilter, setCropFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialog, setDialog] = useState<DialogMode>(null);

  // Dialog form state
  const [dlgField, setDlgField] = useState("");
  const [dlgBags, setDlgBags] = useState("");
  const [dlgDate, setDlgDate] = useState("");

  // Stocktake dialog form
  const [stBatch, setStBatch] = useState("");
  const [stField, setStField] = useState("");
  const [stSystem, setStSystem] = useState("");
  const [stActual, setStActual] = useState("");
  const [stNotes, setStNotes] = useState("");

  const crops = [...new Set(MOCK_BATCHES.map(b => b.cropName))];
  const filtered = MOCK_BATCHES.filter(b => {
    if (cropFilter !== "all" && b.cropName !== cropFilter) return false;
    if (statusFilter === "unallocated" && b.allocations.length > 0) return false;
    if (statusFilter === "instock" && (b.allocations.length === 0 || b.quantityRemainingKg === 0)) return false;
    if (statusFilter === "used" && b.quantityRemainingKg > 0) return false;
    return true;
  });

  const openAssign = (batchId: number) => {
    setDlgField(""); setDlgBags(""); setDlgDate("");
    setDialog({ type: "assign", batchId });
  };
  const openEdit = (batchId: number, alloc: typeof MOCK_BATCHES[0]["allocations"][0]) => {
    setDlgField(alloc.fieldName); setDlgBags(String(alloc.bagsAllocated)); setDlgDate(alloc.plantingDate);
    setDialog({ type: "edit", batchId, alloc });
  };
  const openStocktake = () => {
    setStBatch(""); setStField(""); setStSystem(""); setStActual(""); setStNotes("");
    setDialog({ type: "stocktake" });
  };

  const activeBatch = dialog && dialog.type !== "stocktake"
    ? MOCK_BATCHES.find(b => b.id === dialog.batchId)
    : null;
  const dlgBagWeight = activeBatch?.bagWeightKg ?? 25;
  const dlgKg = dlgBags ? (parseFloat(dlgBags) * dlgBagWeight).toFixed(0) : "—";

  const tabs = [
    { key: "stock", label: "Seed Stock" },
    { key: "allocation", label: "Field Allocation" },
    { key: "orders", label: "Seed Orders" },
    { key: "segregation", label: "Segregation Checks" },
    { key: "stocktake", label: "Stocktakes" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans relative">

      {/* ── Dialog backdrop ───────────────────────────────────────────────── */}
      {dialog && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4" onClick={() => setDialog(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md z-50" onClick={e => e.stopPropagation()}>

            {/* Assign / Edit allocation dialog */}
            {(dialog.type === "assign" || dialog.type === "edit") && activeBatch && (
              <>
                <div className="px-6 pt-5 pb-4 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-base font-bold text-gray-900">
                        {dialog.type === "assign" ? "Assign Batch to a Field" : "Edit Field Allocation"}
                      </h2>
                      <p className="text-sm text-gray-500 mt-0.5">
                        <span className="font-mono font-semibold text-gray-700">{activeBatch.batchNumber}</span>
                        {" "}·{" "}{activeBatch.cropName} · {activeBatch.varietyName}
                      </p>
                    </div>
                    <button onClick={() => setDialog(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none mt-0.5">×</button>
                  </div>
                  {/* Stock pill */}
                  <div className="mt-3 flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 rounded-full bg-green-50 text-green-700 font-semibold border border-green-200">
                      {activeBatch.quantityRemainingKg.toLocaleString()} kg remaining
                    </span>
                    <span className="text-gray-400">·</span>
                    <span className="text-gray-500">{activeBatch.bagWeightKg}kg bags</span>
                  </div>
                </div>

                <div className="px-6 py-5 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Field</label>
                    <select value={dlgField} onChange={e => setDlgField(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option value="">Select a field…</option>
                      {MOCK_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Bags Allocated</label>
                    <div className="flex items-center gap-3">
                      <input type="number" min="1" value={dlgBags} onChange={e => setDlgBags(e.target.value)}
                        placeholder="0"
                        className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                      <span className="text-sm text-gray-500">
                        = <span className="font-semibold text-gray-800">{dlgKg} kg</span>
                        {dlgBags && parseFloat(dlgBags) * dlgBagWeight > activeBatch.quantityRemainingKg && (
                          <span className="ml-2 text-red-600 font-medium">⚠ Exceeds remaining stock</span>
                        )}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Planned Planting Date</label>
                    <input type="date" value={dlgDate} onChange={e => setDlgDate(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                </div>

                <div className="px-6 pb-5 flex gap-2 justify-end border-t border-gray-100 pt-4">
                  <button onClick={() => setDialog(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Cancel
                  </button>
                  <button
                    disabled={!dlgField || !dlgBags}
                    className="px-4 py-2 rounded-lg bg-green-700 text-white text-sm font-medium hover:bg-green-800 disabled:opacity-40 disabled:cursor-not-allowed">
                    {dialog.type === "assign" ? "Save Allocation" : "Update Allocation"}
                  </button>
                </div>
              </>
            )}

            {/* Record stocktake dialog */}
            {dialog.type === "stocktake" && (
              <>
                <div className="px-6 pt-5 pb-4 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-base font-bold text-gray-900">Record Physical Stocktake</h2>
                      <p className="text-sm text-gray-500 mt-0.5">Log an actual bag count against the system figure</p>
                    </div>
                    <button onClick={() => setDialog(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none mt-0.5">×</button>
                  </div>
                </div>

                <div className="px-6 py-5 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Batch</label>
                    <select value={stBatch} onChange={e => setStBatch(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option value="">Select batch…</option>
                      {MOCK_BATCHES.map(b => (
                        <option key={b.id} value={b.batchNumber}>
                          {b.batchNumber} — {b.cropName} · {b.varietyName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Location / Field</label>
                    <select value={stField} onChange={e => setStField(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option value="">All locations (full batch count)</option>
                      {MOCK_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">System Qty (bags)</label>
                      <input type="number" value={stSystem} onChange={e => setStSystem(e.target.value)}
                        placeholder="Auto-filled"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Physical Count (bags)</label>
                      <input type="number" value={stActual} onChange={e => setStActual(e.target.value)}
                        placeholder="Enter actual"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                  </div>
                  {stSystem && stActual && stSystem !== stActual && (
                    <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border ${parseInt(stActual) < parseInt(stSystem) ? "bg-red-50 border-red-200 text-red-700" : "bg-amber-50 border-amber-200 text-amber-700"}`}>
                      <span>{parseInt(stActual) < parseInt(stSystem) ? "⚠" : "ℹ"}</span>
                      <span>Variance: <strong>{Math.abs(parseInt(stActual) - parseInt(stSystem))} bags</strong> {parseInt(stActual) < parseInt(stSystem) ? "short" : "over"}</span>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Notes</label>
                    <textarea value={stNotes} onChange={e => setStNotes(e.target.value)}
                      placeholder="Reason for variance, split bags, damaged stock, etc."
                      rows={2}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
                  </div>
                </div>

                <div className="px-6 pb-5 flex gap-2 justify-end border-t border-gray-100 pt-4">
                  <button onClick={() => setDialog(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Cancel
                  </button>
                  <button
                    disabled={!stBatch || !stActual}
                    className="px-4 py-2 rounded-lg bg-green-700 text-white text-sm font-medium hover:bg-green-800 disabled:opacity-40 disabled:cursor-not-allowed">
                    Save Stocktake Record
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {/* ── Main page ──────────────────────────────────────────────────────── */}
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

        {/* Tab bar — 5 tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-black/[0.07] rounded-xl w-fit mb-5 flex-wrap">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === t.key ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/[0.06]" : "text-gray-500 hover:text-gray-800 hover:bg-black/[0.05]"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── FIELD ALLOCATION TAB ─────────────────────────────────────────── */}
        {activeTab === "allocation" && (
          <>
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Crop</label>
                <select value={cropFilter} onChange={e => setCropFilter(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="all">All crops</option>
                  {crops.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Status</label>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500">
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
              <div className="ml-auto flex gap-2">
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
                  🖨 Print Stocktake Sheet
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {filtered.map(batch => {
                const allocated = batch.quantityReceivedKg - batch.quantityRemainingKg;
                return (
                  <div key={batch.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${batch.allocations.length === 0 ? "border-amber-200 ring-1 ring-amber-100" : "border-gray-200"}`}>
                    {/* Card header */}
                    <div className="px-5 pt-4 pb-3 border-b border-gray-100">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
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
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => openAssign(batch.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-green-300 text-green-700 bg-green-50 text-xs font-semibold hover:bg-green-100 transition-colors">
                            + Assign to Field
                          </button>
                          <div className="text-right">
                            <div className="text-xs text-gray-400">Received</div>
                            <div className="text-base font-bold text-gray-900">{batch.quantityReceivedKg.toLocaleString()} kg</div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <StockBar remaining={batch.quantityRemainingKg} received={batch.quantityReceivedKg} />
                      </div>
                    </div>

                    {/* Allocations body */}
                    <div className="px-5 py-3">
                      {batch.allocations.length === 0 ? (
                        <div className="flex items-center justify-between gap-3 text-sm text-amber-700 bg-amber-50 rounded-lg px-4 py-3 border border-amber-100">
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg shrink-0">⚠️</span>
                            <span>This batch hasn't been assigned to any fields yet.</span>
                          </div>
                          <button onClick={() => openAssign(batch.id)}
                            className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors">
                            Assign now
                          </button>
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
                                <th className="pb-1.5 w-8" />
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {batch.allocations.map(a => (
                                <tr key={a.id} className="hover:bg-gray-50/60 group">
                                  <td className="py-2 font-medium text-gray-800">{a.fieldName}</td>
                                  <td className="py-2 text-right text-gray-500">{a.bagsAllocated}</td>
                                  <td className="py-2 text-right text-gray-700">{a.kgAllocated.toLocaleString()} kg</td>
                                  <td className="py-2 text-right text-gray-500">{new Date(a.plantingDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</td>
                                  <td className="py-2 text-right">
                                    <button onClick={() => openEdit(batch.id, a)}
                                      className="opacity-0 group-hover:opacity-100 text-xs text-gray-400 hover:text-green-700 px-1.5 py-0.5 rounded transition-all">
                                      ✏
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="border-t border-gray-200 text-xs text-gray-500 font-semibold">
                                <td className="pt-2">{batch.allocations.length} field{batch.allocations.length !== 1 ? "s" : ""}</td>
                                <td className="pt-2 text-right">{batch.allocations.reduce((s, a) => s + a.bagsAllocated, 0)}</td>
                                <td className="pt-2 text-right text-gray-700">{allocated.toLocaleString()} kg</td>
                                <td /><td />
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

        {/* ── STOCKTAKES TAB ───────────────────────────────────────────────── */}
        {activeTab === "stocktake" && (
          <>
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-500">A log of physical bag counts and any variances recorded against the system.</p>
              <button onClick={openStocktake}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-700 text-white text-sm font-medium hover:bg-green-800 shadow-sm">
                + Record Stocktake
              </button>
            </div>

            <div className="space-y-3">
              {MOCK_STOCKTAKES.map(st => (
                <div key={st.id} className={`bg-white rounded-xl border shadow-sm px-5 py-4 flex items-start gap-4 ${st.status === "variance" ? "border-red-200 ring-1 ring-red-50" : "border-gray-200"}`}>
                  <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${st.status === "variance" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
                    {st.status === "variance" ? "⚠" : "✓"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-semibold text-gray-800">
                        {new Date(st.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                      {st.status === "variance" ? (
                        <span className="text-xs font-semibold px-2 py-0.5 bg-red-100 text-red-700 rounded-full border border-red-200">Variance found</span>
                      ) : (
                        <span className="text-xs font-semibold px-2 py-0.5 bg-green-100 text-green-700 rounded-full border border-green-200">All clear</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      Conducted by <span className="font-medium text-gray-700">{st.conductedBy}</span>
                      {" · "}{st.batchesCounted} batch{st.batchesCounted !== 1 ? "es" : ""} counted
                      {st.variances > 0 && <span className="text-red-600 font-medium"> · {st.variances} variance</span>}
                    </div>
                    {st.notes && <div className="mt-1.5 text-sm text-gray-600 italic">"{st.notes}"</div>}
                  </div>
                  <button className="shrink-0 text-xs text-gray-400 hover:text-gray-700 border border-gray-200 rounded-lg px-2.5 py-1 hover:bg-gray-50">
                    View
                  </button>
                </div>
              ))}

              {MOCK_STOCKTAKES.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                  <div className="text-4xl mb-3">📋</div>
                  <p className="font-medium">No stocktakes recorded yet</p>
                  <p className="text-sm mt-1">Click "Record Stocktake" to log your first physical count.</p>
                </div>
              )}
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
