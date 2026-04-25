import { Router, type IRouter, type Request, type Response } from "express";
import { Readable } from "stream";
import { db } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { ObjectStorageService, ObjectNotFoundError } from "../lib/objectStorage";
import { requireAuth } from "../middlewares/roleMiddleware";
import {
  farmRecordAttachmentsTable,
  farmsTable,
  userTenantsTable,
} from "@workspace/db";

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

interface RequestUploadUrlBodyType {
  name: string;
  size: number;
  contentType: string;
}

function validateUploadBody(body: unknown): body is RequestUploadUrlBodyType {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return typeof b.name === "string" && b.name.length > 0 &&
    typeof b.size === "number" && b.size >= 0 &&
    typeof b.contentType === "string" && b.contentType.length > 0;
}

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();

/**
 * POST /storage/uploads/request-url
 *
 * Request a presigned URL for file upload.
 * The client sends JSON metadata (name, size, contentType) — NOT the file.
 * Then uploads the file directly to the returned presigned URL.
 *
 * Enforces: max 25 MB per file; MIME type allowlist.
 */
router.post("/storage/uploads/request-url", requireAuth, async (req: Request, res: Response) => {
  if (!validateUploadBody(req.body)) {
    res.status(400).json({ error: "Missing or invalid required fields" });
    return;
  }

  const { name, size, contentType } = req.body;

  // Server-side file size enforcement
  if (size > MAX_FILE_SIZE_BYTES) {
    res.status(413).json({ error: `File too large. Maximum size is ${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB.` });
    return;
  }

  // Server-side MIME type allowlist
  if (!ALLOWED_MIME_TYPES.has(contentType)) {
    res.status(415).json({
      error: "File type not permitted. Allowed types: JPEG, PNG, WebP, GIF, HEIC, PDF, Word documents.",
    });
    return;
  }

  try {
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);

    res.json({
      uploadURL,
      objectPath,
      metadata: { name, size, contentType },
    });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
});

/**
 * GET /storage/public-objects/*
 *
 * Serve public assets from PUBLIC_OBJECT_SEARCH_PATHS.
 * These are unconditionally public — no authentication or ACL checks.
 */
router.get("/storage/public-objects/*filePath", async (req: Request, res: Response) => {
  try {
    const raw = req.params.filePath;
    const filePath = Array.isArray(raw) ? raw.join("/") : raw;
    const file = await objectStorageService.searchPublicObject(filePath);
    if (!file) {
      res.status(404).json({ error: "File not found" });
      return;
    }

    const response = await objectStorageService.downloadObject(file);

    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));

    if (response.body) {
      const nodeStream = Readable.fromWeb(response.body as ReadableStream<Uint8Array>);
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    console.error("Error serving public object:", error);
    res.status(500).json({ error: "Failed to serve public object" });
  }
});

/**
 * GET /storage/objects/*
 *
 * Serve private object entities from PRIVATE_OBJECT_DIR.
 *
 * Access control:
 *   1. User must be authenticated (Clerk session required).
 *   2. The requested object path must be linked to a farm in the database.
 *   3. That farm must belong to a tenant the requesting user is a member of.
 *
 * This prevents authenticated users from accessing other tenants' attachments
 * even if they know (or guess) the object path UUID.
 */
router.get("/storage/objects/*path", requireAuth, async (req: Request, res: Response) => {
  const raw = req.params.path;
  const wildcardPath = Array.isArray(raw) ? raw.join("/") : raw;
  const objectPath = `/objects/${wildcardPath}`;
  const userId = (req as Request & { userId?: string }).userId;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    // Look up the attachment record to find which farm this file belongs to.
    const [attachment] = await db
      .select({ farmId: farmRecordAttachmentsTable.farmId })
      .from(farmRecordAttachmentsTable)
      .where(eq(farmRecordAttachmentsTable.fileKey, objectPath))
      .limit(1);

    if (!attachment) {
      // If the path isn't in farm_record_attachments, deny access.
      // Legitimate files are always registered in the database when uploaded.
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    // Look up the farm's tenant.
    const [farm] = await db
      .select({ tenantId: farmsTable.tenantId })
      .from(farmsTable)
      .where(eq(farmsTable.id, attachment.farmId))
      .limit(1);

    if (!farm) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    // Verify the requesting user is a member of that tenant.
    const [membership] = await db
      .select({ id: userTenantsTable.id })
      .from(userTenantsTable)
      .where(
        and(
          eq(userTenantsTable.userId, userId),
          eq(userTenantsTable.tenantId, farm.tenantId)
        )
      )
      .limit(1);

    if (!membership) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const objectFile = await objectStorageService.getObjectEntityFile(objectPath);
    const response = await objectStorageService.downloadObject(objectFile);

    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));

    if (response.body) {
      const nodeStream = Readable.fromWeb(response.body as ReadableStream<Uint8Array>);
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    console.error("Error serving object:", error);
    if (error instanceof ObjectNotFoundError) {
      res.status(404).json({ error: "Object not found" });
      return;
    }
    res.status(500).json({ error: "Failed to serve object" });
  }
});

export default router;
