@extends('layouts.app')

@section('content')
<div class="container-fluid">

    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="h3">Modifier la Filière</h2>
        <a href="{{ route('filiere.show', $filiere) }}" class="btn btn-secondary">
            <i class="fas fa-arrow-left me-2"></i>Retour
        </a>
    </div>

    <div class="card shadow">
        <div class="card-header bg-warning text-white">
            <h5 class="mb-0">Modifier la Filière</h5>
        </div>

        <div class="card-body">

            <form method="POST" action="{{ route('filiere.update', $filiere) }}">
                @csrf
                @method('PUT')

                <div class="mb-3">
                    <label>Nom de la Filière</label>
                    <input type="text"
                           name="nom"
                           class="form-control"
                           value="{{ old('nom', $filiere->nom) }}"
                           required>
                </div>

                <div class="mb-3">
                    <label>Département</label>
                    <select name="id_departement" class="form-select" required>
                        <option value="">Choisir</option>
                        @foreach($departements as $departement)
                            <option value="{{ $departement->id_departement }}"
                                {{ old('id_departement', $filiere->id_departement) == $departement->id_departement ? 'selected' : '' }}>
                                {{ $departement->nom }}
                            </option>
                        @endforeach
                    </select>
                </div>

                <div class="text-end">
                    <button type="submit" class="btn btn-warning">
                        Mettre à jour
                    </button>
                </div>

            </form>

        </div>
    </div>

</div>
@endsection