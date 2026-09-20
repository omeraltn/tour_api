import Tour from "../models/tourModel.js";
import qs from "qs";
import APIFetature from "../utils/apiFeatures.js";
import { Not_Found, BadRequest } from "../utils/error.js";
import catchAsync from "../utils/catchAsync.js";
import * as factory from "../utils/handlerFactory.js";

export const getAllTours = factory.getAll(Tour);

export const getOneTour = factory.getOne(Tour, [
  { path: "guides", select: "name photo email" },
]);

export const createTour = factory.createOne(Tour);

export const updateTour = factory.updateOne(Tour);

export const deleteTour = factory.deleteOne(Tour);

// en iyi turları almamızı sağlayacak parametreleri ayarlayan middleware
export const aliasTopTours = catchAsync((req, res, next) => {
  req.query.sort = "-ratingAverage,-ratingsQuantity";
  req.query.fields =
    "name,price,ratingsAverage, ratingsQuantity, summary, imageCover";
  req.query.limit = 4;

  next();
});

// tur için istatiskleri hesapla
export const getToursState = catchAsync(async (req, res) => {
  // Aggeragation Pipeline
  const stats = await Tour.aggregate([
    // 1.adım ratingi 4 ve üzeri olan turları al
    {
      $match: { ratingsAverage: { $gte: 4 } },
    },
    // 2.adım zorluğa göre gruplandır ve ortalama değerlerini hesapla
    {
      $group: {
        _id: "$difficulty",
        count: { $sum: 1 },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    // 3.adım
    {
      $sort: { _id: 1 },
    },
  ]);
  res.json({ message: "Rapor oluşturuldu", stats });
});

// bir yıl içerisinde aylık planı raporla
export const getMonthlyPlan = catchAsync(async (req, res) => {
  // parametre olarak gelen yıla eriş
  const year = req.params.year;

  // istatistik hesaplama
  const stats = await Tour.aggregate([
    {
      $unwind: {
        path: "$startDates",
      },
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: {
          $month: "$startDates",
        },
        count: {
          $sum: 1,
        },
        tours: {
          $push: "$name",
        },
      },
    },
    {
      $addFields: {
        month: "$_id",
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        month: 1,
      },
    },
  ]);

  return res.json({ message: "Yıllık plan", stats });
});
