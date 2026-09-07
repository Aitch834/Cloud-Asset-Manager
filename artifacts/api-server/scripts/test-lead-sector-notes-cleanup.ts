import assert from "node:assert/strict";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { runLeadsMigrations } from "../src/lib/leadsMigrations.js";

const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const fixtureSource = `lead-sector-notes-cleanup-${unique}`;
const retainedNote = `Follow up after harvest ${unique}`;
const fixtureIds: number[] = [];

try {
  const inserted = await db.execute(sql`
    INSERT INTO registration_leads (
      business_name,
      contact_name,
      email,
      farm_count,
      modules_interested,
      source,
      sector,
      notes
    )
    VALUES
      (
        ${`Sector-only ${unique}`},
        'Migration test',
        ${`sector-only-${unique}@example.invalid`},
        1,
        ARRAY['Crops']::text[],
        ${fixtureSource},
        'Arable',
        'Sector: Arable'
      ),
      (
        ${`Sector and note ${unique}`},
        'Migration test',
        ${`sector-note-${unique}@example.invalid`},
        1,
        ARRAY['Livestock']::text[],
        ${fixtureSource},
        'Livestock',
        ${`Sector: Livestock\n${retainedNote}`}
      )
    RETURNING id
  `);

  fixtureIds.push(
    ...(inserted.rows as Array<{ id: number }>).map((row) => row.id),
  );
  assert.equal(fixtureIds.length, 2, "Expected both lead fixtures to be inserted");

  await runLeadsMigrations();

  const result = await db.execute(sql`
    SELECT business_name, notes
    FROM registration_leads
    WHERE source = ${fixtureSource}
    ORDER BY business_name
  `);
  const rows = result.rows as Array<{
    business_name: string;
    notes: string | null;
  }>;

  assert.equal(rows.length, 2, "Expected both lead fixtures after cleanup");

  const sectorAndNote = rows.find((row) =>
    row.business_name.startsWith("Sector and note"),
  );
  const sectorOnly = rows.find((row) =>
    row.business_name.startsWith("Sector-only"),
  );

  assert.equal(
    sectorOnly?.notes,
    null,
    "A lead containing only a stale Sector line must store notes as NULL",
  );
  assert.equal(
    sectorAndNote?.notes,
    retainedNote,
    "A lead with another note line must retain that line after Sector cleanup",
  );

  console.log("Lead Sector notes cleanup regression check passed");
} finally {
  if (fixtureIds.length > 0) {
    await db.execute(sql`
      DELETE FROM registration_leads
      WHERE id IN (${sql.join(fixtureIds.map((id) => sql`${id}`), sql`, `)})
    `);
  }
}