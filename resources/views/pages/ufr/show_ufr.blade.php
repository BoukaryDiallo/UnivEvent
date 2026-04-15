@extends('layouts.app')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="h3">Détails de l'UFR</h2>
                <div>
                    <a href="{{ route('ufr.list') }}" class="btn btn-secondary">
                        <i class="fas fa-arrow-left me-2"></i>Retour
                    </a>
                    <a href="{{ route('ufr.edit', $ufr->id) }}" class="btn btn-warning">
                        <i class="fas fa-edit me-2"></i>Modifier
                    </a>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-lg-8">
            <div class="card shadow mb-4">
                <div class="card-header bg-primary text-white">
                    <h5 class="mb-0">
                        <i class="fas fa-university me-2"></i>Informations générales
                    </h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label text-muted">Code UFR</label>
                            <p class="form-control-static"><span class="badge bg-primary fs-6">UFR-SCI</span></p>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label text-muted">Nom</label>
                            <p class="form-control-static fw-bold">Sciences et Technologies</p>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label text-muted">Description</label>
                        <p class="form-control-static">
                            L'UFR des Sciences et Technologies assure la formation dans les domaines des sciences fondamentales, 
                            des sciences de l'ingénieur et des technologies. Elle prépare les étudiants aux métiers de la recherche, 
                            de l'enseignement supérieur et de l'industrie.
                        </p>
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label text-muted">Responsable</label>
                            <p class="form-control-static">Prof. Jean Kaboré</p>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label text-muted">Statut</label>
                            <p class="form-control-static">
                                <span class="badge bg-success">Actif</span>
                            </p>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label text-muted">Email</label>
                            <p class="form-control-static">
                                <a href="mailto:sciences@univ-event.bf">sciences@univ-event.bf</a>
                            </p>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label text-muted">Téléphone</label>
                            <p class="form-control-static">
                                <a href="tel:+22625304567">+226 25 30 45 67</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card shadow">
                <div class="card-header bg-info text-white">
                    <h5 class="mb-0">
                        <i class="fas fa-building me-2"></i>Départements rattachés
                    </h5>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Département</th>
                                    <th>Chef de département</th>
                                    <th>Nombre de filières</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <strong>Informatique</strong>
                                        <br>
                                        <small class="text-muted">DPT-INF</small>
                                    </td>
                                    <td>Dr. Paul Ouattara</td>
                                    <td><span class="badge bg-primary">4</span></td>
                                    <td>
                                        <a href="{{ route('departement.show', 1) }}" class="btn btn-sm btn-outline-primary">
                                            <i class="fas fa-eye"></i>
                                        </a>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <strong>Mathématiques</strong>
                                        <br>
                                        <small class="text-muted">DPT-MATH</small>
                                    </td>
                                    <td>Prof. Marie Konaté</td>
                                    <td><span class="badge bg-primary">3</span></td>
                                    <td>
                                        <a href="{{ route('departement.show', 2) }}" class="btn btn-sm btn-outline-primary">
                                            <i class="fas fa-eye"></i>
                                        </a>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <strong>Physique-Chimie</strong>
                                        <br>
                                        <small class="text-muted">DPT-PHYS</small>
                                    </td>
                                    <td>Dr. Boubacar Diallo</td>
                                    <td><span class="badge bg-primary">3</span></td>
                                    <td>
                                        <a href="{{ route('departement.show', 3) }}" class="btn btn-sm btn-outline-primary">
                                            <i class="fas fa-eye"></i>
                                        </a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-lg-4">
            <div class="card shadow mb-4">
                <div class="card-header bg-success text-white">
                    <h5 class="mb-0">
                        <i class="fas fa-chart-bar me-2"></i>Statistiques
                    </h5>
                </div>
                <div class="card-body">
                    <div class="text-center mb-3">
                        <h2 class="text-primary">1,245</h2>
                        <p class="text-muted mb-0">Étudiants inscrits</p>
                    </div>
                    <hr>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Départements</span>
                        <span class="badge bg-info">3</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Filières</span>
                        <span class="badge bg-info">10</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Enseignants</span>
                        <span class="badge bg-info">45</span>
                    </div>
                    <div class="d-flex justify-content-between">
                        <span>Promotions</span>
                        <span class="badge bg-info">8</span>
                    </div>
                </div>
            </div>

            <div class="card shadow">
                <div class="card-header bg-warning text-white">
                    <h5 class="mb-0">
                        <i class="fas fa-clock me-2"></i>Dernières activités
                    </h5>
                </div>
                <div class="card-body">
                    <div class="activity-item mb-3">
                        <div class="d-flex">
                            <div class="flex-shrink-0">
                                <i class="fas fa-user-plus text-success"></i>
                            </div>
                            <div class="flex-grow-1 ms-2">
                                <small class="text-muted">Il y a 2 heures</small>
                                <p class="mb-0">Nouveau département créé</p>
                            </div>
                        </div>
                    </div>
                    <div class="activity-item mb-3">
                        <div class="d-flex">
                            <div class="flex-shrink-0">
                                <i class="fas fa-edit text-warning"></i>
                            </div>
                            <div class="flex-grow-1 ms-2">
                                <small class="text-muted">Hier</small>
                                <p class="mb-0">Modification des informations</p>
                            </div>
                        </div>
                    </div>
                    <div class="activity-item">
                        <div class="d-flex">
                            <div class="flex-shrink-0">
                                <i class="fas fa-users text-info"></i>
                            </div>
                            <div class="flex-grow-1 ms-2">
                                <small class="text-muted">Il y a 3 jours</small>
                                <p class="mb-0">Nouveaux étudiants inscrits</p>
                            </div>
                        </div>
                    </div>
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
