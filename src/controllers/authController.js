import User from "../models/userModal.js";

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
    res.json({ message: "İşlem başarılı" });
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
