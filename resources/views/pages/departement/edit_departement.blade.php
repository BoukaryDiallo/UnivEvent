@extends('layouts.app')

@section('content')
<div class="container-fluid">

    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="h3">Modifier le Département</h2>

        <a href="{{ route('departement.show', $departement) }}" class="btn btn-secondary">
            <i class="fas fa-arrow-left me-2"></i>Retour
        </a>
    </div>

    <div class="row">
        <div class="col-lg-8 mx-auto">

            <div class="card shadow">

                <div class="card-header bg-warning text-white">
                    <h5 class="mb-0">
                        <i class="fas fa-edit me-2"></i>
                        Modifier les informations du Département
                    </h5>
                </div>

                <div class="card-body">

                    <form method="POST"
                          action="{{ route('departement.update', $departement) }}">

                        @csrf
                        @method('PUT')

                        {{-- NOM --}}
                        <div class="mb-3">
                            <label class="form-label">Nom du Département *</label>

                            <input type="text"
                                   name="nom"
                                   class="form-control @error('nom') is-invalid @enderror"
                                   value="{{ old('nom', $departement->nom) }}"
                                   required>

                            @error('nom')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        {{-- UFR --}}
                        <div class="mb-3">
                            <label class="form-label">UFR de rattachement *</label>

                            <select name="id_ufr"
                                    class="form-select @error('id_ufr') is-invalid @enderror"
                                    required>

                                <option value="">Sélectionner un UFR</option>

                                @foreach($ufrs as $ufr)
                                    <option value="{{ $ufr->id_ufr }}"
                                        {{ old('id_ufr', $departement->id_ufr) == $ufr->id_ufr ? 'selected' : '' }}>
                                        {{ $ufr->code }} - {{ $ufr->nom }}
                                    </option>
                                @endforeach

                            </select>

                            @error('id_ufr')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        {{-- ACTIONS --}}
                        <div class="d-flex justify-content-end gap-2">

                            <a href="{{ route('departement.show', $departement) }}"
                               class="btn btn-secondary">
                                <i class="fas fa-times me-2"></i>Annuler
                            </a>

                            <button type="submit" class="btn btn-warning">
                                <i class="fas fa-save me-2"></i>Mettre à jour
                            </button>

                        </div>

                    </form>

                </div>

            </div>

        </div>
    </div>

</div>
@endsection

@push('styles')
<link rel="stylesheet" href="{{ asset('css/departement.css') }}">
@endpush

@push('scripts')
<script src="{{ asset('js/departement.js') }}"></script>
@endpush