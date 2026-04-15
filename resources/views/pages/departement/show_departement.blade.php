@extends('layouts.app')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="h3">Détails du Département</h2>
                <div>
                    <a href="{{ route('departement.list') }}" class="btn btn-secondary">
                        <i class="fas fa-arrow-left me-2"></i>Retour
                    </a>
                    <a href="{{ route('departement.edit', $departement->id) }}" class="btn btn-warning">
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
                        <i class="fas fa-building me-2"></i>Informations générales
                    </h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label text-muted">Code Département</label>
                            <p class="form-control-static"><span class="badge bg-success fs-6">DPT-INF</span></p>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label text-muted">Nom</label>
                            <p class="form-control-static fw-bold">Informatique</p>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label text-muted">Description</label>
                        <p class="form-control-static">
                            Le département d'Informatique assure la formation dans les domaines des technologies de l'information, 
                            du développement logiciel, de l'intelligence artificielle et de la cybersécurité. 
                            Il prépare les étudiants aux métiers porteurs du numérique.
                        </p>
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label text-muted">UFR de rattachement</label>
                            <p class="form-control-static">
                                <span class="badge bg-primary">UFR-SCI</span>
                                <br>
                                <small>Sciences et Technologies</small>
                            </p>
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
                            <label class="form-label text-muted">Chef de département</label>
                            <p class="form-control-static">Dr. Paul Ouattara</p>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label text-muted">Email</label>
                            <p class="form-control-static">
                                <a href="mailto:informatique@univ-event.bf">informatique@univ-event.bf</a>
                            </p>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label text-muted">Téléphone</label>
                            <p class="form-control-static">
                                <a href="tel:+22625304570">+226 25 30 45 70</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card shadow">
                <div class="card-header bg-info text-white">
                    <h5 class="mb-0">
                        <i class="fas fa-graduation-cap me-2"></i>Filières proposées
                    </h5>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Filière</th>
                                    <th>Niveau</th>
                                    <th>Nombre d'étudiants</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <strong> Génie Logiciel</strong>
                                        <br>
                                        <small class="text-muted">FIL-GL</small>
                                    </td>
                                    <td><span class="badge bg-primary">Licence - Master</span></td>
                                    <td><span class="badge bg-success">245</span></td>
                                    <td>
                                        <a href="{{ route('filiere.show', 1) }}" class="btn btn-sm btn-outline-primary">
                                            <i class="fas fa-eye"></i>
                                        </a>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <strong>Réseaux et Sécurité</strong>
                                        <br>
                                        <small class="text-muted">FIL-RS</small>
                                    </td>
                                    <td><span class="badge bg-primary">Licence - Master</span></td>
                                    <td><span class="badge bg-success">180</span></td>
                                    <td>
                                        <a href="{{ route('filiere.show', 2) }}" class="btn btn-sm btn-outline-primary">
                                            <i class="fas fa-eye"></i>
                                        </a>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <strong>Intelligence Artificielle</strong>
                                        <br>
                                        <small class="text-muted">FIL-IA</small>
                                    </td>
                                    <td><span class="badge bg-primary">Master</span></td>
                                    <td><span class="badge bg-success">95</span></td>
                                    <td>
                                        <a href="{{ route('filiere.show', 3) }}" class="btn btn-sm btn-outline-primary">
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
                <div class="card-header bg-primary text-white">
                    <h5 class="mb-0">
                        <i class="fas fa-chart-bar me-2"></i>Statistiques
                    </h5>
                </div>
                <div class="card-body">
                    <div class="text-center mb-3">
                        <h2 class="text-success">520</h2>
                        <p class="text-muted mb-0">Étudiants inscrits</p>
                    </div>
                    <hr>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Filières</span>
                        <span class="badge bg-info">3</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Enseignants</span>
                        <span class="badge bg-info">15</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Promotions</span>
                        <span class="badge bg-info">6</span>
                    </div>
                    <div class="d-flex justify-content-between">
                        <span>Laboratoires</span>
                        <span class="badge bg-info">2</span>
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
                                <i class="fas fa-graduation-cap text-success"></i>
                            </div>
                            <div class="flex-grow-1 ms-2">
                                <small class="text-muted">Il y a 1 heure</small>
                                <p class="mb-0">Nouvelle filière créée</p>
                            </div>
                        </div>
                    </div>
                    <div class="activity-item mb-3">
                        <div class="d-flex">
                            <div class="flex-shrink-0">
                                <i class="fas fa-user-plus text-info"></i>
                            </div>
                            <div class="flex-grow-1 ms-2">
                                <small class="text-muted">Hier</small>
                                <p class="mb-0">Nouveaux étudiants inscrits</p>
                            </div>
                        </div>
                    </div>
                    <div class="activity-item">
                        <div class="d-flex">
                            <div class="flex-shrink-0">
                                <i class="fas fa-edit text-warning"></i>
                            </div>
                            <div class="flex-grow-1 ms-2">
                                <small class="text-muted">Il y a 2 jours</small>
                                <p class="mb-0">Modification du programme</p>
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
<link rel="stylesheet" href="{{ asset('css/departement.css') }}">
@endpush

@push('scripts')
<script src="{{ asset('js/departement.js') }}"></script>
@endpush
