<?php

namespace App\Http\Controllers;

use App\Models\KbArticle;
use App\Models\Ticket;
use App\Http\Resources\KbArticleResource;
use Illuminate\Http\Request;

class KbArticleController extends Controller
{
    protected function visibilityFilter(Request $request)
    {
        $user = $request->user();
        if (!$user) return ['publico'];
        $tipo = $user->tipo;
        if ($tipo === 'cliente') return ['cliente', 'publico'];
        return ['interno', 'cliente', 'publico'];
    }

    public function index(Request $request)
    {
        $q = $request->string('q')->toString();
        $categoryId = $request->input('kb_category_id');
        $ticketId = $request->input('ticket_id');
        $status = $request->input('status');
        $visibility = $request->input('visibilidade');
        $visFilter = $this->visibilityFilter($request);
        $query = KbArticle::query();
        if ($q) {
            $query->where(function ($x) use ($q) {
                $x->where('titulo', 'like', '%'.$q.'%')
                  ->orWhere('conteudo', 'like', '%'.$q.'%')
                  ->orWhere('slug', 'like', '%'.$q.'%')
                  ->orWhereHas('category', function ($c) use ($q) {
                      $c->where('nome', 'like', '%'.$q.'%');
                  });
            });
        }
        if ($categoryId) $query->where('kb_category_id', (int) $categoryId);
        if ($ticketId) {
            $query->whereHas('tickets', function ($q2) use ($ticketId) {
                $q2->where('tickets.id', (int) $ticketId);
            });
        }
        if ($status) $query->where('status', $status);
        if ($visibility) $query->where('visibilidade', $visibility);
        $query->whereIn('visibilidade', $visFilter);
        if (in_array('cliente', $visFilter) && !in_array('interno', $visFilter)) {
            $query->where('status', 'publicado');
        }
        $articles = $query->with(['author', 'category'])->orderByDesc('updated_at')->paginate(20);
        return KbArticleResource::collection($articles);
    }

    public function show(Request $request, KbArticle $article)
    {
        $visFilter = $this->visibilityFilter($request);
        if (!in_array($article->visibilidade, $visFilter)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        if (in_array('cliente', $visFilter) && $article->status !== 'publicado') {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        $article->load(['author', 'category', 'tickets']);
        return new KbArticleResource($article);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'titulo' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'conteudo' => ['required', 'string'],
            'kb_category_id' => ['required', 'integer', 'exists:kb_categories,id'],
            'status' => ['required', 'in:rascunho,publicado,arquivado'],
            'visibilidade' => ['required', 'in:interno,cliente,publico'],
        ]);
        $data['user_id'] = $request->user()->id;
        $article = KbArticle::create($data);
        $article->load(['author', 'category']);
        return new KbArticleResource($article);
    }

    public function update(Request $request, KbArticle $article)
    {
        $data = $request->validate([
            'titulo' => ['sometimes', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'conteudo' => ['sometimes', 'string'],
            'kb_category_id' => ['sometimes', 'integer', 'exists:kb_categories,id'],
            'status' => ['sometimes', 'in:rascunho,publicado,arquivado'],
            'visibilidade' => ['sometimes', 'in:interno,cliente,publico'],
        ]);
        $article->update($data);
        $article->load(['author', 'category']);
        return new KbArticleResource($article);
    }

    public function destroy(KbArticle $article)
    {
        $article->delete();
        return response()->noContent();
    }

    public function attachTicket(Request $request, KbArticle $article, Ticket $ticket)
    {
        $tipo = $request->input('tipo_relacao');
        $article->tickets()->syncWithoutDetaching([$ticket->id => ['tipo_relacao' => $tipo]]);
        return response()->noContent();
    }

    public function detachTicket(KbArticle $article, Ticket $ticket)
    {
        $article->tickets()->detach($ticket->id);
        return response()->noContent();
    }
}
