<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('filial')->after('password');
            $table->foreignId('filial_id')->nullable()->after('role')
                ->constrained('filiallar')->nullOnDelete();
        });

        // Migratsiyadan oldin mavjud barcha foydalanuvchilar admin (faqat seeded admin bor edi).
        DB::table('users')->update(['role' => 'admin']);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('filial_id');
            $table->dropColumn('role');
        });
    }
};
