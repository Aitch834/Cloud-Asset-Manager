import { Router, type IRouter } from "express";
import healthRouter from "./health";
import leadsRouter from "./leads";
import supportRouter from "./support";
import authRouter from "./auth";
import tenantsRouter from "./tenants";
import rolesRouter from "./roles";
import billingRouter from "./billing";
import adminRouter from "./admin";
import lookupsRouter from "./lookups";
import farmsRouter from "./farms";
import { notificationsRouter } from "./notifications";
import storageRouter from "./storage";
import accountRouter from "./account";

const router: IRouter = Router();

router.use(healthRouter);
router.use(leadsRouter);
router.use(supportRouter);
router.use(authRouter);
router.use(tenantsRouter);
router.use(rolesRouter);
router.use(billingRouter);
router.use(adminRouter);
router.use(lookupsRouter);
router.use(farmsRouter);
router.use(notificationsRouter);
router.use(storageRouter);
router.use(accountRouter);

export default router;
