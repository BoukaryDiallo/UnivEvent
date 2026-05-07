<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Evenement extends Model
{
    use HasFactory;

    protected $fillable = [
        'titre',
        'description',
        'reglement',
        'type',
        'theme',
        'date_debut',
        'date_fin',
        'date_soumission',
        'date_deliberation',
        'lieu',
        'lien_live',
        'video_url',
        'visibilite',
        'public_cible',
        'statut',
        'validation_status',
        'submitted_at',
        'approved_at',
        'approved_by',
        'rejected_at',
        'rejected_by',
        'rejection_reason',
        'cree_par',
        'inscription_requise',
        'allow_organizer',
        'allow_intervenant',
        'allow_jury',
        'allow_participant',
        'capacite_max',
        'checkin_active',
        'comments_enabled',
        'comment_replies_enabled',
        'comment_reactions_enabled',
        'comment_policy',
        'messages_enabled',
        'evenement_certifie',
        'certificate_template_schema',
        'certificate_template_version',
        'competition_status',
        'allow_participant_result_tracking',
        'results_published_at',
    ];

    protected $casts = [
        'date_debut' => 'datetime',
        'date_fin' => 'datetime',
        'date_soumission' => 'datetime',
        'date_deliberation' => 'datetime',
        'submitted_at' => 'datetime',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'inscription_requise' => 'boolean',
        'allow_organizer' => 'boolean',
        'allow_intervenant' => 'boolean',
        'allow_jury' => 'boolean',
        'allow_participant' => 'boolean',
        'checkin_active' => 'boolean',
        'comments_enabled' => 'boolean',
        'comment_replies_enabled' => 'boolean',
        'comment_reactions_enabled' => 'boolean',
        'messages_enabled' => 'boolean',
        'evenement_certifie' => 'boolean',
        'certificate_template_schema' => 'array',
        'allow_participant_result_tracking' => 'boolean',
        'results_published_at' => 'datetime',
    ];

    // Créateur (User)
    public function createur()
    {
        return $this->belongsTo(User::class, 'cree_par');
    }

    // Inscriptions
    public function reactions()
    {
        return $this->hasMany(EvenementReaction::class);
    }

    public function inscriptions()
    {
        return $this->hasMany(InscriptionEvenement::class);
    }

    // Programmes (conférence)
    public function programmes()
    {
        return $this->hasMany(Programme::class)->orderBy('date_programme')->orderBy('heure_debut')->orderBy('ordre');
    }

    // Résultats (concours)
    public function resultats()
    {
        return $this->hasMany(ResultatEvaluation::class)->orderBy('classement')->orderByDesc('note');
    }

    // Certificats
    public function certificats()
    {
        return $this->hasMany(Certificat::class);
    }

    // Médias (image, pdf)
    public function medias()
    {
        return $this->hasMany(EvenementMedia::class);
    }

    public function roles()
    {
        return $this->hasMany(EvenementRole::class)
            ->where('category', 'audience')
            ->orderBy('role');
    }

    public function assignments()
    {
        return $this->hasMany(EvenementRole::class)
            ->where('category', 'assignment')
            ->with('user:id,name,email,role,est_actif')
            ->orderBy('role');
    }

    public function moderationRestrictions()
    {
        return $this->hasMany(EvenementModerationRestriction::class);
    }

    public function juryPanel()
    {
        return $this->hasOne(JuryPanel::class);
    }

    // Alias pour compatibilité avec jury
    public function jury()
    {
        return $this->juryPanel();
    }

    public function activities()
    {
        return $this->hasMany(EvenementActivity::class)->latest();
    }

    public function comments()
    {
        return $this->hasMany(EvenementComment::class)
            ->whereNull('parent_id')
            ->where('status', 'visible')
            ->latest();
    }

    public function messages()
    {
        return $this->hasMany(EventMessage::class)
            ->whereNull('parent_id')
            ->latest();
    }

    public function allMessages()
    {
        return $this->hasMany(EventMessage::class)->latest();
    }

    public function getAssignmentForUser(?int $userId): ?EvenementRole
    {
        if (! $userId) {
            return null;
        }

        return $this->assignments->firstWhere('user_id', $userId);
    }

    public function preferredCoverMedia(): ?EvenementMedia
    {
        $medias = $this->relationLoaded('medias') ? $this->medias : $this->medias()->get();

        return $medias
            ->first(fn (EvenementMedia $media) => $media->type === 'image' && (bool) data_get($media->meta, 'is_cover'))
            ?? $medias->firstWhere('type', 'image');
    }
}
