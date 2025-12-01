<?php

namespace Tests\Feature;

use App\Models\KbArticle;
use App\Models\KbCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class KbArticleSlugTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $admin = User::factory()->create(['is_admin' => true]);
        Sanctum::actingAs($admin);
    }

    public function test_slug_is_generated_and_unique_on_store(): void
    {
        $cat = KbCategory::create(['nome' => 'Geral']);

        $res1 = $this->postJson('/api/kb/articles', [
            'titulo' => 'Guia de Setup',
            'conteudo' => '<p>Conteudo</p>',
            'kb_category_id' => $cat->id,
            'status' => 'rascunho',
            'visibilidade' => 'interno',
        ]);
        $res1->assertStatus(201);
        $a1 = $res1->json();
        $this->assertNotEmpty($a1['slug']);

        $res2 = $this->postJson('/api/kb/articles', [
            'titulo' => 'Guia de Setup',
            'conteudo' => '<p>Outro</p>',
            'kb_category_id' => $cat->id,
            'status' => 'rascunho',
            'visibilidade' => 'interno',
        ]);
        $res2->assertStatus(201);
        $a2 = $res2->json();
        $this->assertNotEquals($a1['slug'], $a2['slug']);
    }

    public function test_slug_update_avoids_collision(): void
    {
        $cat = KbCategory::create(['nome' => 'Geral']);

        $a1 = KbArticle::create([
            'titulo' => 'Primeiro',
            'slug' => 'guia',
            'conteudo' => '...',
            'user_id' => User::first()->id,
            'kb_category_id' => $cat->id,
            'status' => 'rascunho',
            'visibilidade' => 'interno',
        ]);
        $a2 = KbArticle::create([
            'titulo' => 'Segundo',
            'slug' => 'guia-1',
            'conteudo' => '...',
            'user_id' => User::first()->id,
            'kb_category_id' => $cat->id,
            'status' => 'rascunho',
            'visibilidade' => 'interno',
        ]);

        $res = $this->putJson('/api/kb/articles/'.$a2->id, [
            'slug' => 'guia',
        ]);
        $res->assertOk();
        $updated = $res->json();
        $this->assertNotEquals('guia', $updated['slug']);
        $this->assertStringStartsWith('guia-', $updated['slug']);
    }
}
