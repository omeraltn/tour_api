import express from "express";
import {
  createTour,
  deleteTour,
  getAllTours,
  getOneTour,
  updateTour,
} from "../controllers/tourController.js";

const router = express.Router();

router.route("/").get(getAllTours).post(createTour);

router.route("/:id").get(getOneTour).patch(updateTour).delete(deleteTour);

export default router;
