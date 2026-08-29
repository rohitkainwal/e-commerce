import { Router } from "express";
import {
  deleteUser,
  getAllUsers,
  getUserById,
  updateUserRole,
} from "../../controllers/admin/user.controller.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate, authorize);

router.get("/all", getAllUsers);
router.get("/:userId", getUserById);
router.patch("/:userId/role", updateUserRole);
router.delete("/:userId", deleteUser);

export default router;
