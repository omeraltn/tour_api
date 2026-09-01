import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import tourRoutes from "./routes/tourRoutes.js";
import authRoutes from "./routes/authRoutes.js";

//env değişkenlerine erişmemizi sağlayacak fonksiyon
dotenv.config();

// express uygulaması oluştur
const app = express();

// midlleware - req ile gelen body ile gelen veriye erişim sağlanır
app.use(express.json());

//mongodb veritabanı bağlan
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("⚪️ MongoDB veritabanına bağlandı. ⚪️"))
  .catch(() => console.log("🔴MongoDB veritabanına bağlanamadı.🔴"));

// route'ları projeye tanıt
app.use("/api/tours", tourRoutes);
app.use("/api/auth", authRoutes);

// api'nin dinleyeceği portu belirle
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`🚨🚨API ${PORT}. dinlemeye başladı. 🚨🚨`);
});
