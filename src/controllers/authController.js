import User from "../models/userModal.js";
import bcrypt from "bcrypt";

export const register = async (req, res) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });
    res.status(201).json({ message: "Hesabınız oluşturuldu.", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "İşlem başarısız", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    // 1-) body kısmındaki verilere eriş
    const { email, password } = req.body;

    // 2) email ve şifre geldi mi kontrol et
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Lütfen email ve şifre giriniz." });
    }

    // 3-) email'i kullanan kullanıcı var mı
    const user = await User.findOne({ email });

    // 3.1) kullanıcı yoksa hata gönder
    if (!user)
      return res.status(401).json({ message: "Email veya şifre hatalı" });

    // 4) clienttan gelen şifre ile veritabanında hashlenmiş şifre eşleşiyor mu
    const isValid = await bcrypt.compare(password, user.password);

    // 4.1 yanlışsa hata gönder
    if (!isValid)
      return res.status(401).json({ message: "Email veya şifre hatalı" });

    res.json({ message: "Giriş yapıldı.", user });
  } catch (error) {
    res.status(500).json({ message: "İşlem başarısız", error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.json({ message: "İşlem başarılı." });
  } catch (error) {
    res.status(500).json({ message: "İşlem başarısız.", error: error.message });
  }
};
