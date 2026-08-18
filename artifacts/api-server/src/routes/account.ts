import { Router, type IRouter, type Request, type Response } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/roleMiddleware";
import { getAuth } from "@clerk/express";
import { sendWelcomeEmail } from "../lib/mailer";

const router: IRouter = Router();

const UK_PHONE_RE = /^\+44[0-9]{9,10}$/;

router.get("/api/account/profile", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorised" }); return; }

  let [user] = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
      phoneNumber: usersTable.phoneNumber,
      smsOptIn: usersTable.smsOptIn,
      smsConsentAt: usersTable.smsConsentAt,
      smsCategories: usersTable.smsCategories,
      emailSectorAlerts: usersTable.emailSectorAlerts,
    })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (!user) {
    // First sign-in via Clerk — seed a minimal profile row.
    // Pull display name from Clerk session claims if available.
    const clerkAuth = getAuth(req);
    const claims = clerkAuth?.sessionClaims as Record<string, unknown> | undefined;
    const email = (claims?.email ?? claims?.primary_email ?? null) as string | null;
    const firstName = (claims?.given_name ?? claims?.first_name ?? null) as string | null;
    const lastName = (claims?.family_name ?? claims?.last_name ?? null) as string | null;

    const [inserted] = await db
      .insert(usersTable)
      .values({ id: userId, email, firstName, lastName })
      .onConflictDoNothing()
      .returning({
        id: usersTable.id,
        email: usersTable.email,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        phoneNumber: usersTable.phoneNumber,
        smsOptIn: usersTable.smsOptIn,
        smsConsentAt: usersTable.smsConsentAt,
        smsCategories: usersTable.smsCategories,
        emailSectorAlerts: usersTable.emailSectorAlerts,
      });
    user = inserted;

    if (inserted && email) {
      sendWelcomeEmail({ to: email, firstName }).catch((err) =>
        console.error("[MAILER] Welcome email failed:", err)
      );
    }
  }

  if (!user) { res.status(500).json({ error: "Could not create user profile" }); return; }
  res.json(user);
});

router.put("/api/account/profile", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorised" }); return; }

  const { phoneNumber, smsOptIn, smsCategories, consentGiven, emailSectorAlerts } = req.body as {
    phoneNumber?: string;
    smsOptIn?: string;
    smsCategories?: Record<string, boolean> | null;
    consentGiven?: boolean;
    emailSectorAlerts?: boolean;
  };

  const validSmsOptIn = ["all", "critical", "none"];
  if (smsOptIn !== undefined && !validSmsOptIn.includes(smsOptIn)) {
    res.status(400).json({ error: "Invalid smsOptIn value. Must be: all, critical, or none." });
    return;
  }

  if (phoneNumber !== undefined && phoneNumber !== "" && !UK_PHONE_RE.test(phoneNumber)) {
    res.status(400).json({ error: "Phone number must be a valid UK number in E.164 format, e.g. +447911123456" });
    return;
  }

  const updates: Record<string, unknown> = {};

  if (phoneNumber !== undefined) {
    updates.phoneNumber = phoneNumber === "" ? null : phoneNumber;
  }

  if (smsOptIn !== undefined) {
    updates.smsOptIn = smsOptIn;
    if (smsOptIn !== "none") {
      updates.smsConsentAt = new Date();
    }
  }

  if (smsCategories !== undefined) {
    updates.smsCategories = smsCategories;
  }

  if (consentGiven === true && smsOptIn !== "none") {
    updates.smsConsentAt = new Date();
  }

  if (emailSectorAlerts !== undefined) {
    updates.emailSectorAlerts = Boolean(emailSectorAlerts);
  }

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "No valid fields to update" });
    return;
  }

  await db
    .update(usersTable)
    .set(updates)
    .where(eq(usersTable.id, userId));

  res.json({ success: true });
});

// ---------------------------------------------------------------------------
// UI Preferences — per-user hint dismissal flags synced across devices
// ---------------------------------------------------------------------------

router.get("/api/account/ui-prefs", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorised" }); return; }

  // Upsert a default row for brand-new users who haven't hit /profile yet.
  const [row] = await db
    .insert(usersTable)
    .values({ id: userId, uiPrefs: {} })
    .onConflictDoUpdate({
      target: usersTable.id,
      set: { updatedAt: sql`NOW()` },
    })
    .returning({ uiPrefs: usersTable.uiPrefs });

  res.json({ uiPrefs: row?.uiPrefs ?? {} });
});

router.patch("/api/account/ui-prefs", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorised" }); return; }

  const body = req.body as Record<string, unknown>;

  // Only accept string keys mapping to boolean values — ignore anything else.
  const patch: Record<string, boolean> = {};
  for (const [key, val] of Object.entries(body)) {
    if (typeof key === "string" && typeof val === "boolean") {
      patch[key] = val;
    }
  }

  if (Object.keys(patch).length === 0) {
    res.status(400).json({ error: "Body must contain at least one { key: boolean } entry" });
    return;
  }

  // Strip stale WineGB dismissal keys from the incoming patch before writing.
  // Keys follow the pattern winegb_<survey-name>_<YYYY> (survey names may contain
  // accented characters such as "véraison").  Any key whose trailing year is older
  // than the current year is dropped here so that neither the INSERT (new-user)
  // path nor the UPDATE (existing-user) path can re-introduce stale entries.
  const currentYear = new Date().getFullYear();
  const staleWineGbKey = (k: string): boolean => {
    const m = /^winegb_.+_(\d{4})$/.exec(k);
    return m !== null && parseInt(m[1], 10) < currentYear;
  };
  for (const key of Object.keys(patch)) {
    if (staleWineGbKey(key)) delete patch[key];
  }

  // Note: patch may now be empty if all keys were stale WineGB entries.
  // We still proceed with the upsert so the UPDATE expression runs its
  // SQL-side pruning on any stale keys already persisted in the JSONB
  // column for this user.  For a brand-new user (INSERT path) an empty
  // patch stores '{}' which is correct — they have no prior stale entries.

  // Upsert: create the row if it doesn't exist yet, then merge the patch into
  // the existing JSONB column, also pruning any stale WineGB keys that were
  // already persisted in the JSONB (same regex applied via SQL).
  await db
    .insert(usersTable)
    .values({ id: userId, uiPrefs: patch })
    .onConflictDoUpdate({
      target: usersTable.id,
      set: {
        uiPrefs: sql`(
          SELECT COALESCE(jsonb_object_agg(kv.key, kv.value), '{}'::jsonb)
          FROM jsonb_each(
            COALESCE(users.ui_prefs, '{}'::jsonb) || ${JSON.stringify(patch)}::jsonb
          ) AS kv(key, value)
          WHERE NOT (
            kv.key ~ '^winegb_.+_[0-9]{4}$'
            AND (regexp_match(kv.key, '_([0-9]{4})$'))[1]::int < ${currentYear}
          )
        )`,
      },
    });

  res.json({ success: true });
});

export default router;
