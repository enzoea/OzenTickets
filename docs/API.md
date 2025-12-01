# API — Painel de Demandas

Base URL de desenvolvimento: `http://127.0.0.1:8000`

## Autenticação

- Método: Bearer Token (Laravel Sanctum)
- Header: `Authorization: Bearer <token>`
- Login possui rate limiting: até 10 tentativas por minuto

## Convenções

- Formato JSON em todas as respostas
- Códigos de status:
  - 200 OK, 201 Created, 204 No Content
  - 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 422 Unprocessable Entity
- Paginação: não aplicável (as listagens atuais retornam coleções completas)

## Entidades

- Ticket
  - Campos: `id`, `codigo`, `project_id`, `titulo`, `subtitulo`, `descricao`, `status`, `prioridade`, `responsavel_id`, `assigned_to_user_id`, `solicitante_id`, `data_prevista`, `sla_hours`, `due_at`, `resolved_at`, `created_at`, `updated_at`
  - `status` enum: `backlog`, `a_fazer`, `fazendo`, `pronto`, `para_teste`, `em_teste`, `finalizado`
  - `prioridade` enum: `urgente`, `prioridade`, `padrao`, `sem_prioridade`
  - Relações: `responsavel`, `assigned_to`, `solicitante`, `tags`
- TicketUpdate (comentários/atualizações)
  - Campos: `id`, `ticket_id`, `user_id`, `conteudo`, `type`, `created_at`, `updated_at`
- Project
  - Campos: `id`, `nome`, `descricao`, `created_at`, `updated_at`
- User
  - Campos: `id`, `name`, `email`, `setor`, `cargo`, `is_admin`, `tipo`
  - `tipo`: `colaborador` ou `cliente`

## Autenticação

### POST /login
- Body: `{ "email": string, "password": string }`
- 200: `{ token, user: { id, name, email, setor, cargo, is_admin, tipo } }`
- 401: credenciais inválidas

### GET /me
- 200: dados do usuário autenticado

### POST /logout
- 200: `{ message: "Logout realizado com sucesso" }`

## Usuários (Admin)
Requer permissão `can:manage-users`.

### GET /users
- 200: lista de usuários

### POST /users
- Body:
  - `name` (required), `email` (required, unique), `password` (required, min 6)
  - `setor?`, `cargo?`, `is_admin?` (boolean), `tipo` in [`colaborador`, `cliente`]
- 201: usuário criado

### PUT /users/{id}
- Body:
  - `name`, `email` (unique exceto próprio), `password?`
  - `setor?`, `cargo?`, `is_admin?`, `tipo` in [`colaborador`, `cliente`]
- 200: usuário atualizado

### DELETE /users/{id}
- 204: removido
- 400: ao tentar remover-se a si próprio

### GET /user-list
- 200: lista básica: `{ id, name, email }`

## Projetos
Apenas projetos vinculados ao usuário são listados/visualizados.

### GET /projects
- 200: projetos vinculados ao usuário: `{ id, nome }[]`

### POST /projects
- Body: `{ nome: string, descricao?: string }`
- 201: projeto criado e vinculado ao usuário

### PUT /projects/{project}
- Body: `{ nome: string, descricao?: string }`
- 200: projeto atualizado

### DELETE /projects/{project}
- 200: `{ deleted: true }`
- Observação: remove todos os tickets e comentários do projeto (exclusão total)

### GET /projects/{project}/members
- 200: membros do projeto: `{ id, name, email }[]`

### POST /projects/{project}/members
- Body (uma das opções): `{ user_id: number }` ou `{ email: string }`
- 200: `{ linked: true }`

### DELETE /projects/{project}/members/{user}
- 200: `{ unlinked: true }`

## Tickets
Listagens e métricas respeitam acesso aos projetos do usuário.

### GET /tickets
- Query params:
  - `project_id?`: filtra por projeto específico (exige vínculo)
  - `assigned_to_user_id?` ou `responsavel_id?`: pode ser array (`assigned_to_user_id[]=1&...`)
  - `from?`, `to?`: intervalo de `data_prevista` (YYYY-MM-DD)
  - `due_from?`, `due_to?`: intervalo de `due_at` (YYYY-MM-DD)
  - `status?`: valor enum de status
  - `q?`: termo de busca (suporta `#123` para código/ID)
