@extends('layouts.app')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="h3">Détails de l'UFR</h2>
                <div>
                    <a href="{{ route('ufr.index') }}" class="btn btn-secondary">
                        <i class="fas fa-arrow-left me-2"></i>Retour
                    </a>
                    <a href="{{ route('ufr.edit', $ufr) }}" class="btn btn-success">
                        <i class="fas fa-edit me-2"></i>Modifier
                    </a>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-lg-8">
            <div class="card shadow mb-4">
                <div class="card-header bg-success text-white">
                    <h5 class="mb-0">
                        <i class="fas fa-university me-2"></i>Informations générales
                    </h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-12 mb-3">
                            <label class="form-label text-muted">Nom</label>
                            <p class="form-control-static fw-bold h5">{{ $ufr->nom }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card shadow">
                <div class="card-header bg-success text-white">
                    <h5 class="mb-0">
                        <i class="fas fa-building me-2"></i>Départements rattachés ({{ $ufr->departements_count ?? 0 }})
                    </h5>
                </div>
                <div class="card-body">
                    @forelse($ufr->departements as $departement)
                        <div class="mb-3 p-3 border rounded">
                            <h6>{{ $departement->nom }}</h6>
                            <small class="text-muted">{{ $departement->filieres_count ?? 0 }} filières</small>
                        </div>
                    @empty
                        <p class="text-muted text-center py-4">Aucun département rattaché.</p>
                    @endforelse
                </div>
            </div>
        </div>

        <div class="col-lg-4">
            <div class="card shadow">
                <div class="card-header bg-success text-white">
                    <h5 class="mb-0">
                        <i class="fas fa-list me-2"></i>Départements
                    </h5>
                </div>
                <div class="card-body">
                    <p class="text-muted text-center py-4">Nombre de départements: {{ $ufr->departements_count ?? 0 }}</p>
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
<script src="{{ asset('js/ufr.js') }}">
</script>
@endpush
