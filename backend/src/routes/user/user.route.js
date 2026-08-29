import { Router } from "express";
import {
  changePassword,
  checkResetPasswordToken,
  currentUser,
  forgotPassword,
  loginUser,
  logoutUser,
  registerUser,
  resendEmailVerificationLink,
  resetPassword,
  updateProfile,
  verifyEmail,
} from "../../controllers/user/user.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resendEmailVerificationLinkSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  updateProfileSchema,
} from "../../validators/user.validator.js";

const router = Router();

router.post("/register", validate(registerSchema), registerUser);
router.post("/resend-email-link",validate(resendEmailVerificationLinkSchema),resendEmailVerificationLink);
router.post("/login", validate(loginSchema), loginUser);
router.post("/logout", authenticate, logoutUser);
//! authenticate first, then validate
router.patch("/update-profile",authenticate,validate(updateProfileSchema),updateProfile);
router.patch("/update-password",authenticate,validate(updatePasswordSchema),changePassword);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.get("/verify-email/:emailToken", verifyEmail);

//? GET just tells the frontend if the link is still valid, POST actually resets it
router.get("/reset-password/:resetPasswordToken", checkResetPasswordToken);
router.post("/reset-password/:resetPasswordToken",validate(resetPasswordSchema),resetPassword);

//~ this is for frontend protected routes
router.get("/current", authenticate, currentUser);

export default router;
