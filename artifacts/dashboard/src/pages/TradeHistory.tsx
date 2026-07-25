import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/hooks/use-app-store";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { TrendingUp, ShoppingCart, ArrowUpDown, Package, Users } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtGbp(pence: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(pence / 100);
}

function fmtGbpFull(pence: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(pence / 100);
}

function monthKey(date: Date | string): string {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string): string {
  const [y, m] = key.split("-");
  return new Date(parseInt(y), parseInt(m) - 1, 1).toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
}

function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function currentCropYear(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  return m >= 8 ? `${y}/${String(y + 1).slice(-2)}` : `${y - 1}/${String(y).slice(-2)}`;
}

type CropYearOption = { label: string; value: string; from: string; to: string };
function cropYearOptions(): CropYearOption[] {
  const cur = currentCropYear();
  const [startY] = cur.split("/").map(Number);
  return [
    { label: `${cur} (Current)`, value: cur, from: `${startY}-08-01`, to: `${startY + 1}-07-31` },
    { label: `${startY - 1}/${String(startY).slice(-2)}`, value: `${startY - 1}/${String(startY).slice(-2)}`, from: `${startY - 1}-08-01`, to: `${startY}-07-31` },
    { label: `${startY - 2}/${String(startY - 1).slice(-2)}`, value: `${startY - 2}/${String(startY - 1).slice(-2)}`, from: `${startY - 2}-08-01`, to: `${startY - 1}-07-31` },
  ];
}

const CHART_COLORS = ["#166534", "#1d4ed8", "#92400e", "#7c3aed", "#059669", "#b45309", "#0891b2", "#be185d"];
const SALE_TYPE_COLORS: Record<string, string> = {
  grain: "#166534", livestock: "#f59e0b", dairy: "#3b82f6",
  direct: "#ec4899", pig: "#92400e", egg: "#fbbf24", poultry: "#8b5cf6",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SummaryCard({ label, value, sub, icon: Icon, color }: { label: string; value: string; sub?: string; icon: any; color: string }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "16px 20px", display: "flex", gap: 14, alignItems: "center" }}>
      <div style={{ background: `${color}15`, borderRadius: 8, padding: 10, flexShrink: 0 }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 500, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#111827" }}>{value}</div>
        {sub && <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

function ChartCard({ title, children, height = 260 }: { title: string; children: React.ReactNode; height?: number }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "18px 20px" }}>
      <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#374151", marginBottom: 14 }}>{title}</div>
      <div style={{ height }}>{children}</div>
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8, color: "#9ca3af" }}>
      <TrendingUp size={32} />
      <div style={{ fontSize: "0.875rem" }}>{message}</div>
    </div>
  );
}

