import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildProtocol } from "@/lib/hash";
import { getClientMeta } from "@/lib/request";
import { studentSchema } from "@/lib/validation";
import { generateConsentPdf } from "@/lib/pdf";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendConsentEmail } from "@/lib/email";

export async function GET(_: Request, { params }: { params: { token: string } }) {
  const term = await prisma.term.findUnique({
    where: { publicToken: params.token, status: "ACTIVE" },
    select: {
      id: true,
      title: true,
      description: true,
      content: true,
      version: true,
      contentHash: true
    }
  });

  if (!term) return NextResponse.json({ error: "Termo não encontrado" }, { status: 404 });

  const meta = getClientMeta();
  await prisma.termAccess.create({ data: { termId: term.id, ip: meta.ip, userAgent: meta.userAgent } });

  return NextResponse.json({ term });
}

export async function POST(request: Request, { params }: { params: { token: string } }) {
  const payload = studentSchema.parse(await request.json());
  const term = await prisma.term.findUnique({ where: { publicToken: params.token, status: "ACTIVE" } });
  if (!term) return NextResponse.json({ error: "Termo inválido" }, { status: 404 });

  const meta = getClientMeta();
  const student = await prisma.student.upsert({
    where: { cpf_email: { cpf: payload.cpf.replace(/\D/g, ""), email: payload.email.toLowerCase() } },
    create: { name: payload.name, cpf: payload.cpf.replace(/\D/g, ""), email: payload.email.toLowerCase() },
    update: { name: payload.name }
  });

  const existing = await prisma.consent.findFirst({ where: { termId: term.id, studentId: student.id, accepted: true } });
  if (existing) return NextResponse.json({ error: "Termo já aceito para este aluno" }, { status: 409 });

  const protocol = buildProtocol();
  const acceptedAt = new Date();

  const consent = await prisma.consent.create({
    data: {
      termId: term.id,
      studentId: student.id,
      accepted: true,
      acceptedAt,
      ip: meta.ip,
      userAgent: meta.userAgent,
      protocol,
      termSnapshot: term.content,
      termHash: term.contentHash
    }
  });

  await prisma.auditLog.createMany({
    data: [
      { consentId: consent.id, action: "CONSENT_CREATED", metadata: { ip: meta.ip, userAgent: meta.userAgent } },
      { consentId: consent.id, action: "CONSENT_ACCEPTED", metadata: { acceptedAt: acceptedAt.toISOString(), termVersion: term.version } }
    ]
  });

  const pdfBuffer = await generateConsentPdf({
    studentName: student.name,
    cpf: student.cpf,
    email: student.email,
    termTitle: term.title,
    termText: term.content,
    acceptedAt: acceptedAt.toISOString(),
    ip: meta.ip,
    userAgent: meta.userAgent,
    termHash: term.contentHash,
    protocol
  });

  let pdfUrl: string | undefined;

  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_BUCKET) {
    const supabase = getSupabaseAdmin();
    const path = `consents/${consent.id}.pdf`;
    await supabase.storage.from(process.env.SUPABASE_BUCKET).upload(path, pdfBuffer, { contentType: "application/pdf", upsert: true });
    const { data } = supabase.storage.from(process.env.SUPABASE_BUCKET).getPublicUrl(path);
    pdfUrl = data.publicUrl;
    await prisma.consent.update({ where: { id: consent.id }, data: { pdfPath: path } });
  }

  await sendConsentEmail({
    to: student.email,
    studentName: student.name,
    protocol,
    termTitle: term.title,
    pdfUrl
  });

  return NextResponse.json({ consentId: consent.id, protocol, pdfUrl });
}
