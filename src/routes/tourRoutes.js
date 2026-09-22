import express from "express";
import {
  createTour,
  deleteTour,
  getAllTours,
  getOneTour,
  updateTour,
  aliasTopTours,
  getToursState,
  getMonthlyPlan,
  getToursWithin,
  getDistance,
} from "../controllers/tourController.js";
import formatQuery from "../milddleware/formatQuery.js";
import { protect, authorizeRoles } from "../milddleware/protect.js";

const router = express.Router();

router
  .route("/monthly-plan/:year")
  .get(protect, authorizeRoles("admin"), getMonthlyPlan);

router.route("/top-tours").get(aliasTopTours, formatQuery, getAllTours);

router.route("/stats").get(protect, authorizeRoles("admin"), getToursState);

router
  .route("/")
  .get(formatQuery, getAllTours)
  .post(protect, authorizeRoles("admin", "lead-guide"), createTour);

router
  .route("/:id")
  .get(getOneTour)
  .patch(protect, authorizeRoles("admin", "lead-guide", "guide"), updateTour)
  .delete(protect, authorizeRoles("admin", "lead-guide"), deleteTour);

router
  .route("/tours-within/:distance/center/:latlng/unit/:unit")
  .get(getToursWithin);

router.route("/distances/:latlng/unit/:unit").get(getDistance);

export default router;
