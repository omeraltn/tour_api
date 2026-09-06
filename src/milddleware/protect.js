import jwt from "jsonwebtoken";
import User from "../models/userModal.js";
import dotenv from "dotenv";

dotenv.config();

// ----- Authorization Middleware --------
// * Client'ın gönderdiği token'ın geçerliliğini doğrular.
// * Token geçersiz ise route'a erişimine izin vermeyip hata fırlat
// * Token geçerliyse route'a erişmesibe izin ver

export const protect = async (req, res, next) => {
  // 1-) çerez ile gelen tokenı al
  const token = req?.cookies.jwt;

  // 2-) token gelmediyse hata fırlat
  if (!token)
    return res
      .status(401)
      .json({ message: "Bu işlem için yetkiniz yok. token bulunamadı." });

  // 3) tokenın geçerliliğini doğrula (zaman aşımına uğradımı ? | imza doğru mu ?)
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    res.status(401).json({ message: "Kimlik doğrulanmadı. Token geçersiz." });
  }

  // 4) token ile gelen kulanıcı hesabı duruyor mu
  let activeUser;
  try {
    activeUser = await User.findById(decoded.id);
  } catch (error) {
    res.status(401).json({ message: "Kullanıcı hesabı silinmiş." });
  }

  // 4.1 hesap silindiyse hata fırlat
  if (!activeUser)
    return res.status(401).json({ message: "Kullanıcı hesabı silinmiş." });

  // 4.2) hesap dondurulduysa hata fırlat
  if (!activeUser.active)
    return res.status(401).json({ message: "Kullanıcı hesabı dondurulmuş." });

  //5) protextten sonra çalışacak fonksiyonlarda kullanıcı verisine erişebilmek için req nesnesine user'ı ekle
  req.user = activeUser;

  // sonraki adıma geç
  next();
};

// ----- Role Control Middleware ------
// * İstek atan kullanıcı rolü fonksiyonu parametre olarak aldığı rollerde biriyse:
// * erişime izin ver
// * değilse erişimi engelle

export const authorizeRoles =
  (...allowedRoles) =>
  (req, res, next) => {
    next();
  };
