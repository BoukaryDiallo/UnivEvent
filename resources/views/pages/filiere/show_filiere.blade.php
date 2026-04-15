@extends('layouts.app')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="h3">Détails de la Filière</h2>
                <div>
                    <a href="{{ route('filiere.list') }}" class="btn btn-secondary">
                        <i class="fas fa-arrow-left me-2"></i>Retour
                    </a>
                    <a href="{{ route('filiere.edit', $filiere->id) }}" class="btn btn-warning">
                        <i class="fas fa-edit me-2"></i>Modifier
                    </a>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-lg-8">
            <div class="card shadow mb-4">
                <div class="card-header bg-info text-white">
                    <h5 class="mb-0">
                        <i class="fas fa-graduation-cap me-2"></i>Informations générales
                    </h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label text-muted">Code Filière</label>
                            <p class="form-control-static"><span class="badge bg-info fs-6">FIL-GL</span></p>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label text-muted">Nom</label>
                            <p class="form-control-static fw-bold">Génie Logiciel</p>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label text-muted">Description</label>
                        <p class="form-control-static">
                            La filière Génie Logiciel forme des experts en conception, développement et maintenance 
                            de systèmes logiciels complexes. Le programme couvre l'analyse des besoins, l'architecture 
                            logicielle, les méthodes agiles, le test et la qualité logicielle.
                        </p>
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label text-muted">Département</label>
                            <p class="form-control-static">
                                <span class="badge bg-success">DPT-INF</span>
                                <br>
                                <small>Informatique</small>
                            </p>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label text-muted">UFR</label>
                            <p class="form-control-static">
                                <span class="badge bg-primary">UFR-SCI</span>
                                <br>
                                <small>Sciences et Technologies</small>
                            </p>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-4 mb-3">
                            <label class="form-label text-muted">Niveau</label>
                            <p class="form-control-static">
                                <span class="badge bg-warning">Licence - Master</span>
                            </p>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label class="form-label text-muted">Durée</label>
                            <p class="form-control-static">5 ans</p>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label class="form-label text-muted">Capacité d'accueil</label>
                            <p class="form-control-static">
                                <span class="badge bg-secondary">150 étudiants</span>
                            </p>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label text-muted">Responsable de filière</label>
                            <p class="form-control-static">Dr. Aminata Bamba</p>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label text-muted">Statut</label>
                            <p class="form-control-static">
                                <span class="badge bg-success">Actif</span>
                            </p>
                        </div>
                    </div>

                    <div class="mb-3">
                        <label class="form-label text-muted">Conditions d'admission</label>
                        <p class="form-control-static">
                            <ul class="list-unstyled">
                                <li><i class="fas fa-check text-success me-2"></i>Baccalauréat série S ou équivalent</li>
                                <li><i class="fas fa-check text-success me-2"></i>Bonne maîtrise des mathématiques</li>
                                <li><i class="fas fa-check text-success me-2"></i>Connaissances de base en programmation</li>
                                <li><i class="fas fa-check text-success me-2"></i>Test d'aptitude et entretien</li>
                            </ul>
                        </p>
                    </div>
                </div>
            </div>

            <div class="card shadow">
                <div class="card-header bg-primary text-white">
                    <h5 class="mb-0">
                        <i class="fas fa-book me-2"></i>Programme et Modules
                    </h5>
                </div>
                <div class="card-body">
                    <div class="accordion" id="programmeAccordion">
                        <div class="accordion-item">
                            <h2 class="accordion-header" id="headingOne">
                                <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne">
                                    Licence 1ère année
                                </button>
                            </h2>
                            <div id="collapseOne" class="accordion-collapse collapse show" data-bs-parent="#programmeAccordion">
                                <div class="accordion-body">
                                    <ul class="list-group list-group-flush">
                                        <li class="list-group-item">Algorithmique et Programmation</li>
                                        <li class="list-group-item">Mathématiques Discrètes</li>
                                        <li class="list-group-item">Structures de Données</li>
                                        <li class="list-group-item">Bases de Données</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="accordion-item">
                            <h2 class="accordion-header" id="headingTwo">
                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo">
                                    Licence 2ème année
                                </button>
                            </h2>
                            <div id="collapseTwo" class="accordion-collapse collapse" data-bs-parent="#programmeAccordion">
                                <div class="accordion-body">
                                    <ul class="list-group list-group-flush">
                                        <li class="list-group-item">Programmation Orientée Objet</li>
                                        <li class="list-group-item">Systèmes d'Exploitation</li>
                                        <li class="list-group-item">Réseaux Informatiques</li>
                                        <li class="list-group-item">Génie Logiciel Fondamental</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
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
                        <h2 class="text-info">245</h2>
                        <p class="text-muted mb-0">Étudiants inscrits</p>
                    </div>
                    <hr>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Promotions</span>
                        <span class="badge bg-info">5</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Enseignants</span>
                        <span class="badge bg-info">12</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Taux de réussite</span>
                        <span class="badge bg-success">85%</span>
                    </div>
                    <div class="d-flex justify-content-between">
                        <span>Insertion professionnelle</span>
                        <span class="badge bg-success">92%</span>
                    </div>
                </div>
            </div>

            <div class="card shadow mb-4">
                <div class="card-header bg-warning text-white">
                    <h5 class="mb-0">
                        <i class="fas fa-users me-2"></i>Débouchés
                    </h5>
                </div>
                <div class="card-body">
                    <div class="mb-3">
                        <h6 class="fw-bold">Métiers accessibles :</h6>
                        <ul class="list-unstyled">
                            <li><i class="fas fa-chevron-right text-primary me-2"></i>Développeur Logiciel</li>
                            <li><i class="fas fa-chevron-right text-primary me-2"></i>Architecte Logiciel</li>
                            <li><i class="fas fa-chevron-right text-primary me-2"></i>Chef de Projet IT</li>
                            <li><i class="fas fa-chevron-right text-primary me-2"></i>Consultant en SI</li>
                            <li><i class="fas fa-chevron-right text-primary me-2"></i>Ingénieur QA/Test</li>
                        </ul>
                    </div>
                    <div>
                        <h6 class="fw-bold">Secteurs d'activité :</h6>
                        <div class="d-flex flex-wrap gap-1">
                            <span class="badge bg-light text-dark">Banque</span>
                            <span class="badge bg-light text-dark">Télécom</span>
                            <span class="badge bg-light text-dark">E-commerce</span>
                            <span class="badge bg-light text-dark">Startups</span>
                            <span class="badge bg-light text-dark">Industrie</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card shadow">
                <div class="card-header bg-secondary text-white">
                    <h5 class="mb-0">
                        <i class="fas fa-clock me-2"></i>Dernières activités
                    </h5>
                </div>
                <div class="card-body">
                    <div class="activity-item mb-3">
                        <div class="d-flex">
                            <div class="flex-shrink-0">
                                <i class="fas fa-user-graduate text-info"></i>
                            </div>
                            <div class="flex-grow-1 ms-2">
                                <small class="text-muted">Il y a 2 jours</small>
                                <p class="mb-0">Soutenances de projets</p>
                            </div>
                        </div>
                    </div>
                    <div class="activity-item mb-3">
                        <div class="d-flex">
                            <div class="flex-shrink-0">
                                <i class="fas fa-file-alt text-success"></i>
                            </div>
                            <div class="flex-grow-1 ms-2">
                                <small class="text-muted">La semaine dernière</small>
                                <p class="mb-0">Mise à jour du programme</p>
                            </div>
                        </div>
                    </div>
                    <div class="activity-item">
                        <div class="d-flex">
                            <div class="flex-shrink-0">
                                <i class="fas fa-briefcase text-warning"></i>
                            </div>
                            <div class="flex-grow-1 ms-2">
                                <small class="text-muted">Il y a 2 semaines</small>
                                <p class="mb-0">Forum entreprises</p>
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
<link rel="stylesheet" href="{{ asset('css/filiere.css') }}">
@endpush

@push('scripts')
<script src="{{ asset('js/filiere.js') }}"></script>
@endpush
