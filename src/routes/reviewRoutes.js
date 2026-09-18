import express from "express";
import {
  createReview,
  deleteReview,
  getAllReviews,
  getOneReview,
  updateReview,
} from "../controllers/reviewController.js";
import { protect } from "../milddleware/protect.js";

const router = express.Router();

router.route("/").get(getAllReviews).post(protect, createReview);

router
  .route("/:id")
  .get(getOneReview)
  .patch(protect, updateReview)
  .delete(protect, deleteReview);

export default router;
