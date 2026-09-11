jest.mock("../lib/database", () => ({
  kvGet: jest.fn(async () => null),
}));
jest.mock("../lib/authToken", () => ({
  getMobileAuthToken: jest.fn(async () => null),
}));
jest.mock("../lib/uploadPhoto", () => ({
  getApiBase: jest.fn(() => "https://api.example.test"),
}));

import {
  apiFetch,
  FORCE_SCOUTING_PHOTO_CAPTION_FAILURE_HEADER,
} from "../lib/apiFetch";

const fetchMock = jest.fn();

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockResolvedValue({ ok: true } as Response);
  (global as unknown as { fetch: jest.Mock }).fetch = fetchMock;
});

afterEach(() => {
  delete (global as Record<string, unknown>).__DEV__;
});

describe("scouting-photo caption-failure device check", () => {
  it("adds the test header only when a development build explicitly arms it", async () => {
    (global as Record<string, unknown>).__DEV__ = true;

    await apiFetch("/api/farms/5/vineyard-scouting/12/photos/34", {
      method: "PATCH",
      forceScoutingPhotoCaptionFailure: true,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.test/api/farms/5/vineyard-scouting/12/photos/34",
      expect.objectContaining({
        headers: expect.objectContaining({
          [FORCE_SCOUTING_PHOTO_CAPTION_FAILURE_HEADER]: "true",
        }),
      }),
    );
  });

  it("does not send the test header from a release build", async () => {
    (global as Record<string, unknown>).__DEV__ = false;

    await apiFetch("/api/farms/5/vineyard-scouting/12/photos/34", {
      method: "PATCH",
      forceScoutingPhotoCaptionFailure: true,
    });

    const requestOptions = fetchMock.mock.calls[0][1] as RequestInit;
    expect(requestOptions.headers).not.toHaveProperty(
      FORCE_SCOUTING_PHOTO_CAPTION_FAILURE_HEADER,
    );
  });
});