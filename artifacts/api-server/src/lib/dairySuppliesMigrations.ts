import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

/**
 * Idempotent migrations for Dairy Supplies (drawdowns & restock requests).
 * Safe to run on every startup — uses CREATE TABLE IF NOT EXISTS.
 */
export async function runDairySuppliesMigrations(): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS dairy_supply_drawdowns (
      id                  serial PRIMARY KEY,
      farm_id             integer NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
      dairy_type          text NOT NULL,
      drawdown_date       date NOT NULL,
      item_type           text NOT NULL,
      item_name           text NOT NULL,
      ppe_stock_item_id   integer REFERENCES ppe_stock_items(id) ON DELETE SET NULL,
      chem_stock_item_id  integer REFERENCES stock_items(id) ON DELETE SET NULL,
      quantity_used       numeric(10,3) NOT NULL,
      unit                text NOT NULL,
      used_by             text,
      usage_context       text,
      notes               text,
      created_at          timestamptz NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_dairy_supply_drawdowns_farm ON dairy_supply_drawdowns(farm_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_dairy_supply_drawdowns_type ON dairy_supply_drawdowns(farm_id, dairy_type)`);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS dairy_restock_requests (
      id                  serial PRIMARY KEY,
      farm_id             integer NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
      dairy_type          text NOT NULL,
      request_date        date NOT NULL,
      item_type           text NOT NULL,
      item_name           text NOT NULL,
      ppe_stock_item_id   integer REFERENCES ppe_stock_items(id) ON DELETE SET NULL,
      chem_stock_item_id  integer REFERENCES stock_items(id) ON DELETE SET NULL,
      requested_qty       numeric(10,2) NOT NULL,
      unit                text NOT NULL,
      urgency             text NOT NULL DEFAULT 'normal',
      requested_by        text,
      reason              text,
      status              text NOT NULL DEFAULT 'pending',
      admin_notes         text,
      resolved_by         text,
      resolved_at         timestamptz,
      created_at          timestamptz NOT NULL DEFAULT now(),
      updated_at          timestamptz NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_dairy_restock_requests_farm ON dairy_restock_requests(farm_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_dairy_restock_requests_status ON dairy_restock_requests(farm_id, status)`);

  await db.execute(sql`ALTER TABLE dairy_restock_requests ADD COLUMN IF NOT EXISTS supplier_name text`);
  await db.execute(sql`ALTER TABLE dairy_restock_requests ADD COLUMN IF NOT EXISTS supplier_order_ref text`);
  await db.execute(sql`ALTER TABLE dairy_restock_requests ADD COLUMN IF NOT EXISTS qty_received numeric(10,2)`);
  await db.execute(sql`ALTER TABLE dairy_restock_requests ADD COLUMN IF NOT EXISTS received_by text`);
}
