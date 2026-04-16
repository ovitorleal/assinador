import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sha256 } from "@/lib/hash";
import DOMPurify from "isomorphic-dompurify";

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(3),
  content: z.string().min(30),
  version: z.string().min(1),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE")
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = schema.parse(await request.json());
  const cleanContent = DOMPurify.sanitize(payload.content);
  const term = await prisma.term.create({
    data: {
      ...payload,
      content: cleanContent,
      contentHash: sha256(cleanContent)
    }
  });

  return NextResponse.json({ term });
}
