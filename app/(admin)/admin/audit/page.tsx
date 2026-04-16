import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/guard";
import { prisma } from "@/lib/prisma";

export default async function AuditPage() {
  await requireAdmin();

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      consent: {
        include: {
          student: true,
          term: true
        }
      }
    }
  });

  return (
    <AdminShell>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr><th className="px-4 py-3">Data</th><th className="px-4 py-3">Ação</th><th className="px-4 py-3">Aluno</th><th className="px-4 py-3">Termo</th><th className="px-4 py-3">Detalhes</th></tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t align-top">
                <td className="px-4 py-3">{log.createdAt.toISOString()}</td>
                <td className="px-4 py-3">{log.action}</td>
                <td className="px-4 py-3">{log.consent.student.name}</td>
                <td className="px-4 py-3">{log.consent.term.title}</td>
                <td className="px-4 py-3 text-xs text-slate-600">{JSON.stringify(log.metadata)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
