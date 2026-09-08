import {
  deleteWineryVesselRecord,
  type WineryVesselRecordKind,
} from "../lib/utils/wineryVesselDelete";

function response(ok: boolean, status: number, body: unknown = {}): Response {
  return {
    ok,
    status,
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Response;
}

describe("deleteWineryVesselRecord", () => {
  const baseOptions = {
    apiBase: "https://api.example.test",
    farmId: "farm-5",
    vesselId: "1889",
    recordId: 77,
    headers: { Authorization: "Bearer token" },
  };

  it.each<WineryVesselRecordKind>(["fills", "maintenance", "movements"])(
    "refreshes barrel alerts immediately after a successful %s DELETE",
    async kind => {
      const events: string[] = [];
      const fetchImpl = jest.fn().mockImplementation(async () => {
        events.push("delete");
        return response(true, 204);
      });
      const triggerBarrelRefresh = jest.fn(() => events.push("barrel-refresh"));
      const refreshDetail = jest.fn(() => events.push("detail-refresh"));

      const result = await deleteWineryVesselRecord({
        ...baseOptions,
        kind,
        triggerBarrelRefresh,
        refreshDetail,
        fetchImpl,
      });

      expect(fetchImpl).toHaveBeenCalledWith(
        `https://api.example.test/api/farms/farm-5/winery-vessels/1889/${kind}/77`,
        {
          method: "DELETE",
          headers: baseOptions.headers,
        },
      );
      expect(result).toEqual({ ok: true, status: 204 });
      expect(triggerBarrelRefresh).toHaveBeenCalledTimes(1);
      expect(refreshDetail).toHaveBeenCalledTimes(1);
      expect(events).toEqual(["delete", "barrel-refresh", "detail-refresh"]);
    },
  );

  it.each<WineryVesselRecordKind>(["fills", "maintenance", "movements"])(
    "does not refresh barrel alerts after a failed %s DELETE",
    async kind => {
      const triggerBarrelRefresh = jest.fn();
      const refreshDetail = jest.fn();

      const result = await deleteWineryVesselRecord({
        ...baseOptions,
        kind,
        triggerBarrelRefresh,
        refreshDetail,
        fetchImpl: jest.fn().mockResolvedValue(
          response(false, 409, { error: "Record cannot be deleted" }),
        ),
      });

      expect(result).toEqual({
        ok: false,
        status: 409,
        error: "Record cannot be deleted",
      });
      expect(triggerBarrelRefresh).not.toHaveBeenCalled();
      expect(refreshDetail).not.toHaveBeenCalled();
    },
  );
});