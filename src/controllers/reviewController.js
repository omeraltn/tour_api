import APIFetature from "../utils/apiFeatures.js";
import catchAsync from "../utils/catchAsync.js";
import Review from "../models/reviewModel.js";
import { NotFound } from "./../utils/error.js";

export const getAllReviews = catchAsync(async (req, res) => {
  const reviewFeatures = new APIFetature(
    Review.find(),
    req.query,
    req.parsedQuery,
  )
    .filter()
    .sort()
    .pagination();

  const reviews = await reviewFeatures.query;

  res.json({
    message: "Yorumlar listelendi.",
    results: reviews.length,
    data: reviews,
  });
});

export const getOneReview = catchAsync(async (req, res) => {
  const id = req.params.id;
  const review = await Review.findById(id);

  if (!review) {
    throw new NotFound("Aradığınız yorum bulunamadı.");
  }

  res.status(200).json({ message: "Aradığınız yorum bulundu.", data: review });
});

export const createReview = catchAsync(async (req, res) => {
  const tour = req.body.tour; // hangi tur
  const rating = req.body.rating; // 1-5
  const review = req.body.review; // yorum içeriği
  const user = req.user._id; // yorumu atan

  const newReview = await Review.create({
    review,
    rating,
    tour,
    user,
  });

  res.status(201).json({ message: "Yorum atıldı.", data: newReview });
});

export const updateReview = catchAsync(async (req, res) => {
  res.json("İstek başarılı");
});

export const deleteReview = catchAsync(async (req, res) => {
  res.json("İstek başarılı");
});
