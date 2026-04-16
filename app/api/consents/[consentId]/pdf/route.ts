import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateConsentPdf } from "@/lib/pdf";

export async function GET(_: Request, { params }: { params: { consentId: string } }) {
  const consent = await prisma.consent.findUnique({
    where: { id: params.consentId },
    include: { student: true, term: true }
  });

  if (!consent || !consent.acceptedAt) return NextResponse.json({ error: "Consentimento não encontrado" }, { status: 404 });

  const pdf = await generateConsentPdf({
    studentName: consent.student.name,
    cpf: consent.student.cpf,
    email: consent.student.email,
    termTitle: consent.term.title,
    termText: consent.termSnapshot,
    acceptedAt: consent.acceptedAt.toISOString(),
    ip: consent.ip,
    userAgent: consent.userAgent,
    termHash: consent.termHash,
    protocol: consent.protocol
  });

  return new NextResponse(pdf, {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="comprovante-${consent.protocol}.pdf"`
    }
  });
}
