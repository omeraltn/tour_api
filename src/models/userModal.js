import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { type } from "os";
import sendMail from "../utils/sendMail.js";

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
    passwordResetToken: { type: String },
    passwordResetExpires: { type: String },
    passwordChangedAt: { type: Date },
  },
  {
    versionKey: false,
    timestamps: true,
    // clienta veriyi göndermeden hemen önce
    toJSON: {
      transform: function (doc, ret) {
        // şifre alanını kaldır
        delete ret?.password;
      },
    },
  },
);

//? paswword belge kaydedilmeden önce:
//* password alanına haslenme ve saltlanma

userSchema.pre("save", async function () {
  // kaydedilen kullanıcının parolası değişmediyse fonksiyonunu durdur
  if (!this.isModified("password")) return;

  // şifreyi hashle ve saltla
  this.password = await bcrypt.hash(this.password, 10);
});

//? Modelin içerisine tanımlı bir fonksiyon
//* şifre sıfırlama tokenı oluştur
userSchema.methods.createResetToken = function () {
  // 1) 32 byte'lık rastgele bir veri oluştur ve bunu hexadecimal bir string formatına çevir
  // örn: b6fc8eb31d3984c999729a555518217df26e51793edfbe2e915d58fdf67628b9

  const resetToken = crypto.randomBytes(32).toString("hex");

  // 2) token'ı hasle ve veritabanına kaydet
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // 3) tokenın son geçerlilik tarihini veritabanına kaydet
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // 4) tokenın normal halini return et
  return resetToken;
};

//? Şifre güncellendiğinde çalışan middleware
userSchema.pre("save", async function () {
  //eğer şifre alanı güncellenmediyse veya hesap yeniyse fonksiyonu durdur
  if (!this.isModified("password") || this.isNew) return;

  // şifre değiştirme tarihini güncelle
  this.passwordChangedAt = Date.now() - 1000;

  // bilgilendirme maili gönder
  await sendMail({
    to: this.email,
    subject: "Tourify Hesabı şifreniz güncellendi",
    html: `
     <body style="margin: 0; padding: 0; background-color: #f5f7fa; font-family: Arial, Helvetica, sans-serif; color: #333333;">

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f7fa; padding: 40px 20px;">
        <tr>
            <td align="center">

                <table width="600" cellpadding="0" cellspacing="0" border="0" 
                    style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 10px; overflow: hidden;">

                    <!-- Header -->
                    <tr>
                        <td style="padding: 30px; text-align: center; background-color: #ffffff;">
                            <h1 style="margin: 0; font-size: 28px; color: #222222;">
                                Tourify
                            </h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 10px 40px 40px 40px;">

                            <h2 style="margin: 0 0 20px 0; font-size: 22px; color: #222222;">
                                Şifreniz Güncellendi
                            </h2>

                            <p style="font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                                Merhaba <strong>${this.name}</strong>,
                            </p>

                            <p style="font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">
                                Tourify hesabınızın şifresi başarıyla güncellenmiştir.
                            </p>

                            <!-- User Info -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                                style="background-color: #f7f8fa; border-radius: 8px; margin-bottom: 25px;">
                                <tr>
                                    <td style="padding: 15px 20px; font-size: 14px;">
                                        <strong>Kullanıcı Adı:</strong><br>
                                        ${this.name}
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding: 5px 20px 15px 20px; font-size: 14px;">
                                        <strong>E-posta:</strong><br>
                                        ${this.email}
                                    </td>
                                </tr>
                            </table>

                            <p style="font-size: 14px; line-height: 1.6; color: #666666; margin: 0 0 25px 0;">
                                Bu işlemi siz gerçekleştirmediyseniz, hesabınızın güvenliği için
                                lütfen bizimle iletişime geçin.
                            </p>

                            <p style="font-size: 15px; line-height: 1.6; margin: 0;">
                                Tourify'ı kullandığınız için teşekkür ederiz.
                            </p>

                            <p style="font-size: 15px; font-weight: bold; margin: 25px 0 0 0;">
                                Tourify Ekibi
                            </p>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 40px; background-color: #f7f8fa; text-align: center;">
                            <p style="margin: 0; font-size: 12px; color: #999999;">
                                © 2026 Tourify. Tüm hakları saklıdır.
                            </p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
    `,
  });
});

const User = mongoose.model("User", userSchema);
export default User;
