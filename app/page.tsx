import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl items-center justify-center p-6">
      <div className="card w-full p-10 text-center">
        <h1 className="text-3xl font-semibold">Plataforma de Aceite Eletrônico</h1>
        <p className="mt-3 text-slate-600">Gestão de termos com trilha de auditoria para instituições de ensino.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link className="rounded-xl bg-brand-500 px-5 py-2.5 font-medium text-white" href="/admin">
            Acessar Admin
          </Link>
        </div>
      </div>
    </main>
  );
}
