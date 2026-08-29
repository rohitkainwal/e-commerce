import { Router } from "express";
import {
  addProduct,
  deleteImage,
  deleteProduct,
  getProduct,
  getProducts,
  updateImage,
  updateProduct,
} from "../../controllers/admin/product.controller.js";

import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import upload from "../../middlewares/multer.middleware.js";

const router = Router();

//! every admin route needs login + admin role, so applying it on the whole router
router.use(authenticate, authorize);

router.post("/add", upload.single("images"), addProduct);
router.patch("/delete-image", deleteImage);
router.patch("/update-image", upload.single("images"), updateImage);

router.get("/all", getProducts);
router.get("/:productId", getProduct);
router.patch("/:productId", updateProduct);
//! this was .patch before, same as updateProduct, so delete was never reachable
router.delete("/:productId", deleteProduct);

export default router;
