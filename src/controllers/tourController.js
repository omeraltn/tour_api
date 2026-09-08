import Tour from "../models/tourModel.js";
import qs from "qs";
import APIFetature from "../utils/apiFeatures.js";
import { Not_Found, BadRequest } from "../utils/error.js";

export const getAllTours = async (req, res) => {
  // sorguyu oluştur
  const features = new APIFetature(Tour.find(), req.query, req.parsedQuery)
    .sort()
    .filter()
    .pagination()
    .select();

  // sorguyu çalıştır
  const tours = await features.toursQuery;

  // client'a yanıt gönder
  res.status(200).json({
    message: "Turlar listesi.",
    results: tours.length,
    parsedQuery: req.parsedQuery,
    data: tours,
  });
};

export const getOneTour = async (req, res) => {
  // istek ile birlikte gelen id parametresine eriş
  const id = req.params.id;

  // veritabanından id si bilinen turu al
  const tour = await Tour.findById(id);

  //tur bulunamadıysa
  if (!tour) throw new Not_Found("Tur bulunamadı.");

  // client'a yanıt gönder
  res.status(200).json({
    message: "Tur listelendi.",
    data: tour,
  });
};

export const createTour = async (req, res) => {
  // isteğin body kısmındaki veriye eriş
  const body = req.body;

  //yeni turu veritabanına kaydet
  const newTour = await Tour.insertOne(body);

  // client'a yanıt gönder
  res.status(200).json({
    message: "Tur sisteme eklendi.",
    data: newTour,
  });
};

export const updateTour = async (req, res) => {
  // veritabanındaki tur belgesini güncelle
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  // tur bulunamadıysa hata fırlat
  if (!tour) throw new Not_Found("Tur bulunamadı.");

  // client'a yanıt gönder
  res.status(200).json({
    message: "Tur güncellendi.",
    data: tour,
  });
};

export const deleteTour = async (req, res) => {
  // veritabanından id'si bilinen belgeyi kaldır
  const tour = await Tour.findByIdAndDelete(res.req.params.id);

  // tur bulunamadıysa
  if (!tour) throw new Not_Found("Tur bulunamadı.");

  // client'a yanıt gönder
  res.status(200).json({
    message: "Tur kaldırıldı.",
    data: tour,
  });
};

// en iyi turları almamızı sağlayacak parametreleri ayarlayan middleware
export const aliasTopTours = (req, res, next) => {
  req.query.sort = "-ratingAverage,-ratingsQuantity";
  req.query.fields =
    "name,price,ratingsAverage, ratingsQuantity, summary, imageCover";
  req.query.limit = 4;

  next();
};

// tur için istatiskleri hesapla
export const getToursState = async (req, res) => {
  try {
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
  } catch (error) {
    throw new BadRequest("Tur bulunamadı.");
  }
};

// bir yıl içerisinde aylık planı raporla
export const getMonthlyPlan = async (req, res) => {
  try {
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
  } catch (error) {
    throw new BadRequest("Tur bulunamadı.");
  }
};
