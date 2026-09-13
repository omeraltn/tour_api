import User from "../models/userModal.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { BadRequest, Unauthorized } from "../utils/error.js";
import catchAsync from "../utils/catchAsync.js";
import crypto from "crypto";
import sendMail from "../utils/sendMail.js";

dotenv.config();

export const register = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });
  res.status(201).json({ message: "Hesabınız oluşturuldu.", user: newUser });
});

export const login = catchAsync(async (req, res) => {
  // 1-) body kısmındaki verilere eriş
  const { email, password } = req.body;

  // 2) email ve şifre geldi mi kontrol et
  if (!email || !password)
    throw new BadRequest("Lütfen email ve şifre giriniz.");

  // 3-) email'i kullanan kullanıcı var mı
  const user = await User.findOne({ email });

  // 3.1) kullanıcı yoksa hata gönder
  if (!user) throw new Unauthorized("Lütfen email ve şifre hatalı");

  // 4) clienttan gelen şifre ile veritabanında hashlenmiş şifre eşleşiyor mu
  const isValid = await bcrypt.compare(password, user.password);

  // 4.1 yanlışsa hata gönder
  if (!isValid) throw new Unauthorized("Lütfen email ve şifre hatalı");

  //5) jwt token oluştur
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  res.cookie("jwt", token, {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true, // sadece http protokolone sahip domainlerde seyahat eder
    secure: false, // sadece https
  });

  res.json({ message: "Giriş yapıldı.", user });
});

export const logout = catchAsync(async (req, res) => {
  res.clearCookie("jwt").json({ message: "Çıkış yapıldı." });
});

// şifremi unuttum

