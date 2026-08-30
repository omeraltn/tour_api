import Tour from "../models/tourModel.js";

export const getAllTours = async (req, res) => {
  // koleksiyondaki bütün turları al
  const tours = await Tour.find();

  // client'a yanıt gönder
  res.status(200).json({
    message: "Turlar listesi.",
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
