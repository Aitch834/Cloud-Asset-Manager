import {
  clearExpiredAgriEnvCaches,
  AGRI_ENV_CACHE_TTL_MS,
} from "../lib/storage";

jest.mock("expo-crypto", () => ({
  randomUUID: jest.fn(),
}));

const mockKvGetKeysByPrefix = jest.fn<Promise<string[]>, [string]>();
const mockKvGet = jest.fn<Promise<string | null>, [string]>();
const mockKvDelete = jest.fn<Promise<void>, [string]>();

jest.mock("../lib/database", () => ({
  kvGetKeysByPrefix: (...args: [string]) => mockKvGetKeysByPrefix(...args),
  kvGet: (...args: [string]) => mockKvGet(...args),
  kvDelete: (...args: [string]) => mockKvDelete(...args),
}));

describe("clearExpiredAgriEnvCaches", () => {
  const now = Date.parse("2026-08-22T12:00:00.000Z");
  const oldTimestamp = new Date(now - AGRI_ENV_CACHE_TTL_MS - 1).toISOString();
  const boundaryTimestamp = new Date(now - AGRI_ENV_CACHE_TTL_MS).toISOString();
  const recentTimestamp = new Date(now - 60_000).toISOString();
  const futureTimestamp = new Date(now + 60_000).toISOString();

  beforeEach(() => {
    jest.clearAllMocks();
    mockKvGetKeysByPrefix.mockImplementation(async (prefix) => {
      if (prefix === "bde_agri_env_projects_cache_") {
        return [
          "bde_agri_env_projects_cache_old-farm",
          "bde_agri_env_projects_cache_current-farm",
          "bde_agri_env_projects_cache_removed-farm",
        ];
      }
      if (prefix === "bde_agri_env_milestones_cache_") {
        return [
          "bde_agri_env_milestones_cache_old-farm",
          "bde_agri_env_milestones_cache_boundary-farm",
          "bde_agri_env_milestones_cache_removed-farm",
          "bde_agri_env_milestones_cache_future-farm",
        ];
      }
      return [
        "bde_agri_env_project_milestones_cache_current-farm_101",
        "bde_agri_env_project_milestones_cache_removed-farm_202",
      ];
    });
    mockKvGet.mockImplementation(async (key) => {
      if (key.endsWith("old-farm")) return JSON.stringify({ data: [], cachedAt: oldTimestamp });
      if (key.includes("current-farm") || key.includes("removed-farm")) {
        return JSON.stringify({ data: [], cachedAt: recentTimestamp });
      }
      if (key.endsWith("future-farm")) return JSON.stringify({ data: [], cachedAt: futureTimestamp });
      return JSON.stringify({ data: [], cachedAt: boundaryTimestamp });
    });
    mockKvDelete.mockResolvedValue(undefined);
  });

  it("sweeps old entries from both project and milestone namespaces", async () => {
    await clearExpiredAgriEnvCaches(undefined, now);

    expect(mockKvGetKeysByPrefix).toHaveBeenCalledTimes(3);
    expect(mockKvDelete).toHaveBeenCalledWith("bde_agri_env_projects_cache_old-farm");
    expect(mockKvDelete).toHaveBeenCalledWith("bde_agri_env_milestones_cache_old-farm");
  });

  it("keeps recent entries and entries exactly at the TTL boundary", async () => {
    await clearExpiredAgriEnvCaches(undefined, now);

    expect(mockKvDelete).not.toHaveBeenCalledWith("bde_agri_env_projects_cache_current-farm");
    expect(mockKvDelete).not.toHaveBeenCalledWith("bde_agri_env_milestones_cache_boundary-farm");
  });

  it("removes recent caches for farms absent from the refreshed farm list", async () => {
    await clearExpiredAgriEnvCaches(["current-farm"], now);

    expect(mockKvDelete).toHaveBeenCalledWith("bde_agri_env_projects_cache_removed-farm");
    expect(mockKvDelete).toHaveBeenCalledWith("bde_agri_env_milestones_cache_removed-farm");
    expect(mockKvDelete).toHaveBeenCalledWith("bde_agri_env_project_milestones_cache_removed-farm_202");
    expect(mockKvDelete).not.toHaveBeenCalledWith("bde_agri_env_projects_cache_current-farm");
    expect(mockKvDelete).not.toHaveBeenCalledWith("bde_agri_env_project_milestones_cache_current-farm_101");
  });

  it("removes every cache when the authoritative farm list is empty", async () => {
    await clearExpiredAgriEnvCaches([], now);

    expect(mockKvDelete).toHaveBeenCalledWith("bde_agri_env_projects_cache_current-farm");
    expect(mockKvDelete).toHaveBeenCalledWith("bde_agri_env_milestones_cache_boundary-farm");
    expect(mockKvDelete).toHaveBeenCalledTimes(9);
  });

  it("deletes future-dated entries because the cache reader treats them as stale", async () => {
    await clearExpiredAgriEnvCaches(undefined, now);

    expect(mockKvDelete).toHaveBeenCalledWith("bde_agri_env_milestones_cache_future-farm");
  });

  it("deletes malformed cache payloads because they cannot be read", async () => {
    mockKvGet.mockResolvedValueOnce("{not-json").mockResolvedValue(null);

    await clearExpiredAgriEnvCaches(undefined, now);

    expect(mockKvDelete).toHaveBeenCalledWith("bde_agri_env_projects_cache_old-farm");
    expect(mockKvDelete).toHaveBeenCalledTimes(1);
  });
});