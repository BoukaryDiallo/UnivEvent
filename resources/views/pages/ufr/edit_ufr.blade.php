@extends('layouts.app')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="h3">Modifier l'UFR</h2>
                <a href="{{ route('ufr.show', $ufr->id_ufr) }}" class="btn btn-secondary">
                    <i class="fas fa-arrow-left me-2"></i>Retour
                </a>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-lg-8 mx-auto">
            <div class="card shadow">
                <div class="card-header bg-warning text-white">
                    <h5 class="mb-0">
                        <i class="fas fa-edit me-2"></i>Modifier les informations de l'UFR
                    </h5>
                </div>
                <div class="card-body">
                    <form method="POST" action="{{ route('ufr.update', $ufr->id_ufr) }}">
                        @csrf
                        @method('PUT')
                        
                        <div class="mb-3">
                            <label for="nom" class="form-label">Nom de l'UFR <span class="text-danger">*</span></label>
                            <input type="text" class="form-control @error('nom') is-invalid @enderror" 
                                   id="nom" name="nom" value="{{ old('nom', $ufr->nom) }}" required>
                            @error('nom')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="d-flex justify-content-end gap-2">
                            <a href="{{ route('ufr.show', $ufr->id_ufr) }}" class="btn btn-secondary">
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
<link rel="stylesheet" href="{{ asset('css/ufr.css') }}">
@endpush

@push('scripts')
<script src="{{ asset('js/ufr.js') }}"></script>
@endpush
