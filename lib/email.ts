import { Resend } from "resend";

type SendInput = {
  to: string;
  studentName: string;
  protocol: string;
  termTitle: string;
  pdfUrl?: string;
};

export async function sendConsentEmail(input: SendInput) {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) return;

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to: input.to,
    subject: `Comprovante de aceite - ${input.termTitle}`,
    html: `<p>Olá, ${input.studentName}.</p><p>Seu aceite foi registrado com sucesso.</p><p><strong>Protocolo:</strong> ${input.protocol}</p>${
      input.pdfUrl ? `<p>Baixar comprovante: <a href="${input.pdfUrl}">${input.pdfUrl}</a></p>` : ""
    }`
  });
}
