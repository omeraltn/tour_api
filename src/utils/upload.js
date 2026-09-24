import multer from "multer";
import crypto from "crypto";
import { BadRequest } from "./error.js";

// diskStorage kurulum dosyaları sunucuya kaydetmek için
const diskStorage = multer.diskStorage({
  // dosyanınv yükleneceği klasörü belirle
  destination: function (req, file, cb) {
    cb(null, "uploads/users");
  },
  // dosyabın ismini belirle
  filename: function (req, file, cb) {
    // benzersiz bir sayı oluştur
    crypto.randomBytes(16, function (err, raw) {
      if (err) return cb(err);
      // dosya uzantısını belirle
      const ext = file.mimetype.split("/")[1];
      // dosya ismini belirle
      cb(null, file.fieldname + "-" + raw.toString("hex") + "." + ext);
    });
  },
});

// fotoğraf içeriği dışındaki dosyaları kabul etmeecek middleware
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    // eğerki dosya tipi resim ise kabul et
    cb(null, true);
  } else {
    // resim değilse hata fırlat
    cb(
      new BadRequest(
        "Dosya tipi sadece  resim olabilir (jpg, jpeg, png, webp...)",
      ),
    );
  }
};

// multer middleware kurulumu
export const upload = multer({
  storage: diskStorage,
  fileFilter: multerFilter,
});
