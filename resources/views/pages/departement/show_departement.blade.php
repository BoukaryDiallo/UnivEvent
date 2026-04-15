@extends('layouts.app')

@section('content')
<div class="container-fluid">

    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="h3">Détails du Département</h2>

        <div>
            <a href="{{ route('departement.index') }}" class="btn btn-secondary">
                <i class="fas fa-arrow-left me-2"></i>Retour
            </a>

            <a href="{{ route('departement.edit', $departement) }}" class="btn btn-warning">
                <i class="fas fa-edit me-2"></i>Modifier
            </a>
        </div>
    </div>

    <div class="row">

        {{-- MAIN INFO --}}
        <div class="col-lg-8">

            <div class="card shadow mb-4">

                <div class="card-header bg-success text-white">
                    <h5 class="mb-0">
                        <i class="fas fa-building me-2"></i>
                        Informations générales
                    </h5>
                </div>

                <div class="card-body">

                    <div class="row">

                        <div class="col-md-6 mb-3">
                            <label class="form-label text-muted">Département</label>
                            <p class="fw-bold">{{ $departement->nom }}</p>
                        </div>

                    </div>

                    <div class="row">
                        <label class="form-label text-muted">Unité de Formation et de Recherche(UFR)</label>
                        <p>
                            {{ $departement->ufr->nom ?? 'N/A' }}
                        </p>
                       
                    </div>

                </div>
            </div>

            {{-- FILIERES --}}
            <div class="card shadow">

                <div class="card-header bg-info text-white">
                    <h5 class="mb-0">
                        <i class="fas fa-graduation-cap me-2"></i>
                        Filières proposées
                    </h5>
                </div>

                <div class="card-body">

                    @forelse($departement->filieres as $filiere)

                        <div class="border rounded p-3 mb-2">

                            <div class="d-flex justify-content-between align-items-center">

                                <div>
                                    <strong>{{ $filiere->nom }}</strong>
                                    <br>
                                    <small class="text-muted">{{ $filiere->code }}</small>
                                </div>

                                <div>
                                    <span class="badge bg-primary">
                                        {{ ucfirst($filiere->niveau ?? 'N/A') }}
                                    </span>

                                    <span class="badge bg-success">
                                        {{ $filiere->etudiants_count ?? 0 }} étudiants
                                    </span>
                                </div>

                                <div>
                                    <a href="{{ route('filiere.show', $filiere) }}"
                                       class="btn btn-sm btn-outline-success">
                                        <i class="fas fa-eye"></i>
                                    </a>
                                </div>

                            </div>

                        </div>

                    @empty
                        <p class="text-muted text-center py-4">
                            Aucune filière dans ce département.
                        </p>
                    @endforelse

                </div>
            </div>

        </div>

        {{-- STATISTIQUES --}}
        <div class="col-lg-4">

            <div class="card shadow mb-4">

                <div class="card-header bg-primary text-white">
                    <h5 class="mb-0">
                        <i class="fas fa-chart-bar me-2"></i>
                        Statistiques
                    </h5>
                </div>

                <div class="card-body text-center">

                    <h2 class="text-success">
                        {{ $departement->etudiants_count ?? 0 }}
                    </h2>
                    <p>Étudiants inscrits</p>

                    <hr>

                    <div class="d-flex justify-content-between mb-2">
                        <span>Filières</span>
                        <span class="badge bg-success">
                            {{ $departement->filieres->count() }}
                        </span>
                    </div>

                    <div class="d-flex justify-content-between mb-2">
                        <span>Enseignants</span>
                        <span class="badge bg-success">
                            {{ $departement->enseignants_count ?? 0 }}
                        </span>
                    </div>

                    <div class="d-flex justify-content-between mb-2">
                        <span>Promotions</span>
                        <span class="badge bg-success">
                            {{ $departement->promotions_count ?? 0 }}
                        </span>
                    </div>

                    <div class="d-flex justify-content-between">
                        <span>Laboratoires</span>
                        <span class="badge bg-success">
                            {{ $departement->laboratoires_count ?? 0 }}
                        </span>
                    </div>

                </div>
            </div>

            <div class="card shadow">

                <div class="card-header bg-warning text-white">
                    <h5 class="mb-0">
                        <i class="fas fa-clock me-2"></i>
                        Dernières activités
                    </h5>
                </div>

                <div class="card-body text-center">
                    <p class="text-muted">
                        Aucune activité récente disponible.
                    </p>
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