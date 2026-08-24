import { b as useAppStore, u as useLocation, m as useQuery, j as jsxRuntimeExports, B as Building2, M as MapPin } from "./index-Drr5GNr8.js";
import { A as AppLayout, a as Wheat } from "./AppLayout-DwIbxNRo.js";
import { T as TriangleAlert } from "./triangle-alert-DCS6f_UH.js";
import { C as CircleCheck } from "./circle-check-D-lr4YKr.js";
import { C as ChevronRight } from "./tractor-DpZYmRY5.js";
import "./use-safe-clerk-DIe5oks8.js";
import "./trash-2-CH3R1gt8.js";
import "./database-DQsLk5W4.js";
import "./shield-alert-oVOAtE0i.js";
import "./shield-check-TCP2NWHA.js";
function complianceColor(score) {
  if (score === null) return "#9ca3af";
  if (score >= 90) return "#16a34a";
  if (score >= 70) return "#d97706";
  return "#dc2626";
}
function complianceBg(score) {
  if (score === null) return "#f3f4f6";
  if (score >= 90) return "#f0fdf4";
  if (score >= 70) return "#fffbeb";
  return "#fef2f2";
}
function complianceBorder(score) {
  if (score === null) return "#e5e7eb";
  if (score >= 90) return "#bbf7d0";
  if (score >= 70) return "#fcd34d";
  return "#fca5a5";
}
function sectorBadges(farm) {
  const out = [];
  if (farm.sectorArable) out.push("Arable");
  if (farm.sectorDairy) out.push("Dairy");
  if (farm.sectorBeef) out.push("Beef");
  if (farm.sectorSheep) out.push("Sheep");
  if (farm.sectorPigs) out.push("Pigs");
  if (farm.sectorPoultry) out.push("Poultry");
  return out;
}
function MultiFarmGroupPage() {
  const { setFarmId } = useAppStore();
  const [, navigate] = useLocation();
  const farmsQ = useQuery({
    queryKey: ["tenant-farms-group"],
    queryFn: () => fetch("/api/tenants/current/farms").then((r) => r.json())
  });
  const dashboardsQ = useQuery({
    queryKey: ["group-dashboards"],
    queryFn: async () => {
      const farms2 = farmsQ.data?.farms ?? [];
      const results = await Promise.all(
        farms2.map(async (f) => {
          try {
            const d = await fetch(`/api/farms/${f.id}/dashboard`).then((r) => r.json());
            return { farmId: f.id, complianceScore: d.complianceScore ?? 0 };
          } catch {
            return { farmId: f.id, complianceScore: 0 };
          }
        })
      );
      return { results };
    },
    enabled: !!farmsQ.data?.farms?.length
  });
  const farms = farmsQ.data?.farms ?? [];
  const scores = {};
  for (const r of dashboardsQ.data?.results ?? []) {
    scores[r.farmId] = r.complianceScore;
  }
  const avgScore = farms.length > 0 ? Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Math.max(Object.values(scores).length, 1)) : null;
  const allGood = farms.filter((f) => (scores[f.id] ?? 0) >= 90).length;
  const needsAttention = farms.filter((f) => (scores[f.id] ?? 100) < 70).length;
  const totalAcres = farms.reduce((sum, f) => sum + (f.totalAcreage ?? 0), 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Group Overview", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-5xl space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold text-gray-900", children: "Multi-Farm Group Overview" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 mt-0.5", children: "Consolidated compliance and status across all farms in your group." })
    ] }),
    farms.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-xl p-4 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold text-gray-900", children: farms.length }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Farms in group" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-xl p-4 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold", style: { color: complianceColor(avgScore) }, children: avgScore !== null ? `${avgScore}%` : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Avg compliance score" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-xl p-4 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold text-green-700", children: allGood }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Farms audit-ready (≥90%)" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-xl p-4 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold", style: { color: needsAttention > 0 ? "#dc2626" : "#9ca3af" }, children: totalAcres > 0 ? `${totalAcres.toLocaleString()}` : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Total acres" })
      ] })
    ] }),
    needsAttention > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 mt-0.5 flex-shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
          needsAttention,
          " farm",
          needsAttention !== 1 ? "s" : ""
        ] }),
        " ha",
        needsAttention !== 1 ? "ve" : "s",
        " a compliance score below 70%. Review those farms to resolve outstanding issues before audit."
      ] })
    ] }),
    farmsQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4", children: [0, 1, 2].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-28 bg-gray-100 rounded-xl animate-pulse" }, i)) }) : farms.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-xl p-12 text-center text-gray-400", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "w-8 h-8 mx-auto mb-3 opacity-30" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "No farms found" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-1", children: "You need at least one farm set up to use Group Overview." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-gray-700", children: "All Farms" }),
      farms.map((farm) => {
        const score = scores[farm.id] ?? null;
        const loaded = dashboardsQ.isFetched;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "bg-white border rounded-xl p-4 hover:shadow-sm transition-shadow",
            style: { borderColor: loaded ? complianceBorder(score) : "#e5e7eb" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                    style: { background: loaded ? complianceBg(score) : "#f3f4f6" },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Wheat, { className: "w-5 h-5", style: { color: loaded ? complianceColor(score) : "#9ca3af" } })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap mb-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-gray-900 text-sm", children: farm.name }),
                    farm.cphNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-mono text-gray-400", children: [
                      "CPH: ",
                      farm.cphNumber
                    ] }),
                    sectorBadges(farm).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-primary/8 text-primary px-2 py-0.5 rounded-full border border-primary/15", children: s }, s))
                  ] }),
                  farm.address && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400 flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-3 h-3" }),
                    farm.address
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 flex-shrink-0", children: [
                  loaded ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", style: { color: complianceColor(score) }, children: score !== null ? `${score}%` : "—" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "compliance" }),
                    score !== null && score >= 90 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1 mt-0.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3 h-3 text-green-600" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-green-600 font-medium", children: "Audit-ready" })
                    ] }),
                    score !== null && score < 70 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1 mt-0.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3 h-3 text-red-600" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-red-600 font-medium", children: "Needs attention" })
                    ] })
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-10 bg-gray-100 rounded animate-pulse" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      onClick: () => {
                        setFarmId(farm.id);
                        navigate("/dashboard");
                      },
                      className: "flex items-center gap-1.5 text-xs font-medium text-primary border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors",
                      children: [
                        "View ",
                        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-3 h-3" })
                      ]
                    }
                  )
                ] })
              ] }),
              loaded && score !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 pt-3 border-t border-gray-100", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs text-gray-400 mb-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Compliance score" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    score,
                    "%"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 rounded-full bg-gray-100 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "h-full rounded-full transition-all",
                    style: { width: `${score}%`, backgroundColor: complianceColor(score) }
                  }
                ) })
              ] })
            ]
          },
          farm.id
        );
      })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-6 text-xs text-gray-500 border rounded-lg px-4 py-2.5 bg-gray-50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-green-600 inline-block" }),
        "Audit-ready ≥90%"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" }),
        "Review needed 70–89%"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-red-600 inline-block" }),
        "Attention required <70%"
      ] })
    ] })
  ] }) });
}
export {
  MultiFarmGroupPage as default
};
