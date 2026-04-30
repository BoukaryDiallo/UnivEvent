@component('mail::message')
# Bonjour {{ $enseignant->name }},

Veuillez trouver ci-joint votre emploi du temps **{{ $edt->titre }}**.

**Période :** {{ $edt->date_debut?->format('d/m/Y') }} au {{ $edt->date_fin?->format('d/m/Y') }} -
**Filière:** {{ $edt->filiere->nom }} -
**Niveau:** {{ $edt->niveau->nom }} -
**Semestre :** {{ $edt->semestre }}

@component('mail::button', ['url' => url("/emploie-du-temps/{$edt->id}/pdf")])
Télécharger maintenant
@endcomponent

Cordialement,
{{ config('app.name') }}
@endcomponent