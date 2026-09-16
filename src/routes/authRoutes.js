import express from "express";
import {
  forgotPassword,
  login,
  logout,
  register,
  resetPassword,
  updatePassword,
} from "../controllers/authController.js";
import { protect } from "../milddleware/protect.js";
import validate from "../milddleware/validate.js";
import { createUserSchema } from "../schemas/user.schema.js";

const router = express.Router();

router.post("/register", validate(createUserSchema), register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.patch("/reset-password/:token", resetPassword);
router.patch("/update-password", protect, updatePassword);

export default router;
