import multer from "multer";
import crypto from "crypto";
import { BadRequest } from "./error.js";
import sharp from "sharp";

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

// memoryStorage kurulum
const memoryStorage = multer.memoryStorage({});

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
  storage: memoryStorage,
  fileFilter: multerFilter,
});

/*
 
* kullanıcı 4k çözünürlükte 20-30mb bir fotoğrafı profil fotosu olarak yüklemeye çalışabilir.
* Proje içerisinde profil fotoğrafları genelde 40 x 40 veya 80x80 boyutlarında kullanılır ama kullanıcı fotorğafı seçerken 2560 x 1440 gibi yüksek kalite fotoğraf seçebilir ve herhangi bir işlemden geçirmeden sunucuya kaydedersek gereksiz alan kaplar.
* Bu yüzdeb fotoğrafları sunucuya kaydetmeden önce sharp kütüphanesi ile işleceğiz.
*/
export const resize = (req, res, next) => {
  if (!req.file) return next();

  // dosya ismi belirle
  const filename = `photo-${req.user.id}-${Date.now()}.webp`;

  // dosyayı işle ve diske kaydet
  sharp(req.file.buffer)
    .resize(200, 200)
    .toFormat("webp")
    .webp({ quality: 90 })
    .toFile(`uploads/users/${filename}`);

  // yeni yüklenen dosyayı mw'den sonra çalışılacak fonksiyonda erişmek için req'e ekle
  req.file = `uploads/users/${filename}`;

  next();
};
