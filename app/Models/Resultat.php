<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Resultat extends Model
{
    use HasFactory;

    protected $fillable = [
        'evenement_id',
        'utilisateur_id',
        'note',
        'classement',
        'admission',
        'mention',
        'admission_average_snapshot',
        'criteria_breakdown',
        'published_at',
        'validated_at',
        'validated_by',
    ];

    protected $casts = [
        'note' => 'decimal:2',
        'admission_average_snapshot' => 'decimal:2',
        'criteria_breakdown' => 'array',
        'published_at' => 'datetime',
        'validated_at' => 'datetime',
    ];

    public function evenement()
    {
        return $this->belongsTo(Evenement::class);
    }

    public function utilisateur()
    {
        return $this->belongsTo(User::class, 'utilisateur_id');
    }

    public function validator()
    {
        return $this->belongsTo(User::class, 'validated_by');
    }
}
