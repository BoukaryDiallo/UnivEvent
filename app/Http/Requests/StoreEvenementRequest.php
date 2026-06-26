<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEvenementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titre' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['required', 'in:conference,concours'],
            'date_debut' => ['required', 'date'],
            'date_fin' => ['nullable', 'date', 'after_or_equal:date_debut'],
            'lieu' => ['nullable', 'string', 'max:255'],
            'lien_live' => ['nullable', 'url', 'max:500'],
            'visibilite' => ['nullable', 'in:public,prive,restreint'],
            'public_cible' => ['nullable', 'string', 'max:255'],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['string', 'max:255'],
            'assigned_users' => ['nullable', 'array'],
            'assigned_users.organisateur' => ['nullable', 'array'],
            'assigned_users.organisateur.*.user_id' => ['required', 'integer', 'exists:users,id'],
            'assigned_users.participant' => ['nullable', 'array'],
            'assigned_users.intervenant' => ['nullable', 'array'],
            'assigned_users.jury' => ['nullable', 'array'],
            'assigned_users.jury.*.user_id' => ['required', 'integer', 'exists:users,id'],
            'comment_policy' => ['nullable', 'in:all_registered,accepted_participants,organizers_jury_only,readonly'],
            'competition_status' => ['nullable', 'in:configuration,notation_ouverte,notation_terminee,deliberation,validation_president,resultats_publies'],
            'jury_config' => ['nullable', 'array'],
            'jury_config.admission_average' => ['nullable', 'numeric', 'min:0'],
            'jury_config.seats_count' => ['nullable', 'integer', 'min:1'],
            'jury_config.ranking_mode' => ['nullable', 'string', 'max:100'],
            'jury_config.tie_break_rule' => ['nullable', 'string', 'max:100'],
            'programmes' => ['nullable', 'array'],
            'programmes.*.titre' => ['nullable', 'string', 'max:255'],
            'programmes.*.document' => ['nullable', 'file', 'mimes:pdf', 'max:10240'],
            'programmes.*.chemin_pdf' => ['nullable', 'string'],
            'statut' => ['nullable', 'in:brouillon,publie,en_cours,cloture,archive'],
            'capacite_max' => ['nullable', 'integer', 'min:1'],
            'media' => ['nullable', 'file', 'max:10240', 'mimes:jpg,jpeg,png,webp,pdf'],
            'notify_participants' => ['nullable', 'boolean'],
        ];
    }
}
