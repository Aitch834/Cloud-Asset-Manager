/**
 * Integration coverage for the scouting photo single-URL refresh helper.
 */

jest.mock("../lib/apiFetch", () => ({
  apiFetch: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { apiFetch } = require("../lib/apiFetch") as {
  apiFetch: jest.MockedFunction<() => Promise<Response>>;
};

import { fetchScoutingPhotoUrl } from "../lib/scoutingPhotosApi";

function okResponse(payload: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  } as unknown as Response;
}

function errorResponse(status = 404): Response {
  return { ok: false, status, json: async () => ({}) } as unknown as Response;
}

const FARM_ID = 5;
const SCOUTING_ID = 12;
const PHOTO_ID = 34;
const EXPECTED_URL =
  `/api/farms/${FARM_ID}/vineyard-scouting/${SCOUTING_ID}/photos/${PHOTO_ID}/url`;

beforeEach(() => {
  apiFetch.mockReset();
});

describe("fetchScoutingPhotoUrl", () => {
  it("requests the single-photo URL endpoint and returns the fresh URL", async () => {
    apiFetch.mockResolvedValueOnce(
      okResponse({ downloadUrl: "https://cdn.example.com/fresh.jpg" }),
    );

    await expect(
      fetchScoutingPhotoUrl(FARM_ID, SCOUTING_ID, PHOTO_ID),
    ).resolves.toBe("https://cdn.example.com/fresh.jpg");
    expect(apiFetch).toHaveBeenCalledWith(EXPECTED_URL);
  });

  it("returns null for an unsuccessful response", async () => {
    apiFetch.mockResolvedValueOnce(errorResponse(404));

    await expect(
      fetchScoutingPhotoUrl(FARM_ID, SCOUTING_ID, PHOTO_ID),
    ).resolves.toBeNull();
  });

  it("returns null when the network request fails", async () => {
    apiFetch.mockRejectedValueOnce(new Error("Network error"));

    await expect(
      fetchScoutingPhotoUrl(FARM_ID, SCOUTING_ID, PHOTO_ID),
    ).resolves.toBeNull();
  });
});