<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('filiallar', function (Blueprint $table) {
            $table->id();
            $table->string('nomi')->unique();
            $table->timestamps();
        });

        // Mavjud podstansiyalardagi noyob MET filiali nomlaridan filiallarni to'ldirish
        if (Schema::hasTable('substations')) {
            $now = now();
            $nomlar = DB::table('substations')
                ->whereNotNull('met_filiali_nomi')
                ->where('met_filiali_nomi', '!=', '')
                ->distinct()
                ->pluck('met_filiali_nomi');

            $rows = $nomlar->map(fn ($nomi) => [
                'nomi' => $nomi,
                'created_at' => $now,
                'updated_at' => $now,
            ])->all();

            if (! empty($rows)) {
                DB::table('filiallar')->insert($rows);
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('filiallar');
    }
};