const tableHeader: React.CSSProperties = { padding: "8px 12px", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" };
const tableCell: React.CSSProperties = { padding: "8px 12px", fontSize: "0.8125rem", color: "#374151", borderBottom: "1px solid #f3f4f6", whiteSpace: "nowrap" };

// ─── Purchases Sub-view ───────────────────────────────────────────────────────

function PurchasesView({ farmId, from, to }: { farmId: number; from: string; to: string }) {
  const { data, isLoading } = useQuery<{ records: any[] }>({
    queryKey: ["purchase-history", farmId, from, to],
    queryFn: () => fetch(`/api/farms/${farmId}/purchase-history?from=${from}&to=${to}`).then(r => r.json()),
    enabled: !!farmId,
  });

  const { cards, priceTrendData, productNames, supplierSpendData, records } = useMemo(() => {
    const recs = data?.records ?? [];
    const totalSpend = recs.reduce((s, r) => s + (r.costPence ?? 0), 0);
    const deliveryCount = recs.length;
    const priceRecs = recs.filter(r => r.costPence > 0 && parseFloat(r.quantity) > 0);

    // Top products by spend
    const productSpend: Record<string, number> = {};
    for (const r of priceRecs) {
      const key = r.stockItemName ?? "Unknown";
      productSpend[key] = (productSpend[key] ?? 0) + r.costPence;
    }
    const topProducts = Object.entries(productSpend).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k]) => k);

    // Price trend: per month, per product (£/unit)
    const monthProductPrices: Record<string, Record<string, { totalCost: number; totalQty: number }>> = {};
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
    const priceTrendData = sortedMonths.map(mk => {
      const row: Record<string, any> = { month: monthLabel(mk) };
      for (const prod of topProducts) {
        const entry = monthProductPrices[mk]?.[prod];
        if (entry && entry.totalQty > 0) {
          row[prod] = parseFloat((entry.totalCost / entry.totalQty / 100).toFixed(2));
        }
      }
      return row;
    });

    // Supplier spend
    const supplierSpend: Record<string, number> = {};
    for (const r of recs) {
      const key = r.supplierName ?? "Unknown";
      supplierSpend[key] = (supplierSpend[key] ?? 0) + (r.costPence ?? 0);
    }
    const supplierSpendData = Object.entries(supplierSpend)
      .sort((a, b) => b[1] - a[1]).slice(0, 8)
      .map(([name, spend]) => ({ name: name.length > 22 ? name.slice(0, 20) + "…" : name, spend: parseFloat((spend / 100).toFixed(2)) }));

    const cards = { totalSpend, deliveryCount, productCount: topProducts.length };
    return { cards, priceTrendData, productNames: topProducts, supplierSpendData, records: recs };
  }, [data]);

  if (isLoading) return <div style={{ padding: 32, textAlign: "center", color: "#6b7280" }}>Loading purchase history…</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <SummaryCard label="Total Spend" value={fmtGbp(cards.totalSpend)} sub={`${cards.deliveryCount} deliveries`} icon={ShoppingCart} color="#166534" />
        <SummaryCard label="Products Received" value={String(cards.productCount)} sub="unique items" icon={Package} color="#1d4ed8" />
        <SummaryCard label="Avg Cost / Delivery" value={cards.deliveryCount > 0 ? fmtGbp(Math.round(cards.totalSpend / cards.deliveryCount)) : "—"} sub="across all products" icon={TrendingUp} color="#7c3aed" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <ChartCard title="Price per Unit over Time — Top 4 Products (£/unit)" height={240}>
          {priceTrendData.length === 0 ? <EmptyChart message="No costed deliveries in this period" /> : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceTrendData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `£${v}`} />
                <Tooltip formatter={(v: any, name: string) => [`£${v}`, name]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {productNames.map((p, i) => (
                  <Line key={p} type="monotone" dataKey={p} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Total Spend by Supplier (£)" height={240}>
          {supplierSpendData.length === 0 ? <EmptyChart message="No supplier spend in this period" /> : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supplierSpendData} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `£${v.toLocaleString()}`} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={120} />
                <Tooltip formatter={(v: any) => [`£${Number(v).toLocaleString("en-GB", { minimumFractionDigits: 2 })}`, "Spend"]} />
                <Bar dataKey="spend" fill="#166534" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #e5e7eb", fontWeight: 600, fontSize: "0.875rem", color: "#374151" }}>
          Purchase Records ({records.length})
        </div>
        {records.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "#9ca3af", fontSize: "0.875rem" }}>No deliveries recorded in this period.</div>
        ) : (
          <div style={{ overflowX: "auto", maxHeight: 360, overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                <tr>
                  <th style={tableHeader}>Date</th>
                  <th style={tableHeader}>Product</th>
                  <th style={tableHeader}>Supplier</th>
                  <th style={{ ...tableHeader, textAlign: "right" }}>Qty</th>
                  <th style={{ ...tableHeader, textAlign: "right" }}>Total Cost</th>
                  <th style={{ ...tableHeader, textAlign: "right" }}>Unit Price</th>
                  <th style={tableHeader}>Invoice / Batch</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r: any) => {
                  const unitPrice = r.costPence > 0 && parseFloat(r.quantity) > 0
                    ? (r.costPence / parseFloat(r.quantity) / 100).toFixed(2)
                    : null;
                  return (
                    <tr key={r.id}>
                      <td style={tableCell}>{fmtDate(r.deliveryDate)}</td>
                      <td style={tableCell}>{r.stockItemName ?? "—"}</td>
                      <td style={tableCell}>{r.supplierName ?? "—"}</td>
                      <td style={{ ...tableCell, textAlign: "right" }}>{parseFloat(r.quantity).toLocaleString("en-GB")} {r.stockItemUnit ?? ""}</td>
                      <td style={{ ...tableCell, textAlign: "right" }}>{r.costPence ? fmtGbpFull(r.costPence) : "—"}</td>
                      <td style={{ ...tableCell, textAlign: "right" }}>{unitPrice ? `£${unitPrice}` : "—"}</td>
                      <td style={tableCell}>{[r.invoiceReference, r.batchNumber].filter(Boolean).join(" / ") || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sales Sub-view ───────────────────────────────────────────────────────────

type SalesData = {
  grain: any[]; deadweight: any[]; mart: any[]; milk: any[];
  direct: any[]; pigKill: any[]; egg: any[]; poultry: any[];
};

function SalesView({ farmId, from, to }: { farmId: number; from: string; to: string }) {
  const { data, isLoading } = useQuery<SalesData>({
    queryKey: ["sales-history", farmId, from, to],
    queryFn: () => fetch(`/api/farms/${farmId}/sales-history?from=${from}&to=${to}`).then(r => r.json()),
    enabled: !!farmId,
  });

  const { cards, revenueChartData, grainPriceData, grainCommodities, allRows } = useMemo(() => {
    if (!data) return { cards: { grain: 0, livestock: 0, dairy: 0, direct: 0, total: 0 }, revenueChartData: [], grainPriceData: [], grainCommodities: [], allRows: [] };

    const grainTotal = data.grain.reduce((s, r) => s + (r.netValuePence ?? 0), 0);
    const livestockTotal = [
      ...data.deadweight.map(r => r.netPaymentPence ?? 0),
      ...data.mart.map(r => r.netPaymentPence ?? 0),
    ].reduce((s, v) => s + v, 0);
    const dairyTotal = data.milk.reduce((s, r) => s + (r.netPaymentPence ?? 0), 0);
    const directTotal = data.direct.reduce((s, r) => s + (r.netValuePence ?? 0), 0);
    const pigTotal = data.pigKill.reduce((s, r) => s + (r.netPaymentPence ?? 0), 0);
    const eggTotal = data.egg.reduce((s, r) => s + (r.netValuePence ?? 0), 0);
    const poultryTotal = data.poultry.reduce((s, r) => s + (r.netPaymentPence ?? 0), 0);

    // Normalise all records to {date, type, netPence, description, buyer}
    const allRows: any[] = [
      ...data.grain.map(r => ({ date: r.date, type: "grain", desc: `${r.commodity}${r.variety ? ` (${r.variety})` : ""}`, buyer: r.buyer, netPence: r.netValuePence ?? 0, detail: r.tonnage ? `${r.tonnage}t @ ${r.pricePerTonnePence ? "£" + (r.pricePerTonnePence / 100).toFixed(2) + "/t" : "—"}` : "" })),
      ...data.deadweight.map(r => ({ date: r.date, type: "livestock", desc: `${r.species} deadweight`, buyer: r.processor, netPence: r.netPaymentPence ?? 0, detail: `${r.headCount} hd${r.gradeClassification ? `, ${r.gradeClassification}` : ""}` })),
      ...data.mart.map(r => ({ date: r.date, type: "livestock", desc: `${r.species} mart sale`, buyer: r.martName, netPence: r.netPaymentPence ?? 0, detail: `${r.headCount} hd` })),
      ...data.milk.map(r => ({ date: `${r.statementMonth}-01`, type: "dairy", desc: "Milk statement", buyer: r.buyer, netPence: r.netPaymentPence ?? 0, detail: r.litresSupplied ? `${parseFloat(r.litresSupplied).toLocaleString("en-GB")}L @ ${r.pencePerLitre}ppl` : "" })),
      ...data.direct.map(r => ({ date: r.date, type: "direct", desc: r.productName, buyer: r.customerName ?? r.channel, netPence: r.netValuePence ?? r.grossValuePence ?? 0, detail: `${r.quantity} ${r.unit} @ £${(r.unitPricePence / 100).toFixed(2)}` })),
      ...data.pigKill.map(r => ({ date: r.date, type: "pig", desc: `Pig kill`, buyer: r.processor, netPence: r.netPaymentPence ?? 0, detail: `${r.headCount} hd${r.gradeOut ? `, ${r.gradeOut}` : ""}` })),
      ...data.egg.map(r => ({ date: r.date, type: "egg", desc: `Egg sales (${r.eggType})`, buyer: r.packingStation ?? r.salesChannel, netPence: r.netValuePence ?? 0, detail: r.dozensDelivered ? `${r.dozensDelivered} dzn` : "" })),
      ...data.poultry.map(r => ({ date: r.date, type: "poultry", desc: `${r.species} settlement`, buyer: r.integratorName, netPence: r.netPaymentPence ?? 0, detail: r.birdsDelivered ? `${r.birdsDelivered} birds` : "" })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Monthly revenue chart
    const monthBuckets: Record<string, Record<string, number>> = {};
    const types = ["grain", "livestock", "dairy", "direct", "pig", "egg", "poultry"];
    for (const row of allRows) {
      if (!row.date) continue;
      const mk = monthKey(row.date);
      monthBuckets[mk] = monthBuckets[mk] ?? {};
      monthBuckets[mk][row.type] = (monthBuckets[mk][row.type] ?? 0) + row.netPence;
    }
    const revenueChartData = Object.keys(monthBuckets).sort().map(mk => {
      const row: Record<string, any> = { month: monthLabel(mk) };
      for (const t of types) row[t] = parseFloat(((monthBuckets[mk][t] ?? 0) / 100).toFixed(2));
      return row;
    });

    // Grain price trend
    const grainCommodityMonthPrices: Record<string, Record<string, { total: number; count: number }>> = {};
    for (const g of data.grain) {
      if (!g.pricePerTonnePence || !g.date) continue;
      const commodity = g.commodity;
      const mk = monthKey(g.date);
      grainCommodityMonthPrices[commodity] = grainCommodityMonthPrices[commodity] ?? {};
      grainCommodityMonthPrices[commodity][mk] = grainCommodityMonthPrices[commodity][mk] ?? { total: 0, count: 0 };
      grainCommodityMonthPrices[commodity][mk].total += g.pricePerTonnePence;
      grainCommodityMonthPrices[commodity][mk].count += 1;
    }
    const grainCommodities = Object.keys(grainCommodityMonthPrices);
    const allMonths = [...new Set(grainCommodities.flatMap(c => Object.keys(grainCommodityMonthPrices[c])))].sort();
    const grainPriceData = allMonths.map(mk => {
      const row: Record<string, any> = { month: monthLabel(mk) };
      for (const c of grainCommodities) {
        const e = grainCommodityMonthPrices[c][mk];
        if (e) row[c] = parseFloat((e.total / e.count / 100).toFixed(2));
      }
      return row;
    });

    const activeSaleTypes = types.filter(t => revenueChartData.some(r => (r[t] ?? 0) > 0));

    return {
      cards: { grain: grainTotal, livestock: livestockTotal, dairy: dairyTotal, direct: directTotal, total: grainTotal + livestockTotal + dairyTotal + directTotal + pigTotal + eggTotal + poultryTotal },
      revenueChartData,
      grainPriceData,
      grainCommodities,
      allRows,
    };
  }, [data]);

  if (isLoading) return <div style={{ padding: 32, textAlign: "center", color: "#6b7280" }}>Loading sales history…</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <SummaryCard label="Total Revenue" value={fmtGbp(cards.total)} sub="all sales channels" icon={TrendingUp} color="#166534" />
        <SummaryCard label="Grain & Crops" value={fmtGbp(cards.grain)} icon={Package} color="#92400e" />
        <SummaryCard label="Livestock" value={fmtGbp(cards.livestock)} icon={ArrowUpDown} color="#f59e0b" />
        <SummaryCard label="Dairy & Direct" value={fmtGbp(cards.dairy + cards.direct)} icon={ShoppingCart} color="#3b82f6" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: grainPriceData.length > 0 ? "1fr 1fr" : "1fr", gap: 16 }}>
        <ChartCard title="Monthly Revenue by Category (£)" height={240}>
          {revenueChartData.length === 0 ? <EmptyChart message="No sales in this period" /> : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChartData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any, name: string) => [`£${Number(v).toLocaleString("en-GB", { minimumFractionDigits: 2 })}`, name.charAt(0).toUpperCase() + name.slice(1)]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {(["grain", "livestock", "dairy", "direct", "pig", "egg", "poultry"] as const).map((type) =>
                  revenueChartData.some(r => (r[type] ?? 0) > 0) ? (
                    <Bar key={type} dataKey={type} stackId="rev" fill={SALE_TYPE_COLORS[type]} name={type.charAt(0).toUpperCase() + type.slice(1)} />
                  ) : null
                )}
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {grainPriceData.length > 0 && (
          <ChartCard title="Grain Price Achieved (£/tonne)" height={240}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={grainPriceData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `£${v}`} />
                <Tooltip formatter={(v: any, name: string) => [`£${v}/t`, name]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {grainCommodities.map((c, i) => (
                  <Line key={c} type="monotone" dataKey={c} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>

      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #e5e7eb", fontWeight: 600, fontSize: "0.875rem", color: "#374151" }}>
          Sales Records ({allRows.length})
        </div>
        {allRows.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "#9ca3af", fontSize: "0.875rem" }}>No sales recorded in this period.</div>
        ) : (
          <div style={{ overflowX: "auto", maxHeight: 360, overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                <tr>
                  <th style={tableHeader}>Date</th>
                  <th style={tableHeader}>Type</th>
                  <th style={tableHeader}>Description</th>
                  <th style={tableHeader}>Buyer / Processor</th>
                  <th style={tableHeader}>Detail</th>
                  <th style={{ ...tableHeader, textAlign: "right" }}>Net Payment</th>
                </tr>
              </thead>
              <tbody>
                {allRows.map((r: any, i: number) => (
                  <tr key={i}>
                    <td style={tableCell}>{fmtDate(r.date)}</td>
                    <td style={tableCell}>
                      <span style={{ background: `${SALE_TYPE_COLORS[r.type]}20`, color: SALE_TYPE_COLORS[r.type], padding: "2px 8px", borderRadius: 12, fontSize: "0.75rem", fontWeight: 600 }}>
                        {r.type.charAt(0).toUpperCase() + r.type.slice(1)}
                      </span>
                    </td>
                    <td style={tableCell}>{r.desc}</td>
                    <td style={tableCell}>{r.buyer ?? "—"}</td>
                    <td style={{ ...tableCell, color: "#6b7280" }}>{r.detail || "—"}</td>
                    <td style={{ ...tableCell, textAlign: "right", fontWeight: 600, color: "#166534" }}>{r.netPence ? fmtGbpFull(r.netPence) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Supplier Performance Sub-view ────────────────────────────────────────────

function SupplierPerformanceView({ farmId, from, to }: { farmId: number; from: string; to: string }) {
  const { data, isLoading } = useQuery<{ records: any[] }>({
    queryKey: ["purchase-history", farmId, from, to],
    queryFn: () => fetch(`/api/farms/${farmId}/purchase-history?from=${from}&to=${to}`).then(r => r.json()),
    enabled: !!farmId,
  });

  const supplierStats = useMemo(() => {
    const recs = data?.records ?? [];
    const stats: Record<string, {
      name: string; products: Set<string>; deliveries: number; totalSpend: number;
      unitPrices: { product: string; price: number }[];
      firstDate: string; lastDate: string;
    }> = {};
    for (const r of recs) {
      const key = r.supplierName ?? "Unknown";
      if (!stats[key]) stats[key] = { name: key, products: new Set(), deliveries: 0, totalSpend: 0, unitPrices: [], firstDate: r.deliveryDate, lastDate: r.deliveryDate };
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

  if (isLoading) return <div style={{ padding: 32, textAlign: "center", color: "#6b7280" }}>Loading supplier data…</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #e5e7eb", fontWeight: 600, fontSize: "0.875rem", color: "#374151" }}>
          Supplier Performance ({supplierStats.length} suppliers)
        </div>
        {supplierStats.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "#9ca3af", fontSize: "0.875rem" }}>No purchase records in this period.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={tableHeader}>Supplier</th>
                  <th style={tableHeader}>Products Supplied</th>
                  <th style={{ ...tableHeader, textAlign: "right" }}>Deliveries</th>
                  <th style={{ ...tableHeader, textAlign: "right" }}>Total Spend</th>
                  <th style={{ ...tableHeader, textAlign: "right" }}>Avg Unit Price</th>
                  <th style={{ ...tableHeader, textAlign: "right" }}>Price Range</th>
                  <th style={tableHeader}>First Delivery</th>
                  <th style={tableHeader}>Last Delivery</th>
                </tr>
              </thead>
              <tbody>
                {supplierStats.map((s) => {
                  const prices = s.unitPrices.map(p => p.price);
                  const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : null;
                  const minPrice = prices.length > 0 ? Math.min(...prices) : null;
                  const maxPrice = prices.length > 0 ? Math.max(...prices) : null;
                  return (
                    <tr key={s.name}>
                      <td style={{ ...tableCell, fontWeight: 600 }}>{s.name}</td>
                      <td style={tableCell}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {[...s.products].slice(0, 4).map(p => (
                            <span key={p} style={{ background: "#f3f4f6", borderRadius: 4, padding: "1px 6px", fontSize: "0.75rem", color: "#374151" }}>{p}</span>
                          ))}
                          {s.products.size > 4 && (
                            <Popover>
                              <PopoverTrigger asChild>
                                <button style={{ fontSize: "0.75rem", color: "#2563eb", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                                  +{s.products.size - 4} more
                                </button>
                              </PopoverTrigger>
                              <PopoverContent side="top" align="start" className="w-56 p-2">
                                <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                                  All products — {s.name}
                                </p>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                  {[...s.products].map(p => (
                                    <span key={p} style={{ background: "#f3f4f6", borderRadius: 4, padding: "1px 6px", fontSize: "0.75rem", color: "#374151" }}>{p}</span>
                                  ))}
                                </div>
                              </PopoverContent>
                            </Popover>
                          )}
                        </div>
                      </td>
                      <td style={{ ...tableCell, textAlign: "right" }}>{s.deliveries}</td>
                      <td style={{ ...tableCell, textAlign: "right", fontWeight: 600 }}>{fmtGbpFull(s.totalSpend)}</td>
                      <td style={{ ...tableCell, textAlign: "right" }}>{avgPrice !== null ? `£${avgPrice.toFixed(2)}` : "—"}</td>
                      <td style={{ ...tableCell, textAlign: "right", color: "#6b7280" }}>
                        {minPrice !== null && maxPrice !== null ? `£${minPrice.toFixed(2)} – £${maxPrice.toFixed(2)}` : "—"}
                      </td>
                      <td style={tableCell}>{fmtDate(s.firstDate)}</td>
                      <td style={tableCell}>{fmtDate(s.lastDate)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function TradeHistoryTab({ farmId }: { farmId: number }) {
  const options = cropYearOptions();
  const [selectedPeriod, setSelectedPeriod] = useState<string>(options[0].value);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [subTab, setSubTab] = useState<"purchases" | "sales" | "suppliers">("purchases");

  const isCustom = selectedPeriod === "custom";
  const periodOption = options.find(o => o.value === selectedPeriod);
  const from = isCustom ? customFrom : (periodOption?.from ?? "");
  const to = isCustom ? customTo : (periodOption?.to ?? "");

  const subTabStyle = (active: boolean): React.CSSProperties => ({
    padding: "6px 14px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    fontSize: "0.8125rem",
    fontWeight: active ? 600 : 400,
    background: active ? "#166534" : "transparent",
    color: active ? "#fff" : "#6b7280",
    transition: "background 0.15s, color 0.15s",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Period selector */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "14px 16px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#374151", marginRight: 4 }}>Period:</span>
        {options.map(o => (
          <button key={o.value} onClick={() => setSelectedPeriod(o.value)} style={{
            padding: "5px 12px", borderRadius: 6, border: "1px solid",
            borderColor: selectedPeriod === o.value ? "#166534" : "#d1d5db",
            background: selectedPeriod === o.value ? "#166534" : "#fff",
            color: selectedPeriod === o.value ? "#fff" : "#374151",
            fontSize: "0.8125rem", fontWeight: selectedPeriod === o.value ? 600 : 400, cursor: "pointer",
          }}>{o.label}</button>
        ))}
        <button onClick={() => setSelectedPeriod("custom")} style={{
          padding: "5px 12px", borderRadius: 6, border: "1px solid",
          borderColor: selectedPeriod === "custom" ? "#166534" : "#d1d5db",
          background: selectedPeriod === "custom" ? "#166534" : "#fff",
          color: selectedPeriod === "custom" ? "#fff" : "#374151",
          fontSize: "0.8125rem", cursor: "pointer",
        }}>Custom</button>
        {isCustom && (
          <>
            <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} style={{ border: "1px solid #d1d5db", borderRadius: 6, padding: "4px 8px", fontSize: "0.8125rem" }} />
            <span style={{ fontSize: "0.8125rem", color: "#6b7280" }}>to</span>
            <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} style={{ border: "1px solid #d1d5db", borderRadius: 6, padding: "4px 8px", fontSize: "0.8125rem" }} />
          </>
        )}
      </div>

      {/* Sub-tabs */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px", display: "flex", gap: 4, alignItems: "center" }}>
        <TrendingUp size={16} color="#6b7280" style={{ marginRight: 6 }} />
        <button style={subTabStyle(subTab === "purchases")} onClick={() => setSubTab("purchases")}>Purchases</button>
        <button style={subTabStyle(subTab === "sales")} onClick={() => setSubTab("sales")}>Sales</button>
        <button style={subTabStyle(subTab === "suppliers")} onClick={() => setSubTab("suppliers")}>Supplier Performance</button>
      </div>

      {/* Content */}
      {(!from || !to) ? (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 32, textAlign: "center", color: "#9ca3af", fontSize: "0.875rem" }}>
          Select a period above to view trade history.
        </div>
      ) : subTab === "purchases" ? (
        <PurchasesView farmId={farmId} from={from} to={to} />
      ) : subTab === "sales" ? (
        <SalesView farmId={farmId} from={from} to={to} />
      ) : (
        <SupplierPerformanceView farmId={farmId} from={from} to={to} />
      )}
    </div>
  );
}

export default function TradeHistoryPage() {
  const { farmId } = useAppStore();
  if (!farmId) return null;
  return (
    <AppLayout title="Trade History">
      <TradeHistoryTab farmId={farmId} />
    </AppLayout>
  );
}
