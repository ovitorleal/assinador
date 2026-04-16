# Assinador de Termos para Alunos (Next.js + Supabase + Prisma)

Sistema completo para aceite eletrônico de termos por alunos, com trilha de auditoria, geração de PDF, envio de e-mail e painel administrativo.

## Stack

- Next.js 14 + React + TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL (Supabase)
- NextAuth (login admin)
- pdf-lib (geração de comprovante)
- Resend (envio de e-mail)
- Deploy em Vercel

## Funcionalidades implementadas

- Login de administrador com senha hash (bcrypt)
- Dashboard com totais (termos, acessos, aceites)
- Criação de termos com versão, status e hash SHA-256
- Link público único por termo (UUID)
- Captura de acesso com IP + User-Agent
- Fluxo público: cadastro do aluno, leitura e aceite com confirmação
- Validação de CPF e e-mail
- Uma aceitação por termo/aluno
- Registro de consentimento com snapshot do termo
- Trilha de auditoria (AuditLog)
- Geração de PDF de comprovante
- Upload do PDF para Supabase Storage
- Envio de e-mail automático com protocolo
- Exportação CSV de aceites
- Página de auditoria administrativa

---

## 1) Criar conta gratuita no Supabase

1. Acesse https://supabase.com e crie conta gratuita.
2. Crie um projeto novo (região mais próxima).
3. No painel do projeto, abra **Project Settings > Database** e copie:
   - Connection string (pooling) para `DATABASE_URL`
   - Connection string direta para `DIRECT_URL`
4. Em **Project Settings > API**, copie:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Em **Storage**, crie bucket público chamado `consent-pdfs` (ou nome que preferir e ajuste `.env`).

## 2) Criar banco PostgreSQL

Com o projeto Supabase criado, rode as migrations locais com Prisma:

```bash
npm install
cp .env.example .env
# preencher .env
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
```

## 3) Configurar variáveis de ambiente

Use o arquivo `.env.example` como base:

- `DATABASE_URL`: URL com pooler do Supabase
- `DIRECT_URL`: URL direta do banco
- `NEXTAUTH_URL`: URL local ou produção
- `NEXTAUTH_SECRET`: segredo forte
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_BUCKET`
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`

## 4) Rodar localmente

```bash
npm install
npm run dev
```

Acesse:
- `http://localhost:3000/admin` (admin)
- usuário seed: `admin@escola.com`
- senha seed: `Admin@123`

## 5) Deploy gratuito na Vercel

1. Suba o projeto no GitHub.
2. Na Vercel, **New Project** e importe o repositório.
3. Defina as variáveis de ambiente da `.env` na Vercel.
4. Deploy.
5. Após deploy, atualize `NEXTAUTH_URL` para a URL da Vercel.

## Prisma + Supabase (integração automática)

- O Prisma usa `DATABASE_URL`/`DIRECT_URL` automaticamente.
- Em produção (Vercel), adicione as variáveis no painel da Vercel.
- O client é gerado no build (`npm run build`).

## Segurança aplicada

- Hash SHA-256 do conteúdo do termo
- Senha de admin com bcrypt
- Sanitização de HTML do termo com DOMPurify
- Captura de IP e User-Agent
- Protocolo único por aceite
- Registro de snapshot do texto aceito
- Eventos em AuditLog

## Observações legais (LGPD / Lei 14.063 / MP 2.200-2)

Este projeto implementa trilha técnica de assinatura eletrônica simples/avançada (coleta de evidências digitais). Para produção jurídica, valide com assessoria jurídica e política de retenção, consentimento e privacidade da instituição.

## Endpoints principais

- `POST /api/admin/terms` cria termo
- `GET /api/term/:token` carrega termo público e registra acesso
- `POST /api/term/:token` registra aceite
- `GET /api/consents/:consentId/pdf` baixa comprovante PDF
- `GET /api/admin/consents/export?termId=...` exporta CSV

## Exemplo de dados fictícios

Seed cria:
- Admin: `admin@escola.com`
- Termo: `Termo de Matrícula 2026`
- Token público fixo para teste:
  - `/termo/11111111-1111-1111-1111-111111111111`

