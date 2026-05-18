import { type Request, type Response, type NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { db, userTenantsTable, tenantsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

declare global {
  namespace Express {
    interface Request {
      tenantId?: number;
      tenantSlug?: string;
      userRole?: string;
      roleId?: number;
      isSuperAdmin?: boolean;
      isImpersonating?: boolean;
      originalUserId?: string;
    }
  }
}

export async function tenantMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.userId) {
    // Try to resolve userId from Clerk session (so tenant context works for
    // routes that only use requireTenant without an explicit requireAuth).
    const auth = getAuth(req);
    const clerkUserId =
      (auth?.sessionClaims?.userId as string | undefined) ?? auth?.userId;
    if (!clerkUserId) {
      next();
      return;
    }
    req.userId = clerkUserId;
  }

  const tenantSlug = req.headers["x-tenant-slug"] as string | undefined;

  if (!tenantSlug) {
    next();
    return;
  }

  // Dev bypass: grant super-admin access without a DB membership record
  if (req.isBypassMode) {
    const [tenant] = await db
      .select()
      .from(tenantsTable)
      .where(and(eq(tenantsTable.slug, tenantSlug), eq(tenantsTable.isActive, true)))
      .limit(1);

    if (!tenant) {
      res.status(404).json({ error: "Tenant not found" });
      return;
    }

    req.tenantId = tenant.id;
    req.tenantSlug = tenant.slug;
    req.isSuperAdmin = true;
    next();
    return;
  }

  const [tenant] = await db
    .select()
    .from(tenantsTable)
    .where(and(eq(tenantsTable.slug, tenantSlug), eq(tenantsTable.isActive, true)))
    .limit(1);

  if (!tenant) {
    res.status(404).json({ error: "Tenant not found" });
    return;
  }

  const [callerMembership] = await db
    .select()
    .from(userTenantsTable)
    .where(
      and(
        eq(userTenantsTable.userId, req.userId),
        eq(userTenantsTable.tenantId, tenant.id),
        eq(userTenantsTable.isActive, true),
      ),
    )
    .limit(1);

  const isSuperAdmin = callerMembership?.isSuperAdmin || false;
  let hasPlatformSuperAdmin = isSuperAdmin;

  if (!hasPlatformSuperAdmin) {
    const superAdminAny = await db
      .select()
      .from(userTenantsTable)
      .where(
        and(
          eq(userTenantsTable.userId, req.userId),
          eq(userTenantsTable.isSuperAdmin, true),
          eq(userTenantsTable.isActive, true),
        ),
      )
      .limit(1);
    hasPlatformSuperAdmin = superAdminAny.length > 0;
  }

  const impersonateUserId = req.headers["x-impersonate-user"] as string | undefined;
  if (impersonateUserId && hasPlatformSuperAdmin) {
    const [targetMembership] = await db
      .select()
      .from(userTenantsTable)
      .where(
        and(
          eq(userTenantsTable.userId, impersonateUserId),
          eq(userTenantsTable.tenantId, tenant.id),
          eq(userTenantsTable.isActive, true),
        ),
      )
      .limit(1);

    if (targetMembership) {
      req.tenantId = tenant.id;
      req.tenantSlug = tenant.slug;
      req.roleId = targetMembership.roleId;
      req.isSuperAdmin = false;
      req.isImpersonating = true;
      req.originalUserId = req.userId;
      next();
      return;
    }
  }

  if (!callerMembership) {
    if (hasPlatformSuperAdmin) {
      req.tenantId = tenant.id;
      req.tenantSlug = tenant.slug;
      req.isSuperAdmin = true;
      next();
      return;
    }

    res.status(403).json({ error: "Not authorized for this tenant" });
    return;
  }

  req.tenantId = tenant.id;
  req.tenantSlug = tenant.slug;
  req.roleId = callerMembership.roleId;
  req.isSuperAdmin = callerMembership.isSuperAdmin;

  next();
}
