import { db } from "@workspace/db";
import { usersTable, userTenantsTable } from "@workspace/db/schema";
import { and, eq, isNotNull, ne, sql } from "drizzle-orm";

/**
 * Returns deduplicated phone numbers for all users in a tenant who:
 *   - have a phone number set
 *   - have SMS enabled (smsOptIn != 'none')
 *   - have the given alert category enabled, OR have smsCategories = null (legacy: all categories on)
 *
 * `category` is always one of our internal SmsCategory enum values — never user input.
 * Used by fire-and-forget SMS blocks in farms.ts routes.
 */
export async function tenantSmsRecipients(tenantId: number, category: string): Promise<string[]> {
  const rows = await db
    .select({ phone: usersTable.phoneNumber })
    .from(userTenantsTable)
    .innerJoin(usersTable, eq(userTenantsTable.userId, usersTable.id))
    .where(and(
      eq(userTenantsTable.tenantId, tenantId),
      isNotNull(usersTable.phoneNumber),
      ne(usersTable.smsOptIn, "none"),
      sql`(${usersTable.smsCategories} IS NULL OR COALESCE((${usersTable.smsCategories}->>${category})::boolean, true))`,
    ));
  const seen = new Set<string>();
  const phones: string[] = [];
  for (const row of rows) {
    if (row.phone && !seen.has(row.phone)) {
      seen.add(row.phone);
      phones.push(row.phone);
    }
  }
  return phones;
}
