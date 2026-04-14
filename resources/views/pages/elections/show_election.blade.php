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
                <span class="badge {{ $election->statut == 'ouverte' ? 'bg-success' : 'bg-secondary' }}">
                    {{ ucfirst($election->statut) }}
                </span>
            </li>
            <li class="list-group-item"><strong>Type :</strong> {{ ucfirst($election->type ?? 'Non défini') }}</li>
            @if($election->type == 'ufr' && $election->ufr)
                <li class="list-group-item"><strong>UFR :</strong> {{ $election->ufr->nom }}</li>
            @endif
            @if($election->type == 'promotion' && $election->filiere)
                <li class="list-group-item"><strong>Filière :</strong> {{ $election->filiere->nom }}</li>
            @endif
        </ul>

        <!-- Formulaire génération liste électorale -->
        <div class="mt-3">
            @if($election->listesElectorales()->doesntExist() && $election->statut == 'brouillon')
                <form method="POST" action="{{ route('elections.generer-liste', $election->id_election) }}" class="row g-3 align-items-end">
                    @csrf
                    @if($election->type === 'promotion')
                        <div class="col-md-4">
                            <label class="form-label">Niveau pour liste :</label>
                            <input type="text" class="form-control" name="niveau" placeholder="L1, L2..." maxlength="10" required>
                            <div class="form-text">Niveau pour filtrer les étudiants</div>
                        </div>
                    @endif
                    <div class="col-md-8">
                        <button type="submit" class="btn btn-primary">🚀 Générer liste électorale</button>
                    </div>
                </form>
            @else
                <div class="alert alert-info">
                    @if($election->listesElectorales()->exists())
                        ✅ Liste électorale générée ({{ $election->listesElectorales->count() }} électeurs)
                    @else
                        ℹ️ Activez l'élection pour générer la liste
                    @endif
                </div>
            @endif
        </div>

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
