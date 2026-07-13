<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('substations', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->string('met_filiali_nomi');
            $table->string('podstansiya_nomi');
            $table->string('tarmoq_nomi')->nullable();
            $table->integer('kuchlanishi');
            $table->string('hisoblagich_rusumi');
            $table->string('elektr_hisoblagich_zavod_raqami')->nullable();
            $table->string('nominal_tok')->nullable();
            $table->string('nominal_kuchlanish')->nullable();
            $table->string('sim_karta_raqami')->nullable();
            $table->string('tt')->nullable();
            $table->string('kt')->nullable();
            $table->string('xisob_koef')->nullable();
            $table->string('muhr_raqami')->nullable();
            $table->string('oqim_yonalishi')->nullable();
            $table->string('hisoblagich_matish_naryad')->nullable();
            $table->string('voltage_category');
            $table->timestamps();

            $table->index('voltage_category');
            $table->index('hisoblagich_rusumi');
            $table->index('kuchlanishi');
            $table->index('nominal_kuchlanish');
            $table->index('nominal_tok');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('substations');
    }
};