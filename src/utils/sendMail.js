import { MailtrapTransport } from "mailtrap";
import nodemailer from "nodemailer";

const sendMail = async (options) => {
  // maili göndericek sağlayıcının ayarlarını yap
  const transporter = nodemailer.createTransport(
    MailtrapTransport({ token: process.env.EMAIL_TOKEN }),
  );

  // göndereni tanımla tanımla
  const sender = {
    address: "support@demomailtrap.co",
    name: "Tour Destek",
  };

  //mail içeriğini tanımla
  const mailOptions = {
    from: sender,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  // mail gönder
  await transporter.sendMail(mailOptions);
};
export default sendMail;
