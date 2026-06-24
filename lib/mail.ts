import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import dns from "dns/promises";

export async function sendMail(to: string, subject: string, html: string) {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS?.replace(/\s/g, "");
  const from = process.env.SMTP_FROM || user;

  if (!user || !pass) {
    throw new Error("SMTP_USER эсвэл SMTP_PASS тохируулаагүй байна");
  }

  // Gmail SMTP-ийн IPv4 address авах
  const addresses = await dns.resolve4("smtp.gmail.com");

  if (!addresses.length) {
    throw new Error("smtp.gmail.com IPv4 address олдсонгүй");
  }

  const smtpIp = addresses[0];

  const options: SMTPTransport.Options = {
    host: smtpIp,
    port: 587,
    secure: false,
    requireTLS: true,

    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 20000,

    auth: {
      user,
      pass,
    },

    // IP-р холбогдож байгаа ч TLS certificate нь smtp.gmail.com нэрээр шалгагдана
    tls: {
      servername: "smtp.gmail.com",
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