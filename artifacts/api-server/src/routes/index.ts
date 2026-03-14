import { Router, type IRouter } from "express";
import healthRouter from "./health";
import leadsRouter from "./leads";
import supportRouter from "./support";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(leadsRouter);
router.use(supportRouter);
router.use(authRouter);

export default router;
