import { useEffect, useState } from "react";
import { kvGet } from "@/lib/database";
import { getCurrentAuthToken } from "../authToken";

export interface TaskSummaryData {
  total: number;
  done: number;
  todo: number;
  overdue: number;
  nextTask: { title: string; dueDate: string; module: string | null } | null;
}

async function getTenantSlug(): Promise<string> {
  try {
    const raw = await kvGet("bde_current_farm");
    if (raw) {
      const farm = JSON.parse(raw);
      return farm.tenantSlug || farm.slug || "";
    }
  } catch { }
  return "";
}

export function useApiMyTasksSummary(farmId: string | undefined) {
  const [data, setData] = useState<TaskSummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!farmId) {
      setLoading(false);
      return;
    }

    const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
    if (!apiDomain) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const [token, tenantSlug] = await Promise.all([getCurrentAuthToken(), getTenantSlug()]);

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "x-tenant-slug": tenantSlug,
        };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(
          `https://${apiDomain}/api/farms/${farmId}/task-assignments/mine`,
          { headers }
        );
        if (!res.ok) throw new Error(`${res.status}`);

        const assignments: Array<{
          id: number;
          title: string;
          status: string;
          dueDate: string | null;
          module: string | null;
        }> = await res.json();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const total = assignments.length;
        const done = assignments.filter((a) => a.status === "completed").length;
        const pending = assignments.filter(
          (a) => a.status === "pending" || a.status === "in_progress"
        );
        const overdue = pending.filter(
          (a) => a.dueDate && new Date(a.dueDate) < today
        ).length;

        const upcoming = pending
          .filter((a) => a.dueDate && new Date(a.dueDate) >= today)
          .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

        const nextTask = upcoming[0]
          ? { title: upcoming[0].title, dueDate: upcoming[0].dueDate!, module: upcoming[0].module }
          : pending[0]
          ? { title: pending[0].title, dueDate: pending[0].dueDate ?? "", module: pending[0].module }
          : null;

        if (!cancelled) {
          setData({ total, done, todo: pending.length, overdue, nextTask });
        }
      } catch {
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [farmId]);

  return { data, loading };
}
