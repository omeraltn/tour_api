import express from "express";
import {
  createTour,
  deleteTour,
  getAllTours,
  getOneTour,
  updateTour,
} from "../controllers/tourController.js";
import formatQuery from "../milddleware/formatQuery.js";

const router = express.Router();

router.route("/").get(formatQuery, getAllTours).post(createTour);

router.route("/:id").get(getOneTour).patch(updateTour).delete(deleteTour);

export default router;
