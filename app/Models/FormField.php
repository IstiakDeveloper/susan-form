<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FormField extends Model
{
    use HasFactory;

    protected $fillable = [
        'form_id',
        'label',
        'name',
        'type',
        'signature',
        'options',
        'is_required',
        'order',
        'validation_rules',
        'placeholder',
        'help_text'
    ];

    protected $casts = [
        'options' => 'array',
        'is_required' => 'boolean',
        'validation_rules' => 'array'
    ];

    public function form(): BelongsTo
    {
        return $this->belongsTo(Form::class);
    }
}
