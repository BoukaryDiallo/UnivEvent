<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Certificat extends Model
{
    use HasFactory;

    protected $fillable = [
        'evenement_id',
        'utilisateur_id',
        'type',
        'code_certificat',
        'fichier',
        'url_verification',
        'statut',
        'template_snapshot',
        'overrides',
        'payload',
        'date_delivrance',
        'preview_generated_at',
        'published_at',
        'revoked_at',
    ];

    protected $casts = [
        'template_snapshot' => 'array',
        'overrides' => 'array',
        'payload' => 'array',
        'date_delivrance' => 'datetime',
        'preview_generated_at' => 'datetime',
        'published_at' => 'datetime',
        'revoked_at' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | RELATIONS
    |--------------------------------------------------------------------------
    */

    public function evenement()
    {
        return $this->belongsTo(Evenement::class);
    }

    public function utilisateur()
    {
        return $this->belongsTo(User::class, 'utilisateur_id');
    }

    /*
    |--------------------------------------------------------------------------
    | HELPERS
    |--------------------------------------------------------------------------
    */

    public function estValide(): bool
    {
        return $this->statut === 'delivre';
    }
}
