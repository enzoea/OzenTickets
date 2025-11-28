<?php

namespace App\Enums;

enum TicketPriority: string
{
    case urgente = 'urgente';
    case prioridade = 'prioridade';
    case padrao = 'padrao';
    case sem_prioridade = 'sem_prioridade';
}

