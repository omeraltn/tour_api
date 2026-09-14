import express from "express";
import { protect } from "../milddleware/protect.js";
import { deleteMe, profile, updateMe } from "../controllers/userControl.js";

const router = express.Router();

router
  .route("/me")
  .get(protect, profile)
  .patch(protect, updateMe)
  .delete(protect, deleteMe);

export default router;
