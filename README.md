# Painel de Demandas

Sistema simples para gestão de tickets com Kanban, filtros por data e pessoas, comentários, e administração de usuários com perfis de acesso.

## Funcionalidades

- Kanban de tickets com status: `backlog`, `a_fazer`, `fazendo`, `pronto`, `para_teste`, `em_teste`, `finalizado`.
- Campos do ticket: título, subtítulo, descrição, responsável, solicitante, previsão (`data_prevista`), prioridade.
- Comentários por ticket (histórico de atualizações), com editar e excluir quando permitido.
- Filtros na Home:
  - Pessoas (responsável), incluindo opção “Sem responsável”.
  - Período de Previsão (de/até).
  - Período de Criação (de/até).
- Administração de usuários:
  - Cadastro, listagem, remoção.
  - Edição (nome, e-mail, senha, setor, cargo, admin, tipo).
  - Campo `tipo` com dois perfis:
    - `colaborador`: acesso normal (criar/editar/mover/excluir onde aplicável).
    - `cliente`: somente visualização — botões e campos desabilitados no frontend e bloqueio de escrita no backend.
- Regras de permissão no backend:
  - `can:manage-users` definido para administradores (is_admin) em `backend/app/Providers/AppServiceProvider.php`.
  - Usuários `cliente` não podem criar/editar tickets ou comentários.

- Base de conhecimento: categorias e artigos com busca e filtros no topo e resultados listados verticalmente; possibilidade de vincular artigos a tickets.
- Projetos e tags: organização e classificação de tickets, com endpoints para CRUD e associação.
- Anexos de tickets: upload, listagem e remoção de arquivos vinculados aos tickets.

## Requisitos

- PHP 8.2+
- Composer
- Node.js 20.19+ (ou 22.12+)
- NPM 10+
- SQLite (padrão) ou outro banco suportado pelo Laravel (configurável).

## Tecnologias Utilizadas

- Frontend: React 19, Vite 7, Axios, Chart.js + react-chartjs-2, ESLint 9.
- Backend: Laravel 12, Sanctum, Vite (laravel-vite-plugin), Tailwind CSS 4, PHPUnit.
- Banco: SQLite por padrão (MySQL/MariaDB/PostgreSQL suportados via `.env`).
- Orquestração: `concurrently` via script Composer para desenvolvimento integrado no backend.

## Backend (Laravel)

1) Instalação e configuração

```powershell
cd backend
composer install
php -r "file_exists('.env') || copy('.env.example', '.env');"
# Para SQLite (padrão)
php -r "file_exists('database/database.sqlite') || touch('database/database.sqlite');"
php artisan key:generate
```

2) Ajuste o `.env` (SQLite)

```
DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite
```

3) Migrações e seeders

```powershell
php artisan migrate --force
php artisan db:seed
```

4) Servidor de desenvolvimento

```powershell
php artisan serve
# Endpoint padrão: http://127.0.0.1:8000/
```

## Frontend (Vite + React)

1) Instalação

```powershell
cd frontend
npm install
```

2) Desenvolvimento

```powershell
npm run dev
# Aplicação: http://localhost:5173/
```

- O frontend usa `baseURL` em `frontend/src/api.js` apontando para `http://127.0.0.1:8000/api`.

3) Lint e build

```powershell
npm run lint
npm run build
npm run preview
```

## Login e Perfis

- Admin padrão (semente):
  - Usuário/E-mail: `adm`
  - Senha: `adm`
- Fluxo de login no frontend salva `token` e `user` no `localStorage` (inclui `tipo`).
- `tipo` controla as permissões na UI; `cliente` vê tudo em cinza/desabilitado e não consegue abrir seletores.

## API (resumo)

- Autenticação
  - `POST /login` — retorna `token` e `user` (inclui `tipo`).
  - `GET /me` — dados do usuário logado.
  - `POST /logout` — invalidar sessão.
- Tickets
  - `GET /tickets` — lista.
  - `POST /tickets` — cria (bloqueado para `cliente`).
  - `PUT /tickets/{id}` — atualiza (bloqueado para `cliente`).
- Comentários (atualizações)
  - `GET /tickets/{id}/updates` — lista.
  - `POST /tickets/{id}/updates` — cria (bloqueado para `cliente`).
  - `PUT /tickets/{id}/updates/{update}` — edita (restrições de autoria e bloqueio para `cliente`).
  - `DELETE /tickets/{id}/updates/{update}` — remove (restrições de autoria e bloqueio para `cliente`).
- Usuários (admin)
  - `GET /users`, `POST /users`, `PUT /users/{id}`, `DELETE /users/{id}` — requer `can:manage-users` (is_admin).
  - `GET /user-list` — lista básica para seleção em tickets.

- Base de conhecimento
  - Categorias: `GET /kb/categories`, `POST /kb/categories` (admin), `PUT /kb/categories/{id}` (admin), `DELETE /kb/categories/{id}` (admin).
  - Artigos: `GET /kb/articles`, `GET /kb/articles/{id}`, `POST /kb/articles` (admin), `PUT /kb/articles/{id}` (admin), `DELETE /kb/articles/{id}` (admin).
  - Vínculo artigo-ticket: `POST /kb/articles/{article}/tickets/{ticket}`, `DELETE /kb/articles/{article}/tickets/{ticket}` (admin).

- Tags
  - `GET /tags`, `POST /tags`, `PUT /tags/{id}` (admin), `DELETE /tags/{id}` (admin).

- Anexos de tickets
  - `GET /tickets/{id}/attachments`, `POST /tickets/{id}/attachments`, `DELETE /tickets/{id}/attachments/{attachment}`.

## Execução Rápida (Windows)

- Inicie o backend em um terminal:

```powershell
cd backend
php artisan serve
```

- Inicie o frontend em outro terminal:

```powershell
cd frontend
npm run dev
```

- Acesse:
  - Backend: `http://127.0.0.1:8000/`
  - Frontend: `http://localhost:5173/`

## Observações

- Se usar Node < 20.19, o Vite pode exibir aviso; atualize o Node para evitar problemas.
- Se preferir rodar tudo junto a partir do backend, há um script Composer que usa `npx concurrently`:

```powershell
cd backend
composer run dev
```

> Dica: garanta que o Node/NPM estão instalados e acessíveis no PATH para o script acima funcionar.
