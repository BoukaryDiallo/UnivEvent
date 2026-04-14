@extends('layouts.app')

@section('content')
<div class="container mt-5">
    <h2 class="text-center text-success mb-4">Détails de la Candidature</h2>

    <div class="card shadow p-4">
        <h4 class="card-title text-primary">Candidat : {{ $candidature->user->name }}</h4>
        <p class="card-text"><strong>Élection :</strong> {{ $candidature->election->titre }}</p>

        <ul class="list-group list-group-flush mt-3">
            <li class="list-group-item"><strong>Programme :</strong> {{ $candidature->programme ?? 'Non fourni' }}</li>
            <li class="list-group-item"><strong>Statut :</strong> 
                @if($candidature->statut == 'validee')
                    <span class="badge bg-success">Validée</span>
                @elseif($candidature->statut == 'rejetee')
                    <span class="badge bg-danger">Rejetée</span>
                @else
                    <span class="badge bg-warning">En attente</span>
                @endif
            </li>
            <li class="list-group-item"><strong>CNIB :</strong> <a href="{{ asset('storage/'.$candidature->cnib_pdf) }}" target="_blank">Voir PDF</a></li>
            <li class="list-group-item"><strong>Casier judiciaire :</strong> <a href="{{ asset('storage/'.$candidature->casier_judiciaire_pdf) }}" target="_blank">Voir PDF</a></li>
            <li class="list-group-item"><strong>Attestation d'inscription :</strong> <a href="{{ asset('storage/'.$candidature->attestation_inscription_pdf) }}" target="_blank">Voir PDF</a></li>
        </ul>

        <div class="mt-4 d-flex justify-content-end">
            <a href="{{ route('candidatures.edit', $candidature->id_candidature) }}" class="btn btn-warning me-2">Modifier</a>
            <form action="{{ route('candidatures.destroy', $candidature->id_candidature) }}" method="POST" style="display:inline;">
                @csrf @method('DELETE')
                <button class="btn btn-danger" onclick="return confirm('Supprimer cette candidature ?')">Supprimer</button>
            </form>
            <a href="{{ route('candidatures.index') }}" class="btn btn-secondary ms-2">Retour à la liste</a>
        </div>
    </div>
</div>
@endsection
