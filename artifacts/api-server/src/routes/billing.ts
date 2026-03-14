import { Router, type IRouter, type Request, type Response } from "express";
import { db, tenantsTable, subscriptionsTable, modulesTable, farmsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, requireTenant } from "../middlewares/roleMiddleware";
import Stripe from "stripe";
import express from "express";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(key);
}

const router: IRouter = Router();

router.post("/billing/checkout", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const { farmId, moduleIds } = req.body as { farmId: number; moduleIds: number[] };

  if (!farmId || !moduleIds?.length) {
    res.status(400).json({ error: "farmId and moduleIds are required" });
    return;
  }

  const [farm] = await db
    .select()
    .from(farmsTable)
    .where(and(eq(farmsTable.id, farmId), eq(farmsTable.tenantId, req.tenantId!)))
    .limit(1);

  if (!farm) {
    res.status(404).json({ error: "Farm not found" });
    return;
  }

  const modules = await db
    .select()
    .from(modulesTable)
    .where(eq(modulesTable.isActive, true));

  const selectedModules = modules.filter((m) => moduleIds.includes(m.id));
  if (selectedModules.length === 0) {
    res.status(400).json({ error: "No valid modules selected" });
    return;
  }

  let stripe: Stripe;
  try {
    stripe = getStripe();
  } catch {
    res.status(503).json({ error: "Stripe is not configured yet" });
    return;
  }

  const [tenant] = await db
    .select()
    .from(tenantsTable)
    .where(eq(tenantsTable.id, req.tenantId!))
    .limit(1);

  let customerId = tenant.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: tenant.contactEmail,
      name: tenant.name,
      metadata: { tenantId: String(tenant.id) },
    });
    customerId = customer.id;
    await db
      .update(tenantsTable)
      .set({ stripeCustomerId: customerId })
      .where(eq(tenantsTable.id, tenant.id));
  }

  const lineItems = selectedModules.map((mod) => ({
    price_data: {
      currency: "gbp",
      product_data: {
        name: `${mod.name} — ${farm.name}`,
        metadata: { moduleId: String(mod.id), farmId: String(farm.id) },
      },
      unit_amount: mod.monthlyPricePence,
      recurring: { interval: "month" as const },
    },
    quantity: 1,
  }));

  const origin = `${req.headers["x-forwarded-proto"] || "https"}://${req.headers["x-forwarded-host"] || req.headers["host"]}`;

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: lineItems,
    success_url: `${origin}/dashboard/?checkout=success`,
    cancel_url: `${origin}/dashboard/?checkout=cancel`,
    metadata: {
      tenantId: String(req.tenantId),
      farmId: String(farmId),
      moduleIds: JSON.stringify(moduleIds),
    },
  });

  res.json({ checkoutUrl: session.url });
});

router.get("/billing/subscriptions", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const subs = await db
    .select({
      id: subscriptionsTable.id,
      farmId: subscriptionsTable.farmId,
      moduleId: subscriptionsTable.moduleId,
      moduleName: modulesTable.name,
      status: subscriptionsTable.status,
      currentPeriodEnd: subscriptionsTable.currentPeriodEnd,
    })
    .from(subscriptionsTable)
    .innerJoin(modulesTable, eq(subscriptionsTable.moduleId, modulesTable.id))
    .where(eq(subscriptionsTable.tenantId, req.tenantId!));

  res.json({ subscriptions: subs });
});

router.post("/billing/webhook", express.raw({ type: "application/json" }), async (req: Request, res: Response): Promise<void> => {
  let stripe: Stripe;
  try {
    stripe = getStripe();
  } catch {
    res.status(503).json({ error: "Stripe not configured" });
    return;
  }

  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    res.status(503).json({ error: "Webhook secret not configured" });
    return;
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch {
    res.status(400).json({ error: "Invalid webhook signature" });
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata;
    if (metadata?.tenantId && metadata?.farmId && metadata?.moduleIds) {
      const tenantId = parseInt(metadata.tenantId, 10);
      const farmId = parseInt(metadata.farmId, 10);
      const moduleIds: number[] = JSON.parse(metadata.moduleIds);

      for (const moduleId of moduleIds) {
        await db.insert(subscriptionsTable).values({
          tenantId,
          farmId,
          moduleId,
          stripeSubscriptionId: session.subscription as string,
          status: "active",
        });
      }
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    await db
      .update(subscriptionsTable)
      .set({ status: "cancelled" })
      .where(eq(subscriptionsTable.stripeSubscriptionId, subscription.id));
  }

  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;
    const updateData: Record<string, unknown> = { status: subscription.status };
    if ("current_period_start" in subscription) {
      updateData.currentPeriodStart = new Date((subscription as Record<string, number>).current_period_start * 1000);
    }
    if ("current_period_end" in subscription) {
      updateData.currentPeriodEnd = new Date((subscription as Record<string, number>).current_period_end * 1000);
    }
    await db
      .update(subscriptionsTable)
      .set(updateData)
      .where(eq(subscriptionsTable.stripeSubscriptionId, subscription.id));
  }

  res.json({ received: true });
});

export default router;
