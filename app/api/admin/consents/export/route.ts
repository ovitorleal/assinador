import { NextResponse } from "next/server";
import { stringify } from "csv-stringify/sync";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const termId = url.searchParams.get("termId");
  if (!termId) return NextResponse.json({ error: "termId obrigatório" }, { status: 400 });

  const consents = await prisma.consent.findMany({
    where: { termId, accepted: true },
    include: { student: true },
    orderBy: { acceptedAt: "desc" }
  });

  const csv = stringify(
    consents.map((c) => ({
      nome: c.student.name,
      cpf: c.student.cpf,
      email: c.student.email,
      acceptedAt: c.acceptedAt?.toISOString(),
      ip: c.ip,
      protocolo: c.protocol
    })),
    { header: true }
  );

  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="consents-${termId}.csv"`
    }
  });
}
