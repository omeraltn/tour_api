import mongoose from "mongoose";
import validator from "validator";
import { required } from "zod/mini";

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
    priceDiscount: {
      type: Number,
    },
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
    premium: { type: Boolean },
    duration: { type: Number, required: true },
    // enbedding
    startLocation: {
      description: String,
      type: { type: String, default: "Point", enum: ["Point"] },
      coordinates: [Number],
      address: String,
    },
    // embedding
    locations: [
      {
        description: String,
        type: { type: String, default: "Point", enum: ["Point"] },
        coordinates: [Number],
        day: Number,
      },
    ],
    // refferance(parent)
    guides: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

//! virtual Property (sanal özellik)
tourSchema.virtual("discountPrice").get(function () {
  return this.price - this.priceDiscount;
});

//! virtual property sanal özellik
tourSchema.virtual("slug").get(function () {
  return this.name.replaceAll(" ", "-").toLowerCase();
});

//!  middleware
// bir belgenin kaydedilme, güncelleme, silinmei okuma gibi olaylarından önce veya sonra gerkleştirilmesi
//  gereken   işlemleri belirlemek için kullanılır.
// Örn: Client'tan gelen tur versiyonun veritabanına kaydedikten sonra  mail göndermek için kullanılabilir.

tourSchema.post("save", function (doc) {
  console.log(doc._id + "'li tur sisteme kayıt edildi. mail gönderiliyor");
});

// örn: herhangi bir find sorgusunda premium turların dahil edilmesini engellemek amacıyla kullanılabilir
tourSchema.pre("find", function () {
  this.find({ premium: { $ne: true } });
});

// yukardaki şemayı kullanarak mongoose model oluştur
const Tour = mongoose.model("Tour", tourSchema);

export default Tour;
