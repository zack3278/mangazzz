import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

export async function sendMail(to: string, subject: string, html: string) {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS?.replace(/\s/g, "");
  const from = process.env.SMTP_FROM || user;

  if (!user || !pass) {
    throw new Error("SMTP_USER эсвэл SMTP_PASS тохируулаагүй байна");
  }

  const options: SMTPTransport.Options = {
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,

    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,

    auth: {
      user,
      pass,
    },
  };

  const transporter = nodemailer.createTransport(options);

  await transporter.sendMail({
    from,
    to,
    subject,
    html,
  });
}