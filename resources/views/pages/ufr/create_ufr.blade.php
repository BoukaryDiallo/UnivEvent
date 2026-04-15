@extends('layouts.app')

@section('content')
<div class="container-fluid">

    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="h3">Créer un UFR</h2>

        <a href="{{ route('ufr.index') }}" class="btn btn-secondary">
            <i class="fas fa-arrow-left me-2"></i>
            Retour à la liste
        </a>
    </div>

    <div class="row">
        <div class="col-lg-8 mx-auto">

            <div class="card shadow">

                <div class="card-header bg-success text-white">
                    <h5 class="mb-0">
                        <i class="fas fa-university me-2"></i>
                        Informations de l'UFR
                    </h5>
                </div>

                <div class="card-body">

                    <form method="POST" action="{{ route('ufr.store') }}">
                        @csrf

                        {{-- NOM UFR --}}
                        <div class="mb-3">
                            <label class="form-label">
                                Nom de l'UFR <span class="text-danger">*</span>
                            </label>

                            <input type="text"
                                   name="nom"
                                   class="form-control @error('nom') is-invalid @enderror"
                                   value="{{ old('nom') }}"
                                   required>

                            @error('nom')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        {{-- ACTIONS --}}
                        <div class="d-flex justify-content-end gap-2">

                            <a href="{{ route('ufr.index') }}"
                               class="btn btn-secondary">
                                <i class="fas fa-times me-2"></i>
                                Annuler
                            </a>

                            <button type="submit" class="btn btn-success">
                                <i class="fas fa-save me-2"></i>
                                Enregistrer
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
<link rel="stylesheet" href="{{ asset('css/ufr.css') }}">
@endpush

@push('scripts')
<script src="{{ asset('js/ufr.js') }}"></script>
@endpush