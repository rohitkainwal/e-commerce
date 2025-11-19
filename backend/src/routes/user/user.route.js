import { Router } from "express";
import { loginUser, registerUser, updateProfile } from "../../controllers/user/user.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { registerSchema , loginSchema, updateProfileSchema } from "../../validators/user.validator.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/register",validate(registerSchema), registerUser)

router.post("/login",validate(loginSchema), loginUser)

router.patch(
  "/update-profile",
  validate(updateProfileSchema),
  authenticate,
  updateProfile
);



export default router   