"use client";

import { AdminShell } from "@/components/admin/admin-shell";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function NewTermPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    setLoading(true);
    const res = await fetch("/api/admin/terms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setLoading(false);

    if (!res.ok) {
      toast.error("Erro ao criar termo");
      return;
    }

    toast.success("Termo criado com sucesso");
    router.push("/admin/dashboard");
  }

  return (
    <AdminShell>
      <form onSubmit={onSubmit} className="card mx-auto max-w-3xl space-y-4 p-6">
        <h2 className="text-xl font-semibold">Novo termo</h2>
        <input required name="title" placeholder="Título" className="w-full rounded-xl border p-3" />
        <input required name="description" placeholder="Descrição" className="w-full rounded-xl border p-3" />
        <input required name="version" placeholder="Versão (ex: v1.0)" className="w-full rounded-xl border p-3" />
        <select name="status" className="w-full rounded-xl border p-3">
          <option value="ACTIVE">Ativo</option>
          <option value="INACTIVE">Inativo</option>
        </select>
        <textarea required name="content" rows={12} placeholder="Conteúdo HTML do termo" className="w-full rounded-xl border p-3" />
        <button disabled={loading} className="rounded-xl bg-brand-500 px-4 py-2 text-white" type="submit">
          {loading ? "Salvando..." : "Criar termo"}
        </button>
      </form>
    </AdminShell>
  );
}
