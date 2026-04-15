@extends('layouts.app')

@section('content')
<div class="container-fluid">

    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="h3">Créer une Filière</h2>
        <a href="{{ route('filiere.index') }}" class="btn btn-secondary">
            <i class="fas fa-arrow-left me-2"></i>Retour à la liste
        </a>
    </div>

    <div class="card shadow">
        <div class="card-header bg-info text-white">
            <h5 class="mb-0">
                <i class="fas fa-graduation-cap me-2"></i>Informations de la Filière
            </h5>
        </div>

        <div class="card-body">
            <form method="POST" action="{{ route('filiere.store') }}">
                @csrf

                <div class="mb-3">
                    <label for="nom" class="form-label">
                        Nom de la Filière <span class="text-danger">*</span>
                    </label>
                    <input type="text"
                           id="nom"
                           name="nom"
                           value="{{ old('nom') }}"
                           class="form-control @error('nom') is-invalid @enderror"
                           required>

                    @error('nom')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>

                <div class="mb-3">
                    <label for="id_departement" class="form-label">
                        Département <span class="text-danger">*</span>
                    </label>

                    <select id="id_departement"
                            name="id_departement"
                            class="form-select @error('id_departement') is-invalid @enderror"
                            required>

                        <option value="">Sélectionner un département</option>

                        @foreach($departements as $departement)
                            <option value="{{ $departement->id_departement }}"
                                {{ old('id_departement') == $departement->id_departement ? 'selected' : '' }}>
                                {{ $departement->code }} - {{ $departement->nom }}
                            </option>
                        @endforeach

                    </select>

                    @error('id_departement')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>

                <div class="d-flex justify-content-end gap-2">
                    <a href="{{ route('filiere.index') }}" class="btn btn-secondary">
                        Annuler
                    </a>
                    <button type="submit" class="btn btn-info">
                        Enregistrer
                    </button>
                </div>

            </form>
        </div>
    </div>

</div>
@endsection

@push('styles')
<link rel="stylesheet" href="{{ asset('css/filiere.css') }}">
@endpush

@push('scripts')
<script src="{{ asset('js/filiere.js') }}"></script>
@endpush