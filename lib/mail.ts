import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMail(to: string, subject: string, html: string) {
  const from = process.env.RESEND_FROM || "Mangazet <onboarding@resend.dev>";

  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY тохируулаагүй байна");
  }

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
  });

  if (error) {
    console.error("RESEND MAIL ERROR:", error);
    throw new Error(error.message || "Email илгээхэд алдаа гарлаа");
  }

  return data;
}