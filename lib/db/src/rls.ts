import type { Pool, PoolClient } from "pg";

/**
 * Run a callback inside a transaction with the current farm tenant context
 * set via PostgreSQL session configuration.
 *
 * Uses SET LOCAL so the context variable (app.current_farm_id) is automatically
 * cleared when the transaction ends — preventing context leakage across pooled
 * connections.
 *
 * Example:
 *   const rows = await withTenantContext(pool, farmId, async (client) => {
 *     const result = await client.query(
 *       'SELECT * FROM farms WHERE id = $1', [farmId]
 *     );
 *     return result.rows;
 *   });
 */
export async function withTenantContext<T>(
  pool: Pool,
  farmId: number,
  callback: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT set_app_tenant($1)", [farmId]);
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
