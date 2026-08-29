import { Router } from "express";
import {
  addToCart,
  clearCart,
  deleteFromCart,
  getCart,
  removeFromCart,
} from "../../controllers/shop/cart.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

//! cart controllers use req.myUser._id, so login is must for all of them
router.use(authenticate);

router.post("/add", addToCart);
router.patch("/remove", removeFromCart);
router.patch("/delete", deleteFromCart);
router.get("/get", getCart);
router.patch("/clear", clearCart);

export default router;
