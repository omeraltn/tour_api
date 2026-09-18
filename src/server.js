import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import tourRoutes from "./routes/tourRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";
import { Not_Found } from "./utils/error.js";
import errorHandler from "./milddleware/errorHandler.js";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import reviewRoutes from "./routes/reviewRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// env dosyasını proje kökünden güvenli şekilde yükle
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// express uygulaması oluştur
const app = express();

// rate limit
const loginRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message:
    "Kısa süre içinde çok fazla deneme yaptınız. Lütfen daha sonra tekrar deneyiniz.",
});
const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message:
    "Kısa süre içinde çok fazla deneme yaptınız. Lütfen daha sonra tekrar deneyiniz.",
});

// midlleware - req ile gelen body ile gelen veriye erişim sağlanır
app.use(helmet());
app.use(generalRateLimit);
app.use("/api/auth/", loginRateLimit);
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

// route'ları projeye tanıt
app.use("/api/tours", tourRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);

// tanımlamayan route
app.use((req, res, next) => {
  next(new Not_Found());
});

// global hata yönetimi
app.use(errorHandler);

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
