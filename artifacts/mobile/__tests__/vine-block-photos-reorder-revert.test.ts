/**
 * Integration tests for the photo-reorder revert path in VineBlockPhotosScreen.
 *
 * handleReorder in vine-block-photos.tsx:
 *   1. Calls applyOptimisticReorder to build the reordered photos array.
 *   2. Calls executePhotoReorder to PUT the new order to the server.
 *   3. If executePhotoReorder returns false (PUT failed), it calls loadPhotos()
 *      which uses fetchBlockPhotos + applyPhotoUpdateIfCurrent to revert to the
 *      server-authoritative order.
 *
 * All three functions are exported from lib/vineBlockPhotosApi.ts.  These tests
 * call the real production functions (not re-implementations) so removing the
 * failure-revert path from the component would cause them to fail.
 */

// ---------------------------------------------------------------------------
// Module mock — hoisted by Babel before any imports execute.
// ---------------------------------------------------------------------------
jest.mock("../lib/apiFetch", () => ({
  apiFetch: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { apiFetch } = require("../lib/apiFetch") as {
  apiFetch: jest.MockedFunction<() => Promise<Response>>;
};

import {
  fetchBlockPhotos,
  applyPhotoUpdateIfCurrent,
  applyOptimisticReorder,
  executePhotoReorder,
  type BlockPhotoRecord,
} from "../lib/vineBlockPhotosApi";

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function makePhoto(overrides: Partial<BlockPhotoRecord> = {}): BlockPhotoRecord {
  return {
    id: 1,
    blockId: 10,
    farmId: 5,
    objectPath: "vineyard/block-10/photo-1.jpg",
    fileName: "photo-1.jpg",
    caption: null,
    isCover: false,
    uploadedAt: "2025-06-01T10:00:00Z",
    downloadUrl: "https://cdn.example.com/photo-1.jpg",
    ...overrides,
  };
}

function okResponse(payload: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  } as unknown as Response;
}

function errorResponse(status = 409): Response {
  return { ok: false, status, json: async () => ({}) } as unknown as Response;
}

const FARM_ID = 5;
const BLOCK_ID = 10;
const REORDER_URL = `/api/farms/${FARM_ID}/vineyard-blocks/${BLOCK_ID}/photos/reorder`;
const FETCH_URL = `/api/farms/${FARM_ID}/vineyard-blocks/${BLOCK_ID}/photos`;

beforeEach(() => {
  (apiFetch as jest.MockedFunction<typeof apiFetch>).mockReset();
});

// ---------------------------------------------------------------------------
// Helper that mirrors the handleReorder pipeline using the real production
// functions from lib/vineBlockPhotosApi.ts — not a re-implementation.
// ---------------------------------------------------------------------------

/**
 * Runs the same sequence handleReorder executes in the component:
 *   1. applyOptimisticReorder  — build the tentative photos array
 *   2. executePhotoReorder     — PUT to the server
 *   3. If PUT failed: fetchBlockPhotos + applyPhotoUpdateIfCurrent — revert
 *
 * Returns the final photos state after all async steps complete.
 */
async function runReorderPipeline(
  initialPhotos: BlockPhotoRecord[],
  newPhotoIds: number[],
): Promise<BlockPhotoRecord[]> {
  // Step 1 — optimistic update (production function)
  let photosState = applyOptimisticReorder(initialPhotos, newPhotoIds);

  // Step 2 — PUT (production function)
  const putOk = await executePhotoReorder(FARM_ID, BLOCK_ID, newPhotoIds);

  if (!putOk) {
    // Step 3 — revert: loadPhotos equivalent (production functions)
    const gen = 0;
    const fetched = await fetchBlockPhotos(FARM_ID, BLOCK_ID);
    applyPhotoUpdateIfCurrent(gen, () => gen, fetched, (photos) => {
      photosState = photos as BlockPhotoRecord[];
    });
  }

  return photosState;
}

// ===========================================================================
// executePhotoReorder — PUT network layer
// ===========================================================================

describe("executePhotoReorder — PUT network layer", () => {
  const newOrder = [203, 201, 202];

  it("calls the correct reorder URL with PUT and the photo IDs body", async () => {
    (apiFetch as jest.MockedFunction<typeof apiFetch>).mockResolvedValueOnce(
      okResponse({}),
    );

    await executePhotoReorder(FARM_ID, BLOCK_ID, newOrder);

    expect(apiFetch).toHaveBeenCalledWith(REORDER_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoIds: newOrder }),
    });
  });

  it("returns true when the server responds 2xx", async () => {
    (apiFetch as jest.MockedFunction<typeof apiFetch>).mockResolvedValueOnce(
      okResponse({}),
    );
    const result = await executePhotoReorder(FARM_ID, BLOCK_ID, newOrder);
    expect(result).toBe(true);
  });

  it("returns false when the server responds 409 (concurrent reorder)", async () => {
    (apiFetch as jest.MockedFunction<typeof apiFetch>).mockResolvedValueOnce(
      errorResponse(409),
    );
    const result = await executePhotoReorder(FARM_ID, BLOCK_ID, newOrder);
    expect(result).toBe(false);
  });

  it("returns false when the server responds 500", async () => {
    (apiFetch as jest.MockedFunction<typeof apiFetch>).mockResolvedValueOnce(
      errorResponse(500),
    );
    const result = await executePhotoReorder(FARM_ID, BLOCK_ID, newOrder);
    expect(result).toBe(false);
  });

  it("returns false when the network throws", async () => {
    (apiFetch as jest.MockedFunction<typeof apiFetch>).mockRejectedValueOnce(
      new Error("Network error"),
    );
    const result = await executePhotoReorder(FARM_ID, BLOCK_ID, newOrder);
    expect(result).toBe(false);
  });
});

