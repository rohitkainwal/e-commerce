import { Router } from "express";
import { loginUser, logoutUser, registerUser, updateProfile , currentUser, changePassword} from "../../controllers/user/user.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { registerSchema , loginSchema, updateProfileSchema , updatePasswordSchema} from "../../validators/user.validator.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/register",validate(registerSchema), registerUser)

router.post("/login",validate(loginSchema), loginUser)

router.post("/logout", authenticate, logoutUser)

router.patch(
  "/update-profile",
  validate(updateProfileSchema),
  authenticate,
  updateProfile
);


router.patch("/change-password", validate(updatePasswordSchema), authenticate,changePassword)

//~ this is for frontend protected routes
router.get("/current", authenticate, currentUser);

export default router   