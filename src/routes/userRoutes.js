import express from "express";
import { authorizeRoles, protect } from "../milddleware/protect.js";
import {
  createUser,
  deleteMe,
  deleteUser,
  getAllUsers,
  getOneUser,
  profile,
  updateMe,
  updateUser,
} from "../controllers/userControl.js";
import { upload, resize } from "../utils/upload.js";

const router = express.Router();

router
  .route("/me")
  .get(protect, profile)
  .patch(protect, upload.single("photo"), resize, updateMe)
  .delete(protect, deleteMe);

router.use(protect, authorizeRoles("admin")); //bu satırdan sonraki bütün routelara sadece sadece admin istek atabilir
router.route("/").get(getAllUsers).post(createUser);
router.route("/:id").get(getOneUser).patch(updateUser).delete(deleteUser);

export default router;
