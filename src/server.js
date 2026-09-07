import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import tourRoutes from "./routes/tourRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";
import { Not_Found } from "./utils/error.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// env dosyasını proje kökünden güvenli şekilde yükle
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// express uygulaması oluştur
const app = express();

// midlleware - req ile gelen body ile gelen veriye erişim sağlanır
app.use(express.json());
app.use(cookieParser());

// route'ları projeye tanıt
app.use("/api/tours", tourRoutes);
app.use("/api/auth", authRoutes);

// tanımlamayan route
app.use((req, res, next) => {
  next(new Not_Found());
});

// global hata yönetimi
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    message: "Global hata yönetimi tarafından yakalandı.",
    error: err.message,
  });
});

// api'nin dinleyeceği portu belirle
const PORT = process.env.PORT || 3000;

// mongodb veritabanı bağlan
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("⚪️ MongoDB veritabanına bağlandı. ⚪️");
    app.listen(PORT, () => {
      console.log(`🚨🚨API ${PORT}. dinlemeye başladı. 🚨🚨`);
    });
  })
  .catch((error) => {
    console.error("🔴MongoDB veritabanına bağlanamadı.🔴");
    console.error(error.message);
    process.exit(1);
  });
