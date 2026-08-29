import { Router } from "express";
import {
  fetchProduct,
  fetchProducts,
  getFilters,
  searchProducts,
} from "../../controllers/shop/product.controller.js";

const router = Router();

//! /search and /filters must be written before /all/:id
//? otherwise express will treat "search" as an id

router.get("/search", searchProducts);
router.get("/filters", getFilters);
router.get("/all", fetchProducts);
router.get("/all/:id", fetchProduct);

export default router;
