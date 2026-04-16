import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/guard";
import { prisma } from "@/lib/prisma";

export default async function TermDetailPage({ params }: { params: { termId: string } }) {
  await requireAdmin();

  const term = await prisma.term.findUnique({
    where: { id: params.termId },
    include: {
      consents: {
        where: { accepted: true },
        include: { student: true },
        orderBy: { acceptedAt: "desc" }
      },
      _count: { select: { accesses: true, consents: true } }
    }
  });

  if (!term) notFound();

  return (
    <AdminShell>
      <div className="card p-6">
        <h2 className="text-xl font-semibold">{term.title}</h2>
        <p className="text-slate-600">{term.description}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div><span className="text-sm text-slate-500">Acessos</span><p className="text-2xl font-semibold">{term._count.accesses}</p></div>
          <div><span className="text-sm text-slate-500">Aceites</span><p className="text-2xl font-semibold">{term._count.consents}</p></div>
          <div><span className="text-sm text-slate-500">Pendentes</span><p className="text-2xl font-semibold">{Math.max(term._count.accesses - term._count.consents, 0)}</p></div>
        </div>
        <p className="mt-4 text-sm">Link público: <Link href={`/termo/${term.publicToken}`} className="text-brand-600">/termo/{term.publicToken}</Link></p>
        <Link href={`/api/admin/consents/export?termId=${term.id}`} className="mt-2 inline-block text-sm text-brand-600">Exportar CSV</Link>
      </div>

      <div className="card mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr><th className="px-4 py-3">Nome</th><th className="px-4 py-3">CPF</th><th className="px-4 py-3">E-mail</th><th className="px-4 py-3">Data</th><th className="px-4 py-3">IP</th><th className="px-4 py-3">Protocolo</th></tr>
          </thead>
          <tbody>
            {term.consents.map((consent) => (
              <tr key={consent.id} className="border-t">
                <td className="px-4 py-3">{consent.student.name}</td>
                <td className="px-4 py-3">{consent.student.cpf}</td>
                <td className="px-4 py-3">{consent.student.email}</td>
                <td className="px-4 py-3">{consent.acceptedAt?.toISOString()}</td>
                <td className="px-4 py-3">{consent.ip}</td>
                <td className="px-4 py-3">{consent.protocol}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
