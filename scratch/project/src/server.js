console.log("SERVER.JS START");
import express from "express";
console.log("EXPRESS IMPORTED");
import mongoose from "mongoose";
console.log("MONGOOSE IMPORTED");
import dotenv from "dotenv";
console.log("DOTENV IMPORTED");
import tourRoutes from "./routes/tourRoutes.js";
console.log("ROUTES IMPORTED");

dotenv.config();
console.log("DOTENV CONFIG DONE");

const app = express();
app.use(express.json());

console.log("TRYING TO CONNECT TO MONGO");
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("⚪️ MongoDB veritabanına bağlandı. ⚪️"))
  .catch((e) => console.log("🔴MongoDB veritabanına bağlanamadı.🔴", e));

app.use("/api/tours", tourRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`🚨🚨API ${PORT}. dinlemeye başladı. 🚨🚨`);
});
