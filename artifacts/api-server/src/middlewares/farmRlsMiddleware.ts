import type { Request, Response, NextFunction } from "express";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, and } from "drizzle-orm";
import { pool, rlsContext, db, dbSchema, farmsTable } from "@workspace/db";

/**
 * Express middleware for farm-scoped routes (/farms/:farmId/*).
 *
 * 1. Validates that :farmId belongs to req.tenantId (replaces per-route
 *    validateFarmAccess DB calls — validateFarmAccess short-circuits when
 *    req.validatedFarmId is already set by this middleware).
 * 2. Opens a dedicated PostgreSQL connection and starts a transaction with
 *    SET LOCAL app.current_farm_id = <farmId> so all DB queries within the
 *    request run under PostgreSQL Row-Level Security.
 * 3. Injects the transaction-bound Drizzle client into AsyncLocalStorage so
 *    the existing db.* calls in route handlers transparently use it — no
 *    route handler changes are needed.
 * 4. Commits on 2xx/3xx response, rolls back on 4xx/5xx or error.
 *
 * Register BEFORE route definitions:
 *   router.use('/farms/:farmId', requireAuth, requireTenant, farmRlsMiddleware);
 */
export async function farmRlsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const farmId = parseInt(req.params.farmId as string, 10);
  if (isNaN(farmId) || farmId <= 0) {
    res.status(400).json({ error: "Invalid farm ID" });
    return;
  }

  // Validate that the farm belongs to the authenticated tenant.
  const [farm] = await db
    .select({ id: farmsTable.id })
    .from(farmsTable)
    .where(and(eq(farmsTable.id, farmId), eq(farmsTable.tenantId, req.tenantId!)))
    .limit(1);

  if (!farm) {
    res.status(404).json({ error: "Farm not found" });
    return;
  }

  // Cache validated farmId so validateFarmAccess() can skip the DB round-trip.
  (req as Request & { validatedFarmId?: number }).validatedFarmId = farmId;

  // Acquire a dedicated connection for this request's RLS transaction.
  const client = await pool.connect();
  let closed = false;

  const closeClient = async (commit: boolean) => {
    if (closed) return;
    closed = true;
    try {
      await client.query(commit ? "COMMIT" : "ROLLBACK");
    } catch {
      // Best-effort cleanup — swallow errors so the response isn't affected.
    } finally {
      client.release();
    }
  };

  // Commit when response succeeds (2xx/3xx); rollback on client/server errors.
  res.on("finish", () => void closeClient(res.statusCode < 400));
  res.on("error", () => void closeClient(false));

  try {
    await client.query("BEGIN");
    // SET LOCAL scopes the context variable to this transaction, preventing
    // context leakage across pooled connections when the transaction ends.
    await client.query("SELECT set_app_tenant($1)", [farmId]);

    // Transaction-bound Drizzle instance — shares the schema type so the
    // Proxy db in lib/db/src/index.ts can use it for all route handler queries.
    const txDb = drizzle(client, { schema: dbSchema }) as unknown as typeof db;

    // Run the route handler inside the RLS context. AsyncLocalStorage
    // propagates through async/await chains so all db.* calls in the handler
    // automatically use txDb without any handler-level code changes.
    rlsContext.run(txDb, next);
  } catch (err) {
    await closeClient(false);
    next(err);
  }
}
