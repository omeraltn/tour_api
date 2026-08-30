import mongoose from "mongoose";
import validator from "validator";

//schema: veritabanına kaybedilecek tur verisinin şartlarını tanımlamamızı sağlar

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      validate: [
        (val) => validator.isAlphanumeric(val, "tr-TR", { ignore: " " }),
      ],
    },
    price: { type: Number, required: true, min: [0, "Fiyat pozitif olmalı."] },
    maxGroupSize: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "Değer tam sayı olmalı.",
      },
    },
    difficulty: {
      type: String,
      required: true,
      enum: ["kolay", "orta", "zor", "çok zor"],
    },
    ratingsAverage: { type: Number, min: 1, max: 5, default: 4.0 },
    ratingsQuantity: { type: Number, min: 0, default: 0 },
    summary: { type: String, required: true },
    description: { type: String, required: true },
    imageCover: { type: String, required: true },
    images: { type: [String], required: true },
    startDates: { type: [Date], required: true },
  },
  { timestamps: true, versionKey: false },
);

// yukardaki şemayı kullanarak mongoose model oluştur
const Tour = mongoose.model("Tour", tourSchema);

export default Tour;
