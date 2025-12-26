# Painel de Demandas

Aplicação full‑stack para gestão de projetos e tickets com autenticação, base de conhecimento e painel de métricas.

## Stack

- Backend: Laravel (Sanctum para API tokens, Mail, Cache)
- Frontend: React + Vite
- Banco: SQLite (padrão) ou outro via `.env`

## Executar localmente

1. Backend
   - Copie `.env.example` para `.env` e ajuste banco e mailer
   - Instale dependências: `composer install`
   - Rode migrations: `php artisan migrate`
   - Inicie servidor: `php artisan serve` (http://127.0.0.1:8000)

2. Frontend
   - Instale dependências: `npm install` (na pasta `frontend`)
   - Inicie dev server: `npm run dev` (http://localhost:5173)

## Autenticação e Cadastro

- `POST /api/register`: cria usuário colaborador e retorna `{ token, user }`
- `POST /api/login`: autentica e retorna `{ token, user }`
- `GET /api/me`: dados do usuário autenticado
- `POST /api/logout`: revoga tokens

### Recuperação de Senha

- `POST /api/forgot-password`: envia código de 6 dígitos por e‑mail
- `POST /api/reset-password`: redefine senha com `{ email, code, password }`
- Em desenvolvimento, use `MAIL_MAILER=log` para ver conteúdo do e‑mail em `storage/logs/laravel.log`

## Projetos e Tickets

- `GET /api/projects`: lista projetos do usuário
- `POST /api/projects`: cria projeto
- `PUT /api/projects/{id}`: renomeia
- `DELETE /api/projects/{id}`: exclui
- `GET /api/projects/{id}/members`: lista membros
- `POST /api/projects/{id}/members`: vincula por `user_id` ou `email`
- `DELETE /api/projects/{id}/members/{userId}`: desvincula membro

### Dashboard e Métricas

- Tickets sem projeto (`project_id=null`) são incluídos nas métricas e listas quando aplicável

## Base de Conhecimento (KB)

- Colaboradores e admins podem criar categorias (`POST /api/kb/categories`)
- Ações administrativas mantidas sob `can:manage-users` quando necessário

## Frontend

- Navegação por `Sidebar`, com grupo **Projetos**:
  - Botão `+ Cadastrar projeto` aparece mesmo sem projetos
  - Itens internos: `Tickets`, `Dashboard`, `Vincular colaborador`
- Tela de Login
  - Login, Cadastro e Recuperação de senha no mesmo fluxo
  - Fundo com manchas animadas (também na Home)

## Variáveis de Ambiente (backend)

- Banco: `DB_CONNECTION`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- Mailer: `MAIL_MAILER`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_ENCRYPTION`, `MAIL_FROM_ADDRESS`, `MAIL_FROM_NAME`

## Convenções de Código

- PHP: Controllers com docblocks nos endpoints
- React: componentes funcionais, estado local e chamadas à API via `api.ts`
- Comentários explicativos foram adicionados em arquivos chave:
  - `backend/app/Http/Controllers/AuthController.php`
  - `backend/routes/api.php`
  - `frontend/src/App.jsx`
  - `frontend/src/components/Sidebar/index.tsx`

## Notas de Segurança

- Nunca commitar segredos no repositório
- Tokens são guardados em `localStorage` apenas para sessão dev; para produção, considerar `http‑only cookies`

## Próximos Passos

- Configurar mailer real para produção (SendGrid/SES)
- Adicionar testes automatizados de API e UI
- Refinar autorização por papéis (admin/colaborador/cliente)

