import APIFetature from "../utils/apiFeatures.js";
import catchAsync from "../utils/catchAsync.js";
import Review from "../models/reviewModel.js";
import { NotFound, Not_Found } from "./../utils/error.js";

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
  const id = req.params.id; // hangi yorum
  const rating = req.body.rating; // 1-5
  const review = req.body.review; // yorum içeriği
  const user = req.user._id; // yorumu atan

  const found = await Review.findOneAndUpdate(
    { _id: id, user },
    {
      rating,
      review,
    },
    { new: true },
  );

  if (!found) throw new Not_Found("Yorum Bulunamadı.");

  res.json({ message: "Yorum güncellendi." });
});

export const deleteReview = catchAsync(async (req, res) => {
  const review = await Review.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!review) throw new NotFound("Yorum bulunamadı.");

  res.json({ message: "Yorum kaldırıldı." });
});
