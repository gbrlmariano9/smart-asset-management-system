<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Asset extends Model
{
    protected $fillable = [
        'asset_code',
        'name',
        'category',
        'brand',
        'serial_number',
        'status',
        'purchase_date',
        'purchase_cost',
        'description',
    ];
}
