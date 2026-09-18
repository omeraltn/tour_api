// geliştirme aşamasında mongodb dei verileri sıkça değişeceğinden veya silineceğinden dolayı veritabanında verileri temizlemeye ve json dosyasında örnek verileri veritabanına aktarmaya yarayan, terminal komutları ile çalışacak 2 fonksiyon yazalım

import mongoose from "mongoose";
import fs from "fs";
import Tour from "../models/tourModel.js";
import User from "../models/userModal.js";
import dotenv from "dotenv";
import reviewModel from "../models/reviewModel.js";

dotenv.config();

// veritabanına bağlan
// mongodb veritabanı bağlan
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("⚪️ MongoDB veritabanına bağlandı. ⚪️");
  })
  .catch((error) => {
    console.error("🔴MongoDB veritabanına bağlanamadı.🔴");
  });

// json dosyasındaki verileri al
const tours = JSON.parse(
  fs.readFileSync("./src/dev-data/data/tours.json", "utf-8"),
);
const users = JSON.parse(
  fs.readFileSync("./src/dev-data/data/users.json", "utf-8"),
);

const reviews = JSON.parse(
  fs.readFileSync("./src/dev-data/data/reviews.json", "utf-8"),
);

// json dosyasından alınan verileri kaydedecek fonksiyon
const importData = async () => {
  try {
    await Tour.create(tours, { validateBeforeSave: false });
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews, { validateBeforeSave: false });
    console.log("⚪️ Veriler başarıyla aktarıldı. ");
  } catch (error) {
    console.log("🔴 Veriler aktarılırken bir hata oluştu.");
    console.error(error);
  }
  process.exit();
};

// verileri veritabanından silecek fonksiyon
const clearData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log("⚪️ Veriler başarıyla silindi. ");
  } catch (error) {
    console.log("🔴 Veriler kaldırılırken hata oluştu.");
    console.error(error);
  }
  process.exit();
};

if (process.argv.includes("--import")) {
  importData();
} else if (process.argv.includes("--clear")) {
  clearData();
} else {
  console.log("🚨 Lütfen geçerli bir argmüman girin: --import veya --clear");
  process.exit();
}
