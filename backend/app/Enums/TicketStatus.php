<?php

namespace App\Enums;

enum TicketStatus: string
{
    case backlog = 'backlog';
    case a_fazer = 'a_fazer';
    case fazendo = 'fazendo';
    case pronto = 'pronto';
    case para_teste = 'para_teste';
    case em_teste = 'em_teste';
    case finalizado = 'finalizado';
}