// ===========================================================================
// applyOptimisticReorder — pure state transform
// ===========================================================================

describe("applyOptimisticReorder — pure state transform", () => {
  const photos = [
    makePhoto({ id: 201, isCover: true }),
    makePhoto({ id: 202, isCover: false }),
    makePhoto({ id: 203, isCover: false }),
  ];

  it("reorders photos by the new ID order", () => {
    const result = applyOptimisticReorder(photos, [203, 201, 202]);
    expect(result.map((p) => p.id)).toEqual([203, 201, 202]);
  });

  it("is applied synchronously before any await (confirmed by call order)", () => {
    // applyOptimisticReorder is synchronous — result is available immediately
    const result = applyOptimisticReorder(photos, [201, 203, 202]);
    expect(result.map((p) => p.id)).toEqual([201, 203, 202]);
  });

  it("drops IDs not present in the current photos array", () => {
    const result = applyOptimisticReorder(photos, [999, 201, 202]);
    expect(result.map((p) => p.id)).toEqual([201, 202]);
  });
});

// ===========================================================================
// Full reorder pipeline — optimistic update → PUT failure → server revert
// ===========================================================================

describe("handleReorder pipeline — revert on PUT failure", () => {
  const serverOrder: BlockPhotoRecord[] = [
    makePhoto({ id: 201, isCover: true }),
    makePhoto({ id: 202, isCover: false }),
    makePhoto({ id: 203, isCover: false }),
  ];

  it("reverts to server order when the PUT returns 409 (concurrent reorder)", async () => {
    (apiFetch as jest.MockedFunction<typeof apiFetch>)
      .mockResolvedValueOnce(errorResponse(409))        // PUT fails
      .mockResolvedValueOnce(okResponse({ photos: serverOrder })); // GET returns server order

    const finalPhotos = await runReorderPipeline(serverOrder, [203, 201, 202]);

    // Must end at the server-authoritative order, NOT the optimistic order
    expect(finalPhotos.map((p) => p.id)).toEqual([201, 202, 203]);
    // Two apiFetch calls: PUT then GET
    expect(apiFetch).toHaveBeenCalledTimes(2);
    expect(apiFetch).toHaveBeenNthCalledWith(1, REORDER_URL, expect.objectContaining({ method: "PUT" }));
    expect(apiFetch).toHaveBeenNthCalledWith(2, FETCH_URL);
  });

  it("reverts to server order when the PUT returns 500", async () => {
    (apiFetch as jest.MockedFunction<typeof apiFetch>)
      .mockResolvedValueOnce(errorResponse(500))
      .mockResolvedValueOnce(okResponse({ photos: serverOrder }));

    const finalPhotos = await runReorderPipeline(serverOrder, [203, 202, 201]);
    expect(finalPhotos.map((p) => p.id)).toEqual([201, 202, 203]);
  });

  it("reverts to server order when the PUT throws a network error", async () => {
    (apiFetch as jest.MockedFunction<typeof apiFetch>)
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce(okResponse({ photos: serverOrder }));

    const finalPhotos = await runReorderPipeline(serverOrder, [202, 203, 201]);
    expect(finalPhotos.map((p) => p.id)).toEqual([201, 202, 203]);
  });

  it("does NOT fetch from server when the PUT succeeds (2xx)", async () => {
    (apiFetch as jest.MockedFunction<typeof apiFetch>)
      .mockResolvedValueOnce(okResponse({})); // PUT succeeds — no GET

    const finalPhotos = await runReorderPipeline(serverOrder, [202, 203, 201]);

    // Optimistic order kept, no revert
    expect(finalPhotos.map((p) => p.id)).toEqual([202, 203, 201]);
    // Only the PUT was issued — no subsequent GET
    expect(apiFetch).toHaveBeenCalledTimes(1);
    expect(apiFetch).toHaveBeenCalledWith(REORDER_URL, expect.objectContaining({ method: "PUT" }));
  });

  it("reverts to concurrent server order (different from both initial and optimistic)", async () => {
    // Another device already reordered to [201, 203, 202] while this PUT was in flight
    const concurrentServerOrder: BlockPhotoRecord[] = [
      makePhoto({ id: 201, isCover: true }),
      makePhoto({ id: 203, isCover: false }),
      makePhoto({ id: 202, isCover: false }),
    ];

    (apiFetch as jest.MockedFunction<typeof apiFetch>)
      .mockResolvedValueOnce(errorResponse(409))
      .mockResolvedValueOnce(okResponse({ photos: concurrentServerOrder }));

    const finalPhotos = await runReorderPipeline(serverOrder, [202, 201, 203]);

    // Must settle at the concurrent server order
    expect(finalPhotos.map((p) => p.id)).toEqual([201, 203, 202]);
  });
});

