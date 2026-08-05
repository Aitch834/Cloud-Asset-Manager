import React from "react";

// ─── Shared helpers / constants ────────────────────────────────────────────────
export const BASE = import.meta.env.BASE_URL;
export const api = (path: string) => `${BASE}api/${path}`;

export function formatDate(v?: string | null) {
  if (!v) return "—";
  try { return new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return v; }
}

export function today() { return new Date().toISOString().slice(0, 10); }

export function SccBadge({ v }: { v?: number | null }) {
  if (!v) return <span className="text-gray-400">—</span>;
  const ok = v < 200;
  const warn = v >= 200 && v < 400;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ok ? "bg-green-100 text-green-800" : warn ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}>
      {v.toLocaleString()} k/mL
    </span>
  );
}

export function EaseScoreBadge({ v }: { v?: number | null }) {
  if (!v) return <span className="text-gray-400">—</span>;
  const colours = ["", "bg-green-100 text-green-800", "bg-lime-100 text-lime-800", "bg-amber-100 text-amber-800", "bg-red-100 text-red-800"];
  const labels = ["", "Unassisted", "Minor assistance", "Major assistance", "Vet required"];
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${colours[v] || "bg-gray-100 text-gray-700"}`}>{v} — {labels[v] || "Unknown"}</span>;
}

export function OutcomeBadge({ v }: { v?: string | null }) {
  if (!v) return <span className="text-gray-400">—</span>;
  const map: Record<string, string> = { cured: "bg-green-100 text-green-800", recovered: "bg-green-100 text-green-800", "dried-off": "bg-blue-100 text-blue-800", "culled": "bg-red-100 text-red-800", chronic: "bg-amber-100 text-amber-800", ongoing: "bg-yellow-100 text-yellow-800" };
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${map[v] || "bg-gray-100 text-gray-700"}`}>{v.charAt(0).toUpperCase() + v.slice(1).replace("-", " ")}</span>;
}

export function BcsBadge({ v }: { v?: string | null }) {
  if (!v) return <span className="text-gray-400">—</span>;
  const n = parseFloat(v);
  const ok = n >= 2.5 && n <= 3.5;
  const low = n < 2.5;
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${ok ? "bg-green-100 text-green-800" : low ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}>{v}</span>;
}

export interface AbrKitStock {
  id: number; productName: string; supplier?: string | null;
  lotNumber?: string | null; batchNumber?: string | null;
  expiryDate?: string | null; quantityPurchased: number;
  quantityUsed: number; quantityRemaining: number;
  lowStockThreshold: number; notes?: string | null;
}
