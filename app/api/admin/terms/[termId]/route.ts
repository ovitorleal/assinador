import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { termId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const term = await prisma.term.findUnique({
    where: { id: params.termId },
    include: { consents: { include: { student: true } }, accesses: true }
  });

  return NextResponse.json({ term });
}
