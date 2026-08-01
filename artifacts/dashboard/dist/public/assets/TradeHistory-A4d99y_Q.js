import { b as useAppStore, j as jsxRuntimeExports, r as reactExports, l as useQuery } from "./index-R4XICohc.js";
import { A as AppLayout, T as TrendingUp } from "./AppLayout-p836YkSR.js";
import { P as Popover, a as PopoverTrigger, b as PopoverContent } from "./popover-FCcRri9L.js";
import { S as ShoppingCart } from "./shopping-cart-BAi4fEs9.js";
import { P as Package } from "./use-safe-clerk-9Diu1NTz.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, T as Tooltip, L as Legend, B as Bar } from "./generateCategoricalChart-BfcAnxRo.js";
import { L as LineChart } from "./LineChart-yhjGPbwZ.js";
import { C as CartesianGrid } from "./CartesianGrid-D3V8O0hE.js";
import { L as Line } from "./Line-D4mk-w2o.js";
import { B as BarChart } from "./BarChart-C3EN7W8j.js";
import { A as ArrowUpDown } from "./arrow-up-down-D62UCWsf.js";
import "./trash-2-CW0p5gY-.js";
import "./database-Dj8SDLcA.js";
import "./shield-alert-DLMzHCQQ.js";
import "./triangle-alert-DoYQtXrW.js";
import "./shield-check-CjTpMlqB.js";
import "./tractor-DsJv_0QH.js";
import "./index-DYWzTIYo.js";
function fmtGbp(pence) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(pence / 100);
}
function fmtGbpFull(pence) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(pence / 100);
}
function monthKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function monthLabel(key) {
  const [y, m] = key.split("-");
  return new Date(parseInt(y), parseInt(m) - 1, 1).toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
}
function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function currentCropYear() {
  const now = /* @__PURE__ */ new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  return m >= 8 ? `${y}/${String(y + 1).slice(-2)}` : `${y - 1}/${String(y).slice(-2)}`;
}
function cropYearOptions() {
  const cur = currentCropYear();
  const [startY] = cur.split("/").map(Number);
  return [
    { label: `${cur} (Current)`, value: cur, from: `${startY}-08-01`, to: `${startY + 1}-07-31` },
    { label: `${startY - 1}/${String(startY).slice(-2)}`, value: `${startY - 1}/${String(startY).slice(-2)}`, from: `${startY - 1}-08-01`, to: `${startY}-07-31` },
    { label: `${startY - 2}/${String(startY - 1).slice(-2)}`, value: `${startY - 2}/${String(startY - 1).slice(-2)}`, from: `${startY - 2}-08-01`, to: `${startY - 1}-07-31` }
  ];
}
const CHART_COLORS = ["#166534", "#1d4ed8", "#92400e", "#7c3aed", "#059669", "#b45309", "#0891b2", "#be185d"];
const SALE_TYPE_COLORS = {
  grain: "#166534",
  livestock: "#f59e0b",
  dairy: "#3b82f6",
  direct: "#ec4899",
  pig: "#92400e",
  egg: "#fbbf24",
  poultry: "#8b5cf6"
};
function SummaryCard({ label, value, sub, icon: Icon, color }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "16px 20px", display: "flex", gap: 14, alignItems: "center" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: `${color}15`, borderRadius: 8, padding: 10, flexShrink: 0 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 20, color }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.75rem", color: "#6b7280", fontWeight: 500, marginBottom: 2 }, children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "1.25rem", fontWeight: 700, color: "#111827" }, children: value }),
      sub && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.75rem", color: "#6b7280", marginTop: 2 }, children: sub })
    ] })
  ] });
}
function ChartCard({ title, children, height = 260 }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "18px 20px" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: 600, fontSize: "0.875rem", color: "#374151", marginBottom: 14 }, children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height }, children })
  ] });
}
function EmptyChart({ message }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8, color: "#9ca3af" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { size: 32 }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.875rem" }, children: message })
  ] });
}
const tableHeader = { padding: "8px 12px", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" };
const tableCell = { padding: "8px 12px", fontSize: "0.8125rem", color: "#374151", borderBottom: "1px solid #f3f4f6", whiteSpace: "nowrap" };
function PurchasesView({ farmId, from, to }) {
  const { data, isLoading } = useQuery({
    queryKey: ["purchase-history", farmId, from, to],
    queryFn: () => fetch(`/api/farms/${farmId}/purchase-history?from=${from}&to=${to}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const { cards, priceTrendData, productNames, supplierSpendData, records } = reactExports.useMemo(() => {
    const recs = data?.records ?? [];
    const totalSpend = recs.reduce((s, r) => s + (r.costPence ?? 0), 0);
    const deliveryCount = recs.length;
    const priceRecs = recs.filter((r) => r.costPence > 0 && parseFloat(r.quantity) > 0);
    const productSpend = {};
    for (const r of priceRecs) {
      const key = r.stockItemName ?? "Unknown";
      productSpend[key] = (productSpend[key] ?? 0) + r.costPence;
    }
    const topProducts = Object.entries(productSpend).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k]) => k);
    const monthProductPrices = {};
    for (const r of priceRecs) {
      const key = r.stockItemName ?? "Unknown";
      if (!topProducts.includes(key)) continue;
      const mk = monthKey(r.deliveryDate);
      monthProductPrices[mk] = monthProductPrices[mk] ?? {};
      monthProductPrices[mk][key] = monthProductPrices[mk][key] ?? { totalCost: 0, totalQty: 0 };
      monthProductPrices[mk][key].totalCost += r.costPence;
      monthProductPrices[mk][key].totalQty += parseFloat(r.quantity);
    }
    const sortedMonths = Object.keys(monthProductPrices).sort();
    const priceTrendData2 = sortedMonths.map((mk) => {
      const row = { month: monthLabel(mk) };
      for (const prod of topProducts) {
        const entry = monthProductPrices[mk]?.[prod];
        if (entry && entry.totalQty > 0) {
          row[prod] = parseFloat((entry.totalCost / entry.totalQty / 100).toFixed(2));
        }
      }
      return row;
    });
    const supplierSpend = {};
    for (const r of recs) {
      const key = r.supplierName ?? "Unknown";
      supplierSpend[key] = (supplierSpend[key] ?? 0) + (r.costPence ?? 0);
    }
    const supplierSpendData2 = Object.entries(supplierSpend).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, spend]) => ({ name: name.length > 22 ? name.slice(0, 20) + "…" : name, spend: parseFloat((spend / 100).toFixed(2)) }));
    const cards2 = { totalSpend, deliveryCount, productCount: topProducts.length };
    return { cards: cards2, priceTrendData: priceTrendData2, productNames: topProducts, supplierSpendData: supplierSpendData2, records: recs };
  }, [data]);
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { padding: 32, textAlign: "center", color: "#6b7280" }, children: "Loading purchase history…" });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 16 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { label: "Total Spend", value: fmtGbp(cards.totalSpend), sub: `${cards.deliveryCount} deliveries`, icon: ShoppingCart, color: "#166534" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { label: "Products Received", value: String(cards.productCount), sub: "unique items", icon: Package, color: "#1d4ed8" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { label: "Avg Cost / Delivery", value: cards.deliveryCount > 0 ? fmtGbp(Math.round(cards.totalSpend / cards.deliveryCount)) : "—", sub: "across all products", icon: TrendingUp, color: "#7c3aed" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChartCard, { title: "Price per Unit over Time — Top 4 Products (£/unit)", height: 240, children: priceTrendData.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyChart, { message: "No costed deliveries in this period" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(LineChart, { data: priceTrendData, margin: { top: 4, right: 8, bottom: 4, left: 0 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f3f4f6" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "month", tick: { fontSize: 11 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 11 }, tickFormatter: (v) => `£${v}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v, name) => [`£${v}`, name] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { wrapperStyle: { fontSize: 11 } }),
        productNames.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { type: "monotone", dataKey: p, stroke: CHART_COLORS[i % CHART_COLORS.length], strokeWidth: 2, dot: { r: 3 }, connectNulls: true }, p))
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChartCard, { title: "Total Spend by Supplier (£)", height: 240, children: supplierSpendData.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyChart, { message: "No supplier spend in this period" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: supplierSpendData, layout: "vertical", margin: { top: 4, right: 16, bottom: 4, left: 0 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f3f4f6", horizontal: false }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", tick: { fontSize: 11 }, tickFormatter: (v) => `£${v.toLocaleString()}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { dataKey: "name", type: "category", tick: { fontSize: 11 }, width: 120 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`£${Number(v).toLocaleString("en-GB", { minimumFractionDigits: 2 })}`, "Spend"] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "spend", fill: "#166534", radius: [0, 3, 3, 0] })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "14px 16px", borderBottom: "1px solid #e5e7eb", fontWeight: 600, fontSize: "0.875rem", color: "#374151" }, children: [
        "Purchase Records (",
        records.length,
        ")"
      ] }),
      records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { padding: 24, textAlign: "center", color: "#9ca3af", fontSize: "0.875rem" }, children: "No deliveries recorded in this period." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { overflowX: "auto", maxHeight: 360, overflowY: "auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { style: { position: "sticky", top: 0, zIndex: 1 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: tableHeader, children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: tableHeader, children: "Product" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: tableHeader, children: "Supplier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { ...tableHeader, textAlign: "right" }, children: "Qty" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { ...tableHeader, textAlign: "right" }, children: "Total Cost" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { ...tableHeader, textAlign: "right" }, children: "Unit Price" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: tableHeader, children: "Invoice / Batch" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: records.map((r) => {
          const unitPrice = r.costPence > 0 && parseFloat(r.quantity) > 0 ? (r.costPence / parseFloat(r.quantity) / 100).toFixed(2) : null;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: tableCell, children: fmtDate(r.deliveryDate) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: tableCell, children: r.stockItemName ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: tableCell, children: r.supplierName ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { ...tableCell, textAlign: "right" }, children: [
              parseFloat(r.quantity).toLocaleString("en-GB"),
              " ",
              r.stockItemUnit ?? ""
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...tableCell, textAlign: "right" }, children: r.costPence ? fmtGbpFull(r.costPence) : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...tableCell, textAlign: "right" }, children: unitPrice ? `£${unitPrice}` : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: tableCell, children: [r.invoiceReference, r.batchNumber].filter(Boolean).join(" / ") || "—" })
          ] }, r.id);
        }) })
      ] }) })
    ] })
  ] });
}
function SalesView({ farmId, from, to }) {
  const { data, isLoading } = useQuery({
    queryKey: ["sales-history", farmId, from, to],
    queryFn: () => fetch(`/api/farms/${farmId}/sales-history?from=${from}&to=${to}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const { cards, revenueChartData, grainPriceData, grainCommodities, allRows } = reactExports.useMemo(() => {
    if (!data) return { cards: { grain: 0, livestock: 0, dairy: 0, direct: 0, total: 0 }, revenueChartData: [], grainPriceData: [], grainCommodities: [], allRows: [] };
    const grainTotal = data.grain.reduce((s, r) => s + (r.netValuePence ?? 0), 0);
    const livestockTotal = [
      ...data.deadweight.map((r) => r.netPaymentPence ?? 0),
      ...data.mart.map((r) => r.netPaymentPence ?? 0)
    ].reduce((s, v) => s + v, 0);
    const dairyTotal = data.milk.reduce((s, r) => s + (r.netPaymentPence ?? 0), 0);
    const directTotal = data.direct.reduce((s, r) => s + (r.netValuePence ?? 0), 0);
    const pigTotal = data.pigKill.reduce((s, r) => s + (r.netPaymentPence ?? 0), 0);
    const eggTotal = data.egg.reduce((s, r) => s + (r.netValuePence ?? 0), 0);
    const poultryTotal = data.poultry.reduce((s, r) => s + (r.netPaymentPence ?? 0), 0);
    const allRows2 = [
      ...data.grain.map((r) => ({ date: r.date, type: "grain", desc: `${r.commodity}${r.variety ? ` (${r.variety})` : ""}`, buyer: r.buyer, netPence: r.netValuePence ?? 0, detail: r.tonnage ? `${r.tonnage}t @ ${r.pricePerTonnePence ? "£" + (r.pricePerTonnePence / 100).toFixed(2) + "/t" : "—"}` : "" })),
      ...data.deadweight.map((r) => ({ date: r.date, type: "livestock", desc: `${r.species} deadweight`, buyer: r.processor, netPence: r.netPaymentPence ?? 0, detail: `${r.headCount} hd${r.gradeClassification ? `, ${r.gradeClassification}` : ""}` })),
      ...data.mart.map((r) => ({ date: r.date, type: "livestock", desc: `${r.species} mart sale`, buyer: r.martName, netPence: r.netPaymentPence ?? 0, detail: `${r.headCount} hd` })),
      ...data.milk.map((r) => ({ date: `${r.statementMonth}-01`, type: "dairy", desc: "Milk statement", buyer: r.buyer, netPence: r.netPaymentPence ?? 0, detail: r.litresSupplied ? `${parseFloat(r.litresSupplied).toLocaleString("en-GB")}L @ ${r.pencePerLitre}ppl` : "" })),
      ...data.direct.map((r) => ({ date: r.date, type: "direct", desc: r.productName, buyer: r.customerName ?? r.channel, netPence: r.netValuePence ?? r.grossValuePence ?? 0, detail: `${r.quantity} ${r.unit} @ £${(r.unitPricePence / 100).toFixed(2)}` })),
      ...data.pigKill.map((r) => ({ date: r.date, type: "pig", desc: `Pig kill`, buyer: r.processor, netPence: r.netPaymentPence ?? 0, detail: `${r.headCount} hd${r.gradeOut ? `, ${r.gradeOut}` : ""}` })),
      ...data.egg.map((r) => ({ date: r.date, type: "egg", desc: `Egg sales (${r.eggType})`, buyer: r.packingStation ?? r.salesChannel, netPence: r.netValuePence ?? 0, detail: r.dozensDelivered ? `${r.dozensDelivered} dzn` : "" })),
      ...data.poultry.map((r) => ({ date: r.date, type: "poultry", desc: `${r.species} settlement`, buyer: r.integratorName, netPence: r.netPaymentPence ?? 0, detail: r.birdsDelivered ? `${r.birdsDelivered} birds` : "" }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const monthBuckets = {};
    const types = ["grain", "livestock", "dairy", "direct", "pig", "egg", "poultry"];
    for (const row of allRows2) {
      if (!row.date) continue;
      const mk = monthKey(row.date);
      monthBuckets[mk] = monthBuckets[mk] ?? {};
      monthBuckets[mk][row.type] = (monthBuckets[mk][row.type] ?? 0) + row.netPence;
    }
    const revenueChartData2 = Object.keys(monthBuckets).sort().map((mk) => {
      const row = { month: monthLabel(mk) };
      for (const t of types) row[t] = parseFloat(((monthBuckets[mk][t] ?? 0) / 100).toFixed(2));
      return row;
    });
    const grainCommodityMonthPrices = {};
    for (const g of data.grain) {
      if (!g.pricePerTonnePence || !g.date) continue;
      const commodity = g.commodity;
      const mk = monthKey(g.date);
      grainCommodityMonthPrices[commodity] = grainCommodityMonthPrices[commodity] ?? {};
      grainCommodityMonthPrices[commodity][mk] = grainCommodityMonthPrices[commodity][mk] ?? { total: 0, count: 0 };
      grainCommodityMonthPrices[commodity][mk].total += g.pricePerTonnePence;
      grainCommodityMonthPrices[commodity][mk].count += 1;
    }
    const grainCommodities2 = Object.keys(grainCommodityMonthPrices);
    const allMonths = [...new Set(grainCommodities2.flatMap((c) => Object.keys(grainCommodityMonthPrices[c])))].sort();
    const grainPriceData2 = allMonths.map((mk) => {
      const row = { month: monthLabel(mk) };
      for (const c of grainCommodities2) {
        const e = grainCommodityMonthPrices[c][mk];
        if (e) row[c] = parseFloat((e.total / e.count / 100).toFixed(2));
      }
      return row;
    });
    types.filter((t) => revenueChartData2.some((r) => (r[t] ?? 0) > 0));
    return {
      cards: { grain: grainTotal, livestock: livestockTotal, dairy: dairyTotal, direct: directTotal, total: grainTotal + livestockTotal + dairyTotal + directTotal + pigTotal + eggTotal + poultryTotal },
      revenueChartData: revenueChartData2,
      grainPriceData: grainPriceData2,
      grainCommodities: grainCommodities2,
      allRows: allRows2
    };
  }, [data]);
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { padding: 32, textAlign: "center", color: "#6b7280" }, children: "Loading sales history…" });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 16 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { label: "Total Revenue", value: fmtGbp(cards.total), sub: "all sales channels", icon: TrendingUp, color: "#166534" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { label: "Grain & Crops", value: fmtGbp(cards.grain), icon: Package, color: "#92400e" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { label: "Livestock", value: fmtGbp(cards.livestock), icon: ArrowUpDown, color: "#f59e0b" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { label: "Dairy & Direct", value: fmtGbp(cards.dairy + cards.direct), icon: ShoppingCart, color: "#3b82f6" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: grainPriceData.length > 0 ? "1fr 1fr" : "1fr", gap: 16 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChartCard, { title: "Monthly Revenue by Category (£)", height: 240, children: revenueChartData.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyChart, { message: "No sales in this period" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: revenueChartData, margin: { top: 4, right: 8, bottom: 4, left: 0 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f3f4f6" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "month", tick: { fontSize: 11 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 11 }, tickFormatter: (v) => `£${(v / 1e3).toFixed(0)}k` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v, name) => [`£${Number(v).toLocaleString("en-GB", { minimumFractionDigits: 2 })}`, name.charAt(0).toUpperCase() + name.slice(1)] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { wrapperStyle: { fontSize: 11 } }),
        ["grain", "livestock", "dairy", "direct", "pig", "egg", "poultry"].map(
          (type) => revenueChartData.some((r) => (r[type] ?? 0) > 0) ? /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: type, stackId: "rev", fill: SALE_TYPE_COLORS[type], name: type.charAt(0).toUpperCase() + type.slice(1) }, type) : null
        )
      ] }) }) }),
      grainPriceData.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(ChartCard, { title: "Grain Price Achieved (£/tonne)", height: 240, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(LineChart, { data: grainPriceData, margin: { top: 4, right: 8, bottom: 4, left: 0 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f3f4f6" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "month", tick: { fontSize: 11 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 11 }, tickFormatter: (v) => `£${v}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v, name) => [`£${v}/t`, name] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { wrapperStyle: { fontSize: 11 } }),
        grainCommodities.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { type: "monotone", dataKey: c, stroke: CHART_COLORS[i % CHART_COLORS.length], strokeWidth: 2, dot: { r: 3 }, connectNulls: true }, c))
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "14px 16px", borderBottom: "1px solid #e5e7eb", fontWeight: 600, fontSize: "0.875rem", color: "#374151" }, children: [
        "Sales Records (",
        allRows.length,
        ")"
      ] }),
      allRows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { padding: 24, textAlign: "center", color: "#9ca3af", fontSize: "0.875rem" }, children: "No sales recorded in this period." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { overflowX: "auto", maxHeight: 360, overflowY: "auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { style: { position: "sticky", top: 0, zIndex: 1 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: tableHeader, children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: tableHeader, children: "Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: tableHeader, children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: tableHeader, children: "Buyer / Processor" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: tableHeader, children: "Detail" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { ...tableHeader, textAlign: "right" }, children: "Net Payment" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: allRows.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: tableCell, children: fmtDate(r.date) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: tableCell, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { background: `${SALE_TYPE_COLORS[r.type]}20`, color: SALE_TYPE_COLORS[r.type], padding: "2px 8px", borderRadius: 12, fontSize: "0.75rem", fontWeight: 600 }, children: r.type.charAt(0).toUpperCase() + r.type.slice(1) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: tableCell, children: r.desc }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: tableCell, children: r.buyer ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...tableCell, color: "#6b7280" }, children: r.detail || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...tableCell, textAlign: "right", fontWeight: 600, color: "#166534" }, children: r.netPence ? fmtGbpFull(r.netPence) : "—" })
        ] }, i)) })
      ] }) })
    ] })
  ] });
}
function SupplierPerformanceView({ farmId, from, to }) {
  const { data, isLoading } = useQuery({
    queryKey: ["purchase-history", farmId, from, to],
    queryFn: () => fetch(`/api/farms/${farmId}/purchase-history?from=${from}&to=${to}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const supplierStats = reactExports.useMemo(() => {
    const recs = data?.records ?? [];
    const stats = {};
    for (const r of recs) {
      const key = r.supplierName ?? "Unknown";
      if (!stats[key]) stats[key] = { name: key, products: /* @__PURE__ */ new Set(), deliveries: 0, totalSpend: 0, unitPrices: [], firstDate: r.deliveryDate, lastDate: r.deliveryDate };
      const s = stats[key];
      s.deliveries += 1;
      s.totalSpend += r.costPence ?? 0;
      if (r.stockItemName) s.products.add(r.stockItemName);
      if (r.costPence > 0 && parseFloat(r.quantity) > 0) {
        s.unitPrices.push({ product: r.stockItemName ?? "?", price: r.costPence / parseFloat(r.quantity) / 100 });
      }
      const dateStr = r.deliveryDate;
      if (new Date(dateStr) < new Date(s.firstDate)) s.firstDate = dateStr;
      if (new Date(dateStr) > new Date(s.lastDate)) s.lastDate = dateStr;
    }
    return Object.values(stats).sort((a, b) => b.totalSpend - a.totalSpend);
  }, [data]);
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { padding: 32, textAlign: "center", color: "#6b7280" }, children: "Loading supplier data…" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexDirection: "column", gap: 16 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "14px 16px", borderBottom: "1px solid #e5e7eb", fontWeight: 600, fontSize: "0.875rem", color: "#374151" }, children: [
      "Supplier Performance (",
      supplierStats.length,
      " suppliers)"
    ] }),
    supplierStats.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { padding: 24, textAlign: "center", color: "#9ca3af", fontSize: "0.875rem" }, children: "No purchase records in this period." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { overflowX: "auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: tableHeader, children: "Supplier" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: tableHeader, children: "Products Supplied" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { ...tableHeader, textAlign: "right" }, children: "Deliveries" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { ...tableHeader, textAlign: "right" }, children: "Total Spend" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { ...tableHeader, textAlign: "right" }, children: "Avg Unit Price" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { ...tableHeader, textAlign: "right" }, children: "Price Range" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: tableHeader, children: "First Delivery" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: tableHeader, children: "Last Delivery" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: supplierStats.map((s) => {
        const prices = s.unitPrices.map((p) => p.price);
        const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : null;
        const minPrice = prices.length > 0 ? Math.min(...prices) : null;
        const maxPrice = prices.length > 0 ? Math.max(...prices) : null;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...tableCell, fontWeight: 600 }, children: s.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: tableCell, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexWrap: "wrap", gap: 4 }, children: [
            [...s.products].slice(0, 4).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { background: "#f3f4f6", borderRadius: 4, padding: "1px 6px", fontSize: "0.75rem", color: "#374151" }, children: p }, p)),
            s.products.size > 4 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { style: { fontSize: "0.75rem", color: "#2563eb", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0 }, children: [
                "+",
                s.products.size - 4,
                " more"
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(PopoverContent, { side: "top", align: "start", className: "w-56 p-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.65rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }, children: [
                  "All products — ",
                  s.name
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 4 }, children: [...s.products].map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { background: "#f3f4f6", borderRadius: 4, padding: "1px 6px", fontSize: "0.75rem", color: "#374151" }, children: p }, p)) })
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...tableCell, textAlign: "right" }, children: s.deliveries }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...tableCell, textAlign: "right", fontWeight: 600 }, children: fmtGbpFull(s.totalSpend) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...tableCell, textAlign: "right" }, children: avgPrice !== null ? `£${avgPrice.toFixed(2)}` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...tableCell, textAlign: "right", color: "#6b7280" }, children: minPrice !== null && maxPrice !== null ? `£${minPrice.toFixed(2)} – £${maxPrice.toFixed(2)}` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: tableCell, children: fmtDate(s.firstDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: tableCell, children: fmtDate(s.lastDate) })
        ] }, s.name);
      }) })
    ] }) })
  ] }) });
}
function TradeHistoryTab({ farmId }) {
  const options = cropYearOptions();
  const [selectedPeriod, setSelectedPeriod] = reactExports.useState(options[0].value);
  const [customFrom, setCustomFrom] = reactExports.useState("");
  const [customTo, setCustomTo] = reactExports.useState("");
  const [subTab, setSubTab] = reactExports.useState("purchases");
  const isCustom = selectedPeriod === "custom";
  const periodOption = options.find((o) => o.value === selectedPeriod);
  const from = isCustom ? customFrom : periodOption?.from ?? "";
  const to = isCustom ? customTo : periodOption?.to ?? "";
  const subTabStyle = (active) => ({
    padding: "6px 14px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    fontSize: "0.8125rem",
    fontWeight: active ? 600 : 400,
    background: active ? "#166534" : "transparent",
    color: active ? "#fff" : "#6b7280",
    transition: "background 0.15s, color 0.15s"
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 16 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "14px 16px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.8125rem", fontWeight: 600, color: "#374151", marginRight: 4 }, children: "Period:" }),
      options.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSelectedPeriod(o.value), style: {
        padding: "5px 12px",
        borderRadius: 6,
        border: "1px solid",
        borderColor: selectedPeriod === o.value ? "#166534" : "#d1d5db",
        background: selectedPeriod === o.value ? "#166534" : "#fff",
        color: selectedPeriod === o.value ? "#fff" : "#374151",
        fontSize: "0.8125rem",
        fontWeight: selectedPeriod === o.value ? 600 : 400,
        cursor: "pointer"
      }, children: o.label }, o.value)),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSelectedPeriod("custom"), style: {
        padding: "5px 12px",
        borderRadius: 6,
        border: "1px solid",
        borderColor: selectedPeriod === "custom" ? "#166534" : "#d1d5db",
        background: selectedPeriod === "custom" ? "#166534" : "#fff",
        color: selectedPeriod === "custom" ? "#fff" : "#374151",
        fontSize: "0.8125rem",
        cursor: "pointer"
      }, children: "Custom" }),
      isCustom && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", value: customFrom, onChange: (e) => setCustomFrom(e.target.value), style: { border: "1px solid #d1d5db", borderRadius: 6, padding: "4px 8px", fontSize: "0.8125rem" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.8125rem", color: "#6b7280" }, children: "to" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", value: customTo, onChange: (e) => setCustomTo(e.target.value), style: { border: "1px solid #d1d5db", borderRadius: 6, padding: "4px 8px", fontSize: "0.8125rem" } })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px", display: "flex", gap: 4, alignItems: "center" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { size: 16, color: "#6b7280", style: { marginRight: 6 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { style: subTabStyle(subTab === "purchases"), onClick: () => setSubTab("purchases"), children: "Purchases" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { style: subTabStyle(subTab === "sales"), onClick: () => setSubTab("sales"), children: "Sales" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { style: subTabStyle(subTab === "suppliers"), onClick: () => setSubTab("suppliers"), children: "Supplier Performance" })
    ] }),
    !from || !to ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 32, textAlign: "center", color: "#9ca3af", fontSize: "0.875rem" }, children: "Select a period above to view trade history." }) : subTab === "purchases" ? /* @__PURE__ */ jsxRuntimeExports.jsx(PurchasesView, { farmId, from, to }) : subTab === "sales" ? /* @__PURE__ */ jsxRuntimeExports.jsx(SalesView, { farmId, from, to }) : /* @__PURE__ */ jsxRuntimeExports.jsx(SupplierPerformanceView, { farmId, from, to })
  ] });
}
function TradeHistoryPage() {
  const { farmId } = useAppStore();
  if (!farmId) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Trade History", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TradeHistoryTab, { farmId }) });
}
export {
  TradeHistoryTab,
  TradeHistoryPage as default
};
