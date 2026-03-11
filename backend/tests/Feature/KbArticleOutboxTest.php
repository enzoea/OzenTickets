<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Project;
use App\Models\Ticket;
use App\Models\KbCategory;
use App\Models\KbArticle;
use App\Models\OutboxEvent;

class KbArticleOutboxTest extends TestCase
{
    use RefreshDatabase;

    public function test_attach_creates_outbox_event(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);
        $project = Project::create(['nome' => 'P', 'descricao' => null]);
        $user->projects()->syncWithoutDetaching([$project->id]);
        $ticket = Ticket::create(['project_id' => $project->id, 'titulo' => 'T', 'status' => 'a_fazer']);
        $cat = KbCategory::create(['nome' => 'C', 'descricao' => null]);
        $article = KbArticle::create([
            'titulo' => 'A',
            'slug' => 'a',
            'conteudo' => 'x',
            'user_id' => $user->id,
            'kb_category_id' => $cat->id,
            'status' => 'publicado',
            'visibilidade' => 'interno',
        ]);
        $this->postJson("/api/kb/articles/{$article->id}/tickets/{$ticket->id}", ['tipo_relacao' => 'referencia'])
            ->assertStatus(204);
        $evt = OutboxEvent::latest('id')->first();
        $this->assertNotNull($evt);
        $this->assertSame('kb.article_ticket_attached', $evt->type);
        $this->assertSame($article->id, $evt->payload['article_id']);
        $this->assertSame($ticket->id, $evt->payload['ticket_id']);
        $this->assertSame('referencia', $evt->payload['tipo_relacao']);
    }

    public function test_detach_creates_outbox_event(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);
        $project = Project::create(['nome' => 'P', 'descricao' => null]);
        $user->projects()->syncWithoutDetaching([$project->id]);
        $ticket = Ticket::create(['project_id' => $project->id, 'titulo' => 'T', 'status' => 'a_fazer']);
        $cat = KbCategory::create(['nome' => 'C', 'descricao' => null]);
        $article = KbArticle::create([
            'titulo' => 'A',
            'slug' => 'a',
            'conteudo' => 'x',
            'user_id' => $user->id,
            'kb_category_id' => $cat->id,
            'status' => 'publicado',
            'visibilidade' => 'interno',
        ]);
        $article->tickets()->syncWithoutDetaching([$ticket->id => ['tipo_relacao' => 'referencia']]);
        $this->deleteJson("/api/kb/articles/{$article->id}/tickets/{$ticket->id}")
            ->assertStatus(204);
        $evt = OutboxEvent::latest('id')->first();
        $this->assertNotNull($evt);
        $this->assertSame('kb.article_ticket_detached', $evt->type);
        $this->assertSame($article->id, $evt->payload['article_id']);
        $this->assertSame($ticket->id, $evt->payload['ticket_id']);
    }
}
