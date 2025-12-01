<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->unsignedBigInteger('codigo')->nullable()->after('id');
        });

        // Preenche "codigo" com o valor do "id" existente
        $rows = DB::table('tickets')->select('id')->get();
        foreach ($rows as $row) {
            DB::table('tickets')->where('id', $row->id)->update(['codigo' => $row->id]);
        }

        Schema::table('tickets', function (Blueprint $table) {
            $table->unique('codigo');
        });
    }

    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropUnique(['codigo']);
            $table->dropColumn('codigo');
        });
    }
};