// a) Eposta adresine şifre sıfırlama bağlantısı gönder
export const forgotPassword = catchAsync(async (req, res) => {
  // 1) eposta adresine göre kullanıcı hesabına eriş
  const user = await User.findOne({ email: req.body.email });

  // kullanıcı varsa token oluştur ve mail gönder
  if (user) {
    // 2) şifre sıfırlama tokeni oluştur ve veritabanına haslenmiş halini kaydet
    const resetToken = user.createResetToken();
    await user.save({ validateBeforeSave: false });

    //3) şifre sıfırlamak için kullanacağı token'ı içeren url'i hazırla
    const url = `${req.protocol}://${req.headers.host}/api/auth/reset-password/${resetToken}`;

    //4) URL'i e-posta adresine mail at
    await sendMail({
      to: user.email,
      subject: "Şifre sıfırlama Bağlantısı (10 dakika)",
      text: resetToken,
      html: `<body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, Helvetica, sans-serif; color:#2d3748;">

    <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background-color:#f4f6f8; padding:50px 20px;">
        <tr>
            <td align="center">

                <table width="600" cellpadding="0" cellspacing="0" border="0"
                    style="width:100%; max-width:600px; background:#ffffff; border-radius:14px; overflow:hidden; box-shadow:0 8px 30px rgba(0,0,0,0.08);">

                    <!-- Header -->
                    <tr>
                        <td align="center"
                            style="padding:32px 30px; background:linear-gradient(135deg,#111827,#374151);">
                            <h1 style="margin:0; font-size:30px; line-height:1.2; color:#ffffff; font-weight:700; letter-spacing:-0.5px;">
                                Tourify
                            </h1>

                            <p style="margin:8px 0 0; color:#d1d5db; font-size:13px;">
                                Hesap Güvenliği
                            </p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding:42px 45px 45px;">

                            <h2 style="margin:0 0 18px; font-size:24px; line-height:1.3; color:#111827; font-weight:700;">
                                Şifrenizi Sıfırlayın
                            </h2>

                            <p style="margin:0 0 20px; font-size:15px; line-height:1.7; color:#4b5563;">
                                Merhaba <strong style="color:#111827;">${user.name}</strong>,
                            </p>

                            <p style="margin:0 0 28px; font-size:15px; line-height:1.7; color:#4b5563;">
                                Tourify hesabınız için şifre sıfırlama talebi oluşturuldu.
                                Yeni şifrenizi belirlemek için aşağıdaki bağlantıyı kullanabilirsiniz.
                            </p>

                            <!-- User Info -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                                style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:10px; margin-bottom:28px;">
                                <tr>
                                    <td style="padding:16px 20px; font-size:14px; color:#6b7280;">
                                        <strong style="color:#374151;">Kullanıcı Adı</strong><br>
                                        <span style="display:inline-block; margin-top:5px;">
                                            ${user.name}
                                        </span>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding:5px 20px 16px; font-size:14px; color:#6b7280;">
                                        <strong style="color:#374151;">E-posta</strong><br>
                                        <span style="display:inline-block; margin-top:5px;">
                                            ${user.email}
                                        </span>
                                    </td>
                                </tr>
                            </table>

                            <!-- Reset Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td align="center" style="padding:5px 0 30px;">

                                        <a href="${url}"
                                            style="
                                                display:inline-block;
                                                padding:15px 32px;
                                                background:#111827;
                                                color:#ffffff;
                                                text-decoration:none;
                                                font-size:15px;
                                                font-weight:700;
                                                border-radius:8px;
                                                box-shadow:0 5px 15px rgba(17,24,39,0.20);
                                            ">
                                            Şifremi Sıfırla
                                        </a>

                                    </td>
                                </tr>
                            </table>

                            <!-- Technical Info -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                                style="background:#f9fafb; border-left:4px solid #374151; margin-bottom:28px;">
                                <tr>
                                    <td style="padding:16px 18px;">
                                        <p style="margin:0; font-size:13px; line-height:1.7; color:#6b7280;">
                                            <strong style="color:#374151;">Nasıl çalışır?</strong><br>
                                            Yukarıdaki bağlantıyı açtıktan sonra yeni şifrenizi belirleyin.
                                            Belirlediğiniz yeni şifre, hesabınıza güvenli bir şekilde
                                            <strong>PATCH</strong> isteği ile kaydedilecektir.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:0 0 18px; font-size:13px; line-height:1.7; color:#6b7280;">
                                Bu şifre sıfırlama talebini siz oluşturmadıysanız bu e-postayı
                                dikkate almayabilirsiniz. Hesabınızın güvenliği için bağlantıyı
                                başka kişilerle paylaşmayın.
                            </p>

                            <p style="margin:0; font-size:13px; line-height:1.7; color:#9ca3af;">
                                Bağlantı çalışmıyorsa aşağıdaki adresi tarayıcınıza
                                kopyalayıp yapıştırabilirsiniz:
                            </p>

                            <p style="
                                margin:8px 0 0;
                                font-size:12px;
                                line-height:1.6;
                                color:#6b7280;
                                word-break:break-all;
                            ">
                                ${url}
                            </p>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center"
                            style="padding:24px 30px; background:#f8fafc; border-top:1px solid #edf0f2;">

                            <p style="margin:0 0 6px; font-size:12px; color:#9ca3af;">
                                Bu e-posta otomatik olarak gönderilmiştir.
                            </p>

                            <p style="margin:0; font-size:12px; color:#9ca3af;">
                                © 2026 <strong>Tourify</strong>. Tüm hakları saklıdır.
                            </p>

                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>`,
    });
  }
  res.status(200).json({
    message: "Eposta adresine şifre sıfırlama bağlantısı gönderildi.",
    user,
  });
});

//b) yeni belirlenen şifreyi kaydet
export const resetPassword = catchAsync(async (req, res) => {
  // 1) parametre olarak gelen tokena eriş
  const token = req.params.token;

  //2) elimizde normal, veritabanında ise hashlenmiş token bulunduğu için bunları karşılaştırabilmek için normal tokenı hashle
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // 3) hashlenmiş tokenla ilişkili veritabanında kayıtlı kullanacıyı bul
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //3.1) token geçersiz veya süresi dolmuşsa hata gönder
  if (!user) throw new Unauthorized("Token geçersiz veya süresi dolmuş.");

  //4) kullanıcı bulunduysa ve token geçrrliyse kullanıcını bilgilerini güncelle
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // 5-) client'a yanıt gönder
  res.status(200).json({ message: "Şifre güncellendi. " });
});

// şifremi güncelle

export const updatePassword = catchAsync(async (req, res) => {
  //1) kullanıcı bilgilerini al
  const user = req.user;

  // 2) gelen mevcut şifre doğru mu kontrol
  const isCorrect = await bcrypt.compare(
    req.body.currentPassword,
    user.password,
  );

  //2.1) şifre yanlışsa hata gönder
  if (!isCorrect) throw new BadRequest("Mevcut şifreniz hatalı");

  //3) şifre doğruysa yeni şifreyi kaydet
  user.password = req.body.newPassword;
  user.save();

  res.status(200).json({ message: "Şifreniz güncellendi." });
});
