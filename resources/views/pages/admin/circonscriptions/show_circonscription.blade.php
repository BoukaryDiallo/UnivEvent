@extends('layouts.app')

@section('content')
<div class="container mt-5">
    <h2 class="text-center text-success mb-4">Détails de la Circonscription</h2>

    <div class="card shadow p-4">
        <h4 class="card-title text-primary">Département : {{ $circonscription->departement }}</h4>
        <ul class="list-group list-group-flush mt-3">
            <li class="list-group-item"><strong>Filière :</strong> {{ $circonscription->filiere }}</li>
            <li class="list-group-item"><strong>Niveau :</strong> {{ $circonscription->niveau }}</li>
        </ul>

        <div class="mt-4 d-flex justify-content-end">
            <a href="{{ route('circonscriptions.edit', $circonscription->id_circonscription) }}" class="btn btn-warning me-2">Modifier</a>
            <form action="{{ route('circonscriptions.destroy', $circonscription->id_circonscription) }}" method="POST" style="display:inline;">
                @csrf @method('DELETE')
                <button class="btn btn-danger" onclick="return confirm('Supprimer cette circonscription ?')">Supprimer</button>
            </form>
            <a href="{{ route('circonscriptions.index') }}" class="btn btn-secondary ms-2">Retour à la liste</a>
        </div>
    </div>
</div>
@endsection
