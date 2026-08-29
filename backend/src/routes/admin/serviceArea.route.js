import { Router } from "express";
import {
  addArea,
  deleteArea,
  getAreas,
  updateArea,
} from "../../controllers/admin/serviceArea.controller.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate, authorize);

router.get("/all", getAreas);
router.post("/add", addArea);
router.patch("/:areaId", updateArea);
router.delete("/:areaId", deleteArea);

export default router;
