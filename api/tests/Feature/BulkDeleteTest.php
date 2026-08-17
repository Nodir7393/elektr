<?php

namespace Tests\Feature;

use App\Models\Filial;
use App\Models\Substation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BulkDeleteTest extends TestCase
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

    private function substation(string $metFiliali, string $category = '35-110kV'): Substation
    {
        return Substation::create([
            'met_filiali_nomi' => $metFiliali,
            'podstansiya_nomi' => 'PS-'.$metFiliali,
            'kuchlanishi' => 110,
            'hisoblagich_rusumi' => 'Mercury',
            'voltage_category' => $category,
        ]);
    }

    public function test_admin_can_delete_selected_substations(): void
    {
        $one = $this->substation('Filial A');
        $two = $this->substation('Filial B');
        $keep = $this->substation('Filial C');

        Sanctum::actingAs($this->admin());

        $this->postJson('/api/substations/bulk-delete', ['ids' => [$one->id, $two->id]])
            ->assertOk()
            ->assertJson(['deleted' => 2]);

        $this->assertDatabaseCount('substations', 1);
        $this->assertDatabaseHas('substations', ['id' => $keep->id]);
    }

    public function test_admin_can_delete_all_in_a_voltage_category(): void
    {
        $this->substation('Filial A', '35-110kV');
        $this->substation('Filial B', '35-110kV');
        $keep = $this->substation('Filial C', '220-500kV');

        Sanctum::actingAs($this->admin());

        $this->postJson('/api/substations/bulk-delete', [
            'all' => true,
            'voltage_category' => '35-110kV',
        ])->assertOk()->assertJson(['deleted' => 2]);

        $this->assertDatabaseCount('substations', 1);
        $this->assertDatabaseHas('substations', ['id' => $keep->id]);
    }

    public function test_filial_user_bulk_delete_is_scoped_to_own_filial(): void
    {
        $a = Filial::create(['nomi' => 'Filial A']);
        $mine = $this->substation('Filial A');
        $other = $this->substation('Filial B');

        Sanctum::actingAs($this->filialUser($a));

        $this->postJson('/api/substations/bulk-delete', ['ids' => [$mine->id, $other->id]])
            ->assertOk()
            ->assertJson(['deleted' => 1]);

        $this->assertDatabaseMissing('substations', ['id' => $mine->id]);
        $this->assertDatabaseHas('substations', ['id' => $other->id]);
    }

    public function test_filial_user_delete_all_only_removes_own_filial(): void
    {
        $a = Filial::create(['nomi' => 'Filial A']);
        $this->substation('Filial A');
        $other = $this->substation('Filial B');

        Sanctum::actingAs($this->filialUser($a));

        $this->postJson('/api/substations/bulk-delete', ['all' => true])
            ->assertOk()
            ->assertJson(['deleted' => 1]);

        $this->assertDatabaseCount('substations', 1);
        $this->assertDatabaseHas('substations', ['id' => $other->id]);
    }

    public function test_all_false_without_ids_deletes_nothing(): void
    {
        $this->substation('Filial A');
        Sanctum::actingAs($this->admin());

        $this->postJson('/api/substations/bulk-delete', ['all' => false])->assertStatus(422);

        $this->assertDatabaseCount('substations', 1);
    }

    public function test_empty_payload_is_rejected(): void
    {
        $this->substation('Filial A');
        Sanctum::actingAs($this->admin());

        $this->postJson('/api/substations/bulk-delete', [])->assertStatus(422);

        $this->assertDatabaseCount('substations', 1);
    }

    public function test_guest_cannot_bulk_delete(): void
    {
        $this->substation('Filial A');

        $this->postJson('/api/substations/bulk-delete', ['all' => true])->assertUnauthorized();

        $this->assertDatabaseCount('substations', 1);
    }
}
