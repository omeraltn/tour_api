import mongoose from "mongoose";
import validator from "validator";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "İsim alanı zorunludur."],
      minLength: [2, "İsim 2 karakterden kısa olamaz."],
      maxLength: [30, "İsim 30 karakterden kısa olamaz."],
      validator: [
        (val) => validator.isAlpha(val, "tr-TR", { ignore: " " }),
        "İsim sadece harflerden oluşabilir",
      ],
    },
    email: {
      type: String,
      required: [true, "Email alanı zorunludur."],
      unique: [validator.isEmail, "Lütfen geçerli bir mail adresi giriniz."],
    },
    role: {
      type: String,
      enum: ["user", "admin", "guide", "lead-guide"],
      default: "user",
    },
    active: {
      type: Boolean,
      default: true,
    },
    photo: {
      type: String,
      default: "defaultpic",
    },
    password: {
      type: String,
      required: [true, "Şifre alaı zorunludur."],
      minLength: [8, "Şifre en az 8 karakter olmalıdır."],
      validator: [
        validator.isStrongPassword,
        "Şifrenizz yeterince güçlü değil.",
      ],
    },
  },
  { versionKey: false, timestamps: true },
);

const User = mongoose.model("User", userSchema);
export default User;
