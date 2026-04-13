@extends('layouts.app')

@section('content')
<div class="container mt-5">
    <h2 class="text-center text-success mb-4">Détails de l'Élection</h2>

    <div class="card shadow p-4">
        <h4 class="card-title text-primary">{{ $election->titre }}</h4>
        <p class="card-text">{{ $election->description ?? 'Aucune description disponible.' }}</p>

        <ul class="list-group list-group-flush mt-3">
            <li class="list-group-item"><strong>Date de début :</strong> {{ $election->date_debut }}</li>
            <li class="list-group-item"><strong>Date de fin :</strong> {{ $election->date_fin }}</li>
            <li class="list-group-item"><strong>Statut :</strong> 
                @if($election->statut == 'ouverte')
                    <span class="badge bg-success">Ouverte</span>
                @else
                    <span class="badge bg-danger">Fermée</span>
                @endif
            </li>
            <li class="list-group-item"><strong>Circonscription :</strong> {{ $election->circonscription->nom }}</li>
        </ul>

        <div class="mt-4 d-flex justify-content-end">
            <a href="{{ route('elections.edit', $election->id_election) }}" class="btn btn-warning me-2">Modifier</a>
            <form action="{{ route('elections.destroy', $election->id_election) }}" method="POST" style="display:inline;">
                @csrf @method('DELETE')
                <button class="btn btn-danger" onclick="return confirm('Annuler cette élection ?')">Annuler</button>
            </form>
            <a href="{{ route('elections.index') }}" class="btn btn-secondary ms-2">Retour à la liste</a>
        </div>
    </div>
</div>
@endsection
