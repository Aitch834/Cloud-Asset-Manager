import { Router, type IRouter, type Request, type Response } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/roleMiddleware";
import { getAuth } from "@clerk/express";

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
      });
    user = inserted;
  }

  if (!user) { res.status(500).json({ error: "Could not create user profile" }); return; }
  res.json(user);
});

router.put("/api/account/profile", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorised" }); return; }

  const { phoneNumber, smsOptIn } = req.body as { phoneNumber?: string; smsOptIn?: string };

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

export default router;
