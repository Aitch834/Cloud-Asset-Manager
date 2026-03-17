import { type Request, type Response, type NextFunction } from "express";

const ADMIN_PORTAL_SECRET = process.env.ADMIN_PORTAL_SECRET ?? null;

export function adminPortalMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (!ADMIN_PORTAL_SECRET) {
    next();
    return;
  }

  const provided = req.headers["x-admin-secret"] as string | undefined;

  if (!provided || provided !== ADMIN_PORTAL_SECRET) {
    next();
    return;
  }

  req.user = {
    id: "bde-platform-admin",
    email: "admin@bdefarmtrac.com",
    firstName: "BDE",
    lastName: "Admin",
    profileImageUrl: null,
  };

  req.isAuthenticated = function (this: Request) {
    return true;
  } as Request["isAuthenticated"];

  req.isSuperAdmin = true;

  next();
}
