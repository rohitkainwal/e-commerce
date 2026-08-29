import { Router } from "express";
import {
  addAddress,
  deleteAddress,
  getAddress,
  getAddresses,
  updateAddress,
} from "../../controllers/shop/address.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

//! all address routes need login
router.use(authenticate);

router.post("/add", addAddress);
router.get("/all", getAddresses);
router.get("/:addressId", getAddress);
router.patch("/:addressId", updateAddress);
router.delete("/:addressId", deleteAddress);

export default router;
