import { Router } from "express";
import { loginUser, logoutUser, registerUser, updateProfile , currentUser} from "../../controllers/user/user.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { registerSchema , loginSchema, updateProfileSchema } from "../../validators/user.validator.js";
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


//~ this is for frontend protected routes
router.get("/current", authenticate, currentUser);

export default router   