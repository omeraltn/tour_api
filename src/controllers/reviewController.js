import APIFetature from "../utils/apiFeatures.js";
import catchAsync from "../utils/catchAsync.js";
import Review from "../models/reviewModel.js";

export const getAllReviews = catchAsync(async (req, res) => {
  const reviewFeatures = new APIFetature(Review.find(), req.query)
    .pagination()
    .sort();

  const reviews = await reviewFeatures.query;

  res.json({ message: "Yorumlar listelendi.", data: reviews });
});

export const getOneReview = catchAsync(async (req, res) => {
  res.json("İstek başarılı");
});

export const createReview = catchAsync(async (req, res) => {
  res.json("İstek başarılı");
});

export const updateReview = catchAsync(async (req, res) => {
  res.json("İstek başarılı");
});

export const deleteReview = catchAsync(async (req, res) => {
  res.json("İstek başarılı");
});
