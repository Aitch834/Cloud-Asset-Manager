import { Router, type IRouter } from "express";
import healthRouter from "./health";
import leadsRouter from "./leads";
import supportRouter from "./support";
import authRouter from "./auth";
import tenantsRouter from "./tenants";
import rolesRouter from "./roles";
import billingRouter from "./billing";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(leadsRouter);
router.use(supportRouter);
router.use(authRouter);
router.use(tenantsRouter);
router.use(rolesRouter);
router.use(billingRouter);
router.use(adminRouter);

export default router;
