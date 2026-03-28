# Instruções de Migração — Colo → Laço

## O que foi feito

Devido a um problema de sincronização do OneDrive, os arquivos do Laço não puderam
ser escritos diretamente na pasta `src/` (que existe como placeholder na nuvem mas
não está baixada localmente). Os arquivos foram criados em dois lugares:

- **`src_restored/`** — contém TODOS os arquivos do projeto (originais + novos da migração)
- **`prisma_new/schema.prisma`** — schema Prisma atualizado (v2.0 com Payment, Withdrawal, etc.)
- **`package_new.json`** — package.json atualizado com todas as novas dependências

---

## Passo a Passo para Aplicar a Migração

### 1. Substitua a pasta src/

No Explorer do Windows, dentro de `laco-app/`:

```
1. Delete a pasta "src" atual (está vazia — é só um placeholder)
2. Renomeie "src_restored" para "src"
```

Ou via terminal PowerShell:
```powershell
cd C:\Users\lucas\OneDrive\Documents\06. App\Laco\laco-app
Remove-Item -Recurse -Force src
Rename-Item src_restored src
```

### 2. Substitua o schema.prisma

```powershell
Copy-Item prisma_new\schema.prisma prisma\schema.prisma -Force
Remove-Item -Recurse -Force prisma_new
```

### 3. Substitua o package.json

```powershell
Copy-Item package_new.json package.json -Force
Remove-Item package_new.json
```

### 4. Remova arquivos de teste criados

```powershell
Remove-Item -Recurse -Force test_new_dir
Remove-Item test_new_file.txt
```

### 5. Instale as novas dependências

```powershell
npm install
```

### 6. Configure as variáveis de ambiente

Adicione ao `.env` as variáveis novas (se não existirem):

```env
# Pagar.me
PAGARME_SECRET_KEY=sk_test_...
PAGARME_WEBHOOK_SECRET=seu_webhook_secret

# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Criptografia CPF (gere com: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
ENCRYPTION_KEY=64_hex_chars_aqui

# Resend (emails)
RESEND_API_KEY=re_...

# NextAuth (já deve existir)
NEXTAUTH_SECRET=...
```

### 7. Rode a migration do Prisma

```powershell
npx prisma migrate dev --name colo-infrastructure
```

Isso vai criar as novas tabelas: `Payment`, `Withdrawal`, `Photo`, `AuditLog`, `RateLimit`
E adicionar colunas novas: `User.hashedPassword`, `User.image`, `Wedding.coverImage`,
`Wedding.totalRaised`, `Wedding.bankCode/Agency/Account/Type/Cpf`, etc.

### 8. Valide o build

```powershell
npx tsc --noEmit
npx next build
```

---

## O que foi adicionado/alterado em src/lib/

| Arquivo | Status | O que faz |
|---------|--------|-----------|
| `prisma.ts` | **SUBSTITUÍDO** | Usa PrismaPg adapter (connection pooling melhorado) |
| `auth.ts` | **SUBSTITUÍDO** | Suporte a hashedPassword + Google OAuth + cookie fix |
| `rateLimit.ts` | **NOVO** | Rate limiter distribuído via PostgreSQL |
| `crypto.ts` | **NOVO** | AES-256-GCM para CPF (requer ENCRYPTION_KEY) |
| `apiHelpers.ts` | **NOVO** | validateContentType + getClientIp |
| `auditLog.ts` | **NOVO** | Log de auditoria (fire-and-forget) |
| `storage.ts` | **NOVO** | Upload/delete no Supabase Storage |
| `pagarme.ts` | **NOVO** | Integração Pagar.me (Pix, taxas 3.5%) |
| `resend.ts` | **NOVO** | Magic link via Resend (NextAuth EmailProvider) |
| `validators.ts` | **NOVO** | Schemas Zod para todos os modelos |
| `emails.ts` | **NOVO** | Templates de email transacional |
| `utils.ts` | **NOVO** | Formatação, slugify, countdown casamento |
| `colorUtils.ts` | **NOVO** | Paletas por estilo (clássico, rústico, etc.) |

## Novas APIs criadas

| Rota | O que faz |
|------|-----------|
| `POST /api/payments/orders` | Cria pedido Pix para um presente |
| `POST /api/payments/webhook` | Webhook Pagar.me (confirma pagamento) |

## Middleware atualizado

`src/middleware.ts` — protege rotas `/app/*` e APIs privadas com JWT NextAuth.
Rotas públicas: `/lista/*`, `/api/payments/*`, `/api/auth/*`
