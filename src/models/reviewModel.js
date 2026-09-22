import mongoose from "mongoose";
import Tour from "./tourModel.js";

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Yorum içeriği boş olamaz"],
    },
    rating: {
      type: Number,
      min: [1, "Puan en az 1 olabilir."],
      max: [5, "Puan en fazla 5 olabilir."],
      required: [true, "Puan alanı boş olamaz"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Yorum yapan kullanıcı bilgisi boş olamaz."],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "Yorum yapılan tur bilgisi boş olamaz."],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

reviewSchema.pre(/^find/, function () {
  this.populate("user", "name photo");
});

reviewSchema.statics.calcRating = async function (tourId) {
  const result = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: "$tour",
        ratingQuantity: { $sum: 1 },
        ratingAverage: { $avg: "$rating" },
      },
    },
  ]);

  if (result.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: Number(result[0].ratingAverage.toFixed(2)),
      ratingsQuantity: result[0].ratingQuantity,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 0,
      ratingsQuantity: 0,
    });
  }
};

reviewSchema.post("save", function () {
  this.constructor.calcRating(this.tour);
});

reviewSchema.post(/^findOneAnd/, async function (doc) {
  if (!doc) return;

  const tourId = doc.tour?._id || doc.tour;
  if (tourId) {
    await this.model.calcRating(tourId);
  }
});

// index
reviewSchema.index({ tour: 1 });

// aynı kullanıcı aynı tura sadece 1 yorum atabilsin indexi
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);

export default Review;
