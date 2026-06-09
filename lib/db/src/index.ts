import { drizzle } from "drizzle-orm/node-postgres";
import { AsyncLocalStorage } from "async_hooks";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Prevent idle/errored background pool clients from crashing the process.
// pg emits 'error' on the pool when a kept-alive connection is killed by the
// server (e.g. idle-in-transaction timeout). Without this handler Node throws.
pool.on("error", (err) => {
  console.error("[DB] Unexpected pool client error (connection will be discarded):", err.message);
});

// Underlying pool-backed Drizzle instance (used when no RLS context is active).
const _db = drizzle(pool, { schema });
type Db = typeof _db;

// Per-request RLS context: holds a transaction-bound Drizzle client when
// a farm-scoped request is being processed by farmRlsMiddleware.
// Exported so farmRlsMiddleware can inject the transaction client.
export const rlsContext = new AsyncLocalStorage<Db>();

// Proxy db: transparently routes all Drizzle calls to the per-request
// transaction client when inside a farm-scoped RLS context, otherwise falls
// back to the pool-backed instance. No route handler code needs to change.
export const db = new Proxy(_db, {
  get(target: Db, prop: string | symbol) {
    const source = (rlsContext.getStore() ?? target) as Db;
    const val = (source as unknown as Record<string | symbol, unknown>)[prop];
    return typeof val === "function" ? (val as Function).bind(source) : val;
  },
}) as Db;

// Named schema export for creating transaction-bound Drizzle instances.
export { schema as dbSchema };

export * from "./schema";
export { withTenantContext } from "./rls";
