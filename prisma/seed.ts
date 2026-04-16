import bcrypt from "bcryptjs";
import { PrismaClient, TermStatus } from "@prisma/client";
import { createHash } from "node:crypto";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Admin@123", 10);

  await prisma.user.upsert({
    where: { email: "admin@escola.com" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@escola.com",
      passwordHash
    }
  });

  const content = `<h2>Termo de Consentimento Escolar</h2><p>Declaro ciência das regras institucionais e autorizo o tratamento dos meus dados para fins educacionais.</p><p>Estou ciente da política de privacidade e do uso de dados conforme LGPD.</p>`;
  const contentHash = createHash("sha256").update(content).digest("hex");

  await prisma.term.upsert({
    where: { publicToken: "11111111-1111-1111-1111-111111111111" },
    update: {},
    create: {
      title: "Termo de Matrícula 2026",
      description: "Aceite digital para alunos matriculados no período 2026.",
      content,
      version: "v1.0",
      status: TermStatus.ACTIVE,
      contentHash,
      publicToken: "11111111-1111-1111-1111-111111111111"
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
