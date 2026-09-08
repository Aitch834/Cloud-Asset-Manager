export type WineryVesselRecordKind = "fills" | "maintenance" | "movements";

interface DeleteWineryVesselRecordOptions {
  apiBase: string;
  farmId: string;
  vesselId: string;
  kind: WineryVesselRecordKind;
  recordId: number;
  headers: Record<string, string>;
  triggerBarrelRefresh: () => void;
  refreshDetail: () => void;
  fetchImpl?: typeof fetch;
}

export interface DeleteWineryVesselRecordResult {
  ok: boolean;
  status: number;
  error?: string;
}

export async function deleteWineryVesselRecord({
  apiBase,
  farmId,
  vesselId,
  kind,
  recordId,
  headers,
  triggerBarrelRefresh,
  refreshDetail,
  fetchImpl = fetch,
}: DeleteWineryVesselRecordOptions): Promise<DeleteWineryVesselRecordResult> {
  const response = await fetchImpl(
    `${apiBase}/api/farms/${farmId}/winery-vessels/${vesselId}/${kind}/${recordId}`,
    { method: "DELETE", headers },
  );

  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { error?: string };
    return {
      ok: false,
      status: response.status,
      error: body.error,
    };
  }

  triggerBarrelRefresh();
  refreshDetail();
  return { ok: true, status: response.status };
}