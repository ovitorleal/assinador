"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type TermResponse = {
  id: string;
  title: string;
  description: string;
  content: string;
  version: string;
  contentHash: string;
};

export default function PublicTermPage({ params }: { params: { token: string } }) {
  const [term, setTerm] = useState<TermResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<"register" | "read" | "success">("register");
  const [form, setForm] = useState({ name: "", cpf: "", email: "" });
  const [scrolledEnd, setScrolledEnd] = useState(false);
  const [agree, setAgree] = useState(false);
  const [protocol, setProtocol] = useState<string | null>(null);
  const [consentId, setConsentId] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/term/${params.token}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Termo não encontrado");
        return res.json();
      })
      .then((data) => setTerm(data.term))
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, [params.token]);

  const canAccept = useMemo(() => scrolledEnd && agree, [scrolledEnd, agree]);

  if (loading) return <main className="p-10 text-center">Carregando...</main>;
  if (!term) return <main className="p-10 text-center">Termo indisponível.</main>;

  async function register(event: React.FormEvent) {
    event.preventDefault();
    setStep("read");
  }

  async function accept() {
    if (!window.confirm("Tem certeza de que deseja aceitar este termo? Esta ação ficará registrada.")) return;

    const res = await fetch(`/api/term/${params.token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Não foi possível registrar aceite");
      return;
    }

    setProtocol(data.protocol);
    setConsentId(data.consentId);
    setStep("success");
  }

  return (
    <main className="mx-auto max-w-3xl p-4 md:p-8">
      <div className="card p-6">
        <h1 className="text-2xl font-semibold">{term.title}</h1>
        <p className="text-slate-600">{term.description}</p>
        {step === "register" && (
          <form onSubmit={register} className="mt-6 space-y-3">
            <input required placeholder="Nome completo" className="w-full rounded-xl border p-3" onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input required placeholder="CPF" className="w-full rounded-xl border p-3" onChange={(e) => setForm({ ...form, cpf: e.target.value })} />
            <input required type="email" placeholder="E-mail" className="w-full rounded-xl border p-3" onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <button className="rounded-xl bg-brand-500 px-4 py-2 text-white">Continuar</button>
          </form>
        )}

        {step === "read" && (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-slate-500">Aluno: {form.name}</p>
            <div
              ref={contentRef}
              onScroll={(event) => {
                const element = event.currentTarget;
                if (element.scrollTop + element.clientHeight >= element.scrollHeight - 10) {
                  setScrolledEnd(true);
                }
              }}
              className="max-h-72 overflow-y-auto rounded-xl border p-4"
              dangerouslySetInnerHTML={{ __html: term.content }}
            />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" disabled={!scrolledEnd} checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              Declaro que li e concordo com os termos acima.
            </label>
            <button disabled={!canAccept} onClick={accept} className="rounded-xl bg-brand-500 px-4 py-2 text-white disabled:opacity-50">Aceitar</button>
          </div>
        )}

        {step === "success" && (
          <div className="mt-6 space-y-3 text-center">
            <h2 className="text-xl font-semibold text-emerald-700">Aceite registrado com sucesso!</h2>
            <p>Protocolo: <strong>{protocol}</strong></p>
            {consentId && <a className="text-brand-600" href={`/api/consents/${consentId}/pdf`}>Baixar comprovante em PDF</a>}
          </div>
        )}
      </div>
    </main>
  );
}
