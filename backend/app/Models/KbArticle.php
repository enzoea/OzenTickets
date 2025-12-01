<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class KbArticle extends Model
{
    use HasFactory;

    protected $fillable = [
        'titulo',
        'slug',
        'conteudo',
        'user_id',
        'kb_category_id',
        'status',
        'visibilidade',
    ];

    public function author()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function category()
    {
        return $this->belongsTo(KbCategory::class, 'kb_category_id');
    }

    public function tickets()
    {
        return $this->belongsToMany(Ticket::class, 'kb_article_ticket');
    }
}