- 200: coleção de tickets (com `responsavel`, `solicitante` carregados)
- 403: ao solicitar `project_id` sem vínculo

### POST /tickets
- Body:
  - `project_id` (required, projeto vinculado ao usuário)
  - `titulo` (required), `subtitulo?`, `descricao?`
  - `status` enum, `prioridade?` enum
  - `responsavel_id?`, `assigned_to_user_id?`, `solicitante_id?` (IDs válidos de `users`)
  - `data_prevista?` (date), `sla_hours?` (int), `due_at?` (date)
  - `tag_ids?` (array de IDs de tags)
- 201: ticket criado
- 403: sem acesso ao projeto
- 422: payload inválido

### PUT /tickets/{ticket}
- Body: campos parciais (qualquer dos acima), `project_id?`
- 200: ticket atualizado
- 403: `cliente` não pode editar

## Comentários/Atualizações do Ticket

### GET /tickets/{ticket}/updates
- 200: lista de updates (mais recentes primeiro)

### POST /tickets/{ticket}/updates
- Body: `{ conteudo: string }`
- 201: update criado
- 403: `cliente` não pode criar

### PUT /tickets/{ticket}/updates/{update}
- Body: `{ conteudo: string }`
- 200: update atualizado (somente autor)
- 403: não autor ou `cliente`
- 404: update não pertence ao ticket

### DELETE /tickets/{ticket}/updates/{update}
- 204: removido (somente autor)
- 403: não autor ou `cliente`
- 404: update não pertence ao ticket

## Métricas

### GET /metrics/by-status
- Query params: mesmos de `/tickets` (`project_id?`, `responsavel_id?`, `from?`, `to?`, `status?`)
- 200: `[ { status, total } ]`

### GET /metrics/by-user
- Query params: mesmos de `/tickets`
- 200: `[ { user_id, name, total } ]`

## Exemplo de fluxo

1) Login
```
POST /login
{ "email": "adm", "password": "adm" }
```
Responde com `token` e `user`.

2) Listar projetos vinculados
```
GET /projects
Authorization: Bearer <token>
```

3) Criar ticket em um projeto
```
POST /tickets
Authorization: Bearer <token>
{
  "project_id": 1,
  "titulo": "Corrigir bug X",
  "descricao": "Ao salvar, ocorre erro Y",
  "status": "backlog",
  "prioridade": "padrao"
}
```

## Changelog da API

- 2025-12-01
  - SLA e prazos em tickets: campos `sla_hours`, `due_at`, `resolved_at`
  - Atribuição: `assigned_to_user_id` (espelha `responsavel_id`)
  - Tags: `/tags` e vínculo `ticket_tag` (via `tag_ids`)
  - Anexos: `/tickets/{id}/attachments` (lista, cria, remove)
  - Notificações simples: registros `ticket_updates` com `type="system"` em criação, alteração de status e comentários
  - Ajustes de filtros: `assigned_to_user_id` e `due_from`/`due_to`
- 2025-11-28
  - Comentários de tickets: CRUD em `/tickets/{id}/updates`
- 2025-11-21
  - Autenticação (`/login`, `/me`, `/logout`) e tickets básicos (`/tickets`)
## Setores (tags)

### GET /tags
- 200: lista de setores `{ id, name, slug }[]`

### POST /tags (Colaborador)
- Body: `{ name }` (único)
- 201: setor criado
- 403: clientes não podem criar

### PUT /tags/{tag} (Admin)
- Body: `{ name }` (único)
- 200: setor atualizado

### DELETE /tags/{tag} (Admin)
- 204: setor removido

## Anexos

### GET /tickets/{ticket}/attachments
- 200: lista de anexos

### POST /tickets/{ticket}/attachments
- Body: `{ path, mime?, original_name?, size? }`
- 201: anexo criado
- 403: `cliente` não pode criar

### DELETE /tickets/{ticket}/attachments/{attachment}
- 204: removido (somente autor)
- 403: não autor ou `cliente`
