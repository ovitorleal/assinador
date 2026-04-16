import Link from "next/link";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="font-semibold">Painel de Termos</h1>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/admin/dashboard">Dashboard</Link>
            <Link href="/admin/terms/new">Novo Termo</Link>
            <Link href="/admin/audit">Auditoria</Link>
            <Link href="/api/auth/signout">Sair</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-6">{children}</main>
    </div>
  );
}
