import { Router, type IRouter } from "express";
import healthRouter from "./health";
import leadsRouter from "./leads";
import supportRouter from "./support";
import tenantsRouter from "./tenants";
import rolesRouter from "./roles";
import billingRouter from "./billing";
import adminRouter from "./admin";
import lookupsRouter from "./lookups";
import farmsRouter from "./farms";
import { notificationsRouter } from "./notifications";
import storageRouter from "./storage";
import accountRouter from "./account";
import eaRouter from "./ea";
import viticultureRouter from "./viticulture";
import mobileRouter from "./mobile";

const router: IRouter = Router();

router.use(healthRouter);
router.use(leadsRouter);
router.use(supportRouter);
router.use(tenantsRouter);
router.use(rolesRouter);
router.use(billingRouter);
router.use(adminRouter);
router.use(lookupsRouter);
router.use(farmsRouter);
router.use(notificationsRouter);
router.use(storageRouter);
router.use(accountRouter);
router.use(eaRouter);
router.use(viticultureRouter);
router.use(mobileRouter);

export default router;
