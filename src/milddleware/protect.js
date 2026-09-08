import jwt from "jsonwebtoken";
import User from "../models/userModal.js";
import dotenv from "dotenv";
import { Not_Found, Unauthorized, Forbidden } from "../utils/error.js";

dotenv.config();

// ----- Authorization Middleware --------
// * Client'ın gönderdiği token'ın geçerliliğini doğrular.
// * Token geçersiz ise route'a erişimine izin vermeyip hata fırlat
// * Token geçerliyse route'a erişmesibe izin ver

export const protect = async (req, res, next) => {
  // 1-) çerez ile gelen tokenı al
  const token = req?.cookies.jwt;

  // 2-) token gelmediyse hata fırlat
  if (!token) return next(new Unauthorized());

  // 3) tokenın geçerliliğini doğrula (zaman aşımına uğradımı ? | imza doğru mu ?)
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    res.status(401).json({ message: "Kimlik doğrulanmadı. Token geçersiz." });
    next(new Unauthorized("Token geçersiz"));
  }

  // 4) token ile gelen kulanıcı hesabı duruyor mu
  let activeUser;
  try {
    activeUser = await User.findById(decoded.id);
  } catch (error) {
    next(new Unauthorized("Kullanıcı hesabı bulunamadı."));
  }

  // 4.1 hesap silindiyse hata fırlat
  if (!activeUser)
    return next(new Unauthorized("Kullanıcı hesabı bulunamadı."));

  // 4.2) hesap dondurulduysa hata fırlat
  if (!activeUser.active)
    return next(new Unauthorized("Kullanıcı hesabı bulunamadı."));

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
    // kullanıcının rolü izin verilen roller arasında var mı ?
    const hasPermission = allowedRoles.includes(req.user.role);

    // kullanıcının rolü yeterli değilse hata fırlat
    if (!hasPermission)
      return res
        .status(403)
        .json({ message: "Bu işlemi yapmaya yetkiniz yok. " });

    // rolü yeterliyse devam et
    next();
  };
