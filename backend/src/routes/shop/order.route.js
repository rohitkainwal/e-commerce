import { Router } from "express";
import {
  cancelOrder,
  captureOrder,
  createOrder,
  getOrder,
  getOrders,
} from "../../controllers/shop/order.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

//! paypal sends the user back on this url by itself (GET), user is not logged in there
//? so this one is kept outside authenticate
router.get("/capture", captureOrder);

router.use(authenticate);

router.post("/create", createOrder);
router.post("/capture", captureOrder);
router.get("/all", getOrders);
router.get("/:orderId", getOrder);
router.patch("/:orderId/cancel", cancelOrder);

export default router;

// localhost:9000/api/shop/order/capture
