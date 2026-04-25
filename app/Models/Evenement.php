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
        'type',
        'date_debut',
        'date_fin',
        'lieu',
        'lien_live',
        'visibilite',
        'public_cible',
        'statut',
        'cree_par',
        'inscription_requise',
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
        'inscription_requise' => 'boolean',
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
        return $this->hasMany(Resultat::class)->orderBy('classement')->orderByDesc('note');
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
}
