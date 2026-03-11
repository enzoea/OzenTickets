<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OutboxEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'payload',
        'occurred_at',
        'published_at',
        'retries',
    ];

    protected $casts = [
        'payload' => 'array',
        'occurred_at' => 'datetime',
        'published_at' => 'datetime',
        'retries' => 'integer',
    ];
}