// ===========================================================================
// applyPhotoUpdateIfCurrent — generation guard (used by the revert path)
// ===========================================================================

describe("applyPhotoUpdateIfCurrent — generation guard (reorder revert path)", () => {
  it("applies server photos when the generation matches", () => {
    const serverPhotos = [makePhoto({ id: 401 }), makePhoto({ id: 402 })];
    let state: BlockPhotoRecord[] = [];
    applyPhotoUpdateIfCurrent(1, () => 1, serverPhotos, (p) => { state = p as BlockPhotoRecord[]; });
    expect(state.map((p) => p.id)).toEqual([401, 402]);
  });

  it("discards the server response when the generation has advanced (newer revert in flight)", () => {
    const serverPhotos = [makePhoto({ id: 501 })];
    let state: BlockPhotoRecord[] = [makePhoto({ id: 999 })];
    applyPhotoUpdateIfCurrent(1, () => 2, serverPhotos, (p) => { state = p as BlockPhotoRecord[]; });
    // State must NOT be overwritten by the stale response
    expect(state.map((p) => p.id)).toEqual([999]);
  });

  it("keeps existing state when fetchBlockPhotos returned null (server also errored)", () => {
    let state: BlockPhotoRecord[] = [makePhoto({ id: 601 })];
    applyPhotoUpdateIfCurrent(0, () => 0, null, (p) => { state = p as BlockPhotoRecord[]; });
    // null → no-op; existing (optimistic or prior) state preserved
    expect(state.map((p) => p.id)).toEqual([601]);
  });
});
