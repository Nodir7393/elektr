<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Filial extends Model
{
    use HasFactory;

    protected $table = 'filiallar';

    protected $fillable = [
        'nomi',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Shu filialga tegishli podstansiyalar (met_filiali_nomi nomi bo'yicha bog'lanadi).
     */
    public function substations(): HasMany
    {
        return $this->hasMany(Substation::class, 'met_filiali_nomi', 'nomi');
    }
}
