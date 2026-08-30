import Tour from "../models/tourModel.js";
import qs from "qs";
import APIFetature from "../utils/apiFeatures.js";

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
  if (!tour) return res.status(404).json({ message: "Tur bulunamadı." });

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
  });

  // tur bulunamadıysa hata fırlat
  if (!tour) return res.status(404).json({ message: "Tur bulunamadı." });

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
  if (!tour) return res.status(404).json({ message: "Tur bulunamadı." });

  // client'a yanıt gönder
  res.status(200).json({
    message: "Tur kaldırıldı.",
    data: tour,
  });
};
