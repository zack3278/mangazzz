import { Resend } from "resend";

type SendMailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY тохируулаагүй байна");
  }

  return new Resend(apiKey);
}

/**
 * 2 янзаар дуудаж болно:
 *
 * 1) sendMail({ to, subject, html, text })
 * 2) sendMail(to, subject, html)
 */
export async function sendMail(
  inputOrTo: SendMailInput | string,
  subjectArg?: string,
  htmlArg?: string
) {
  const resend = getResendClient();

  const from =
    process.env.MAIL_FROM ||
    process.env.RESEND_FROM ||
    "Mangazet <onboarding@resend.dev>";

  let to: string;
  let subject: string;
  let html: string;
  let text: string | undefined;

  if (typeof inputOrTo === "string") {
    to = inputOrTo;
    subject = subjectArg || "Mangazet";
    html = htmlArg || "";
    text = undefined;
  } else {
    to = inputOrTo.to;
    subject = inputOrTo.subject;
    html = inputOrTo.html;
    text = inputOrTo.text;
  }

  const result = await resend.emails.send({
    from,
    to,
    subject,
    html,
    text,
  });

  return result;
}

export async function sendOtpEmail({
  email,
  code,
  type,
}: {
  email: string;
  code: string;
  type: "REGISTER" | "RESET_PASSWORD";
}) {
  const title =
    type === "RESET_PASSWORD"
      ? "Mangazet нууц үг сэргээх код"
      : "Mangazet баталгаажуулах код";

  const description =
    type === "RESET_PASSWORD"
      ? "Нууц үгээ сэргээхийн тулд доорх кодыг ашиглана уу."
      : "Бүртгэлээ баталгаажуулахын тулд доорх кодыг ашиглана уу.";

  return sendMail({
    to: email,
    subject: title,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6">
        <h2>${title}</h2>
        <p>${description}</p>
        <div style="font-size:28px;font-weight:bold;letter-spacing:6px;margin:20px 0">
          ${code}
        </div>
        <p>Энэ код богино хугацаанд хүчинтэй.</p>
      </div>
    `,
    text: `${title}\n\n${description}\n\nКод: ${code}`,
  });
}