<?php

namespace Tests\Feature;

use App\Models\Filial;
use App\Models\Substation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RoleAccessTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::create([
            'name' => 'Admin',
            'email' => 'admin@test.uz',
            'password' => bcrypt('secret123'),
            'role' => 'admin',
        ]);
    }

    private function filialUser(Filial $filial): User
    {
        return User::create([
            'name' => 'Filial User',
            'email' => 'filial@test.uz',
            'password' => bcrypt('secret123'),
            'role' => 'filial',
            'filial_id' => $filial->id,
        ]);
    }

    private function substation(string $metFiliali): Substation
    {
        return Substation::create([
            'met_filiali_nomi' => $metFiliali,
            'podstansiya_nomi' => 'PS-'.$metFiliali,
            'kuchlanishi' => 110,
            'hisoblagich_rusumi' => 'Mercury',
            'voltage_category' => '35-110kV',
        ]);
    }

    public function test_filial_user_sees_only_own_filial_substations(): void
    {
        $a = Filial::create(['nomi' => 'Filial A']);
        Filial::create(['nomi' => 'Filial B']);
        $this->substation('Filial A');
        $this->substation('Filial B');

        Sanctum::actingAs($this->filialUser($a));

        $res = $this->getJson('/api/substations');
        $res->assertOk();
        $this->assertCount(1, $res->json());
        $this->assertSame('Filial A', $res->json()[0]['met_filiali_nomi']);
    }

    public function test_admin_sees_all_substations(): void
    {
        $this->substation('Filial A');
        $this->substation('Filial B');

        Sanctum::actingAs($this->admin());

        $this->getJson('/api/substations')->assertOk()->assertJsonCount(2);
    }

    public function test_filial_user_store_is_forced_to_own_filial(): void
    {
        $a = Filial::create(['nomi' => 'Filial A']);
        Sanctum::actingAs($this->filialUser($a));

        $res = $this->postJson('/api/substations', [
            'met_filiali_nomi' => 'Filial B', // boshqa filial — e'tiborga olinmasligi kerak
            'podstansiya_nomi' => 'PS-1',
            'kuchlanishi' => 110,
            'hisoblagich_rusumi' => 'Mercury',
            'voltage_category' => '35-110kV',
        ]);

        $res->assertCreated();
        $this->assertSame('Filial A', $res->json('met_filiali_nomi'));
    }

    public function test_filial_user_cannot_touch_other_filial_substation(): void
    {
        $a = Filial::create(['nomi' => 'Filial A']);
        $other = $this->substation('Filial B');
        Sanctum::actingAs($this->filialUser($a));

        $this->putJson("/api/substations/{$other->id}", ['podstansiya_nomi' => 'X'])->assertForbidden();
        $this->deleteJson("/api/substations/{$other->id}")->assertForbidden();
    }

    public function test_filial_user_is_blocked_from_admin_routes(): void
    {
        $a = Filial::create(['nomi' => 'Filial A']);
        Sanctum::actingAs($this->filialUser($a));

        $this->getJson('/api/users')->assertForbidden();
        $this->getJson('/api/filiallar')->assertForbidden();
    }

    public function test_admin_can_create_filial_user(): void
    {
        $a = Filial::create(['nomi' => 'Filial A']);
        Sanctum::actingAs($this->admin());

        $res = $this->postJson('/api/users', [
            'name' => 'New',
            'email' => 'new@test.uz',
            'password' => 'secret123',
            'role' => 'filial',
            'filial_id' => $a->id,
        ]);

        $res->assertCreated();
        $this->assertDatabaseHas('users', ['email' => 'new@test.uz', 'role' => 'filial', 'filial_id' => $a->id]);
    }
}
