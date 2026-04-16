import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/guard";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  await requireAdmin();

  const [termCount, accessCount, consentCount, terms] = await Promise.all([
    prisma.term.count(),
    prisma.termAccess.count(),
    prisma.consent.count({ where: { accepted: true } }),
    prisma.term.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { consents: true, accesses: true } } } })
  ]);

  return (
    <AdminShell>
      <section className="grid gap-4 md:grid-cols-3">
        <div className="card p-4"><p className="text-sm text-slate-500">Termos</p><p className="text-3xl font-semibold">{termCount}</p></div>
        <div className="card p-4"><p className="text-sm text-slate-500">Acessos</p><p className="text-3xl font-semibold">{accessCount}</p></div>
        <div className="card p-4"><p className="text-sm text-slate-500">Aceites</p><p className="text-3xl font-semibold">{consentCount}</p></div>
      </section>

      <section className="card mt-6 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3">Título</th><th className="px-4 py-3">Versão</th><th className="px-4 py-3">Acessos</th><th className="px-4 py-3">Aceites</th><th className="px-4 py-3">Link</th>
            </tr>
          </thead>
          <tbody>
            {terms.map((term) => (
              <tr key={term.id} className="border-t">
                <td className="px-4 py-3">{term.title}</td>
                <td className="px-4 py-3">{term.version}</td>
                <td className="px-4 py-3">{term._count.accesses}</td>
                <td className="px-4 py-3">{term._count.consents}</td>
                <td className="px-4 py-3">
                  <Link className="text-brand-600" href={`/admin/terms/${term.id}`}>Detalhes</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </AdminShell>
  );
}
