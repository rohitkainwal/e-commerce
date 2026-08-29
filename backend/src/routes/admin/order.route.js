import { Router } from "express";
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} from "../../controllers/admin/order.controller.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";

const router = Router();

//! only a logged in admin can touch these
router.use(authenticate, authorize);

router.get("/all", getAllOrders);
router.get("/:orderId", getOrderById);
router.patch("/:orderId/status", updateOrderStatus);

export default router;
