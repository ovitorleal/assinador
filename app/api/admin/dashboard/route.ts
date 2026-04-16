import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [terms, accesses, consents] = await Promise.all([
    prisma.term.count(),
    prisma.termAccess.count(),
    prisma.consent.count({ where: { accepted: true } })
  ]);

  return NextResponse.json({ terms, accesses, consents });
}
