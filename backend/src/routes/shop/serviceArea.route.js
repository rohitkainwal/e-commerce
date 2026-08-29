import { Router } from "express";
import {
  checkLocation,
  getServiceCities,
} from "../../controllers/shop/serviceArea.controller.js";

const router = Router();

//? open to everyone, the customer checks this before ordering
router.get("/check", checkLocation);
router.get("/all", getServiceCities);

export default router;
