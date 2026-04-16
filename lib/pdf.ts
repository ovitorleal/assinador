import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

type PdfInput = {
  studentName: string;
  cpf: string;
  email: string;
  termTitle: string;
  termText: string;
  acceptedAt: string;
  ip: string;
  userAgent: string;
  termHash: string;
  protocol: string;
};

export async function generateConsentPdf(input: PdfInput) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = 800;
  const write = (text: string, size = 10, isBold = false) => {
    const activeFont = isBold ? bold : font;
    page.drawText(text.slice(0, 110), { x: 50, y, size, font: activeFont, color: rgb(0.15, 0.15, 0.2) });
    y -= size + 6;
  };

  write("Comprovante de Aceite Eletrônico", 16, true);
  write(`Termo: ${input.termTitle}`, 11, true);
  y -= 6;
  write(`Nome: ${input.studentName}`);
  write(`CPF: ${input.cpf}`);
  write(`E-mail: ${input.email}`);
  write(`Data/Hora (UTC): ${input.acceptedAt}`);
  write(`IP: ${input.ip}`);
  write(`Navegador: ${input.userAgent}`);
  write(`Hash SHA-256: ${input.termHash}`);
  write(`Protocolo: ${input.protocol}`);
  y -= 10;
  write("Texto do termo:", 11, true);

  const stripped = input.termText.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const chunkSize = 95;
  for (let i = 0; i < stripped.length; i += chunkSize) {
    if (y < 70) {
      y = 800;
      pdfDoc.addPage([595, 842]);
    }
    write(stripped.slice(i, i + chunkSize), 9);
  }

  page.drawText("Documento aceito eletronicamente.", {
    x: 50,
    y: 30,
    size: 10,
    font: bold,
    color: rgb(0.2, 0.2, 0.2)
  });

  return Buffer.from(await pdfDoc.save());
}
