<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Substation extends Model
{
    use HasUuids;

    protected $fillable = [
        'met_filiali_nomi',
        'podstansiya_nomi',
        'tarmoq_nomi',
        'kuchlanishi',
        'hisoblagich_rusumi',
        'elektr_hisoblagich_zavod_raqami',
        'nominal_tok',
        'nominal_kuchlanish',
        'sim_karta_raqami',
        'tt',
        'kt',
        'xisob_koef',
        'muhr_raqami',
        'oqim_yonalishi',
        'hisoblagich_matish_naryad',
        'voltage_category',
    ];

    protected $casts = [
        'kuchlanishi' => 'integer',
    ];
}