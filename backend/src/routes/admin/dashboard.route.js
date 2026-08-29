import { Router } from "express";
import { getStats } from "../../controllers/admin/dashboard.controller.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate, authorize);
router.get("/stats", getStats);

export default router;
