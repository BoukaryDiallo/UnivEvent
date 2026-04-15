@extends('layouts.app')

@section('content')
<div class="container-fluid">
    <!-- Hero Section -->
    <div class="hero-section bg-primary text-white py-5 mb-5">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-lg-6">
                    <h1 class="display-4 fw-bold mb-4">Bienvenue dans UnivEvent</h1>
                    <p class="lead mb-4">Plateforme de gestion des élections universitaires</p>
                    <p class="mb-4">Organisez, gérez et participez aux élections étudiantes en toute simplicité et transparence.</p>
                    <div class="d-flex gap-3">
                        <a href="{{ route('elections.index') }}" class="btn btn-light btn-lg">
                            <i class="fas fa-vote-yea me-2"></i>Voir les élections
                        </a>
                        <a href="{{ route('candidatures.create') }}" class="btn btn-outline-light btn-lg">
                            <i class="fas fa-user-plus me-2"></i>Se candidater
                        </a>
                    </div>
                </div>
                <div class="col-lg-6 text-center">
                    <div class="hero-image">
                        <i class="fas fa-box-ballot" style="font-size: 12rem; opacity: 0.3;"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Statistics Section -->
    <div class="container mb-5">
        <div class="row">
            <div class="col-md-3 mb-4">
                <div class="card bg-primary text-white">
                    <div class="card-body text-center">
                        <i class="fas fa-users fa-3x mb-3"></i>
                        <h3 class="card-title">2,847</h3>
                        <p class="card-text">Étudiants inscrits</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-4">
                <div class="card bg-success text-white">
                    <div class="card-body text-center">
                        <i class="fas fa-poll fa-3x mb-3"></i>
                        <h3 class="card-title">12</h3>
                        <p class="card-text">Élections actives</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-4">
                <div class="card bg-info text-white">
                    <div class="card-body text-center">
                        <i class="fas fa-user-tie fa-3x mb-3"></i>
                        <h3 class="card-title">45</h3>
                        <p class="card-text">Candidats en lice</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-4">
                <div class="card bg-warning text-white">
                    <div class="card-body text-center">
                        <i class="fas fa-chart-line fa-3x mb-3"></i>
                        <h3 class="card-title">87%</h3>
                        <p class="card-text">Taux de participation</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Features Section -->
    <div class="container mb-5">
        <h2 class="text-center mb-5">Fonctionnalités Principales</h2>
        <div class="row">
            <div class="col-md-4 mb-4">
                <div class="card h-100 shadow-sm">
                    <div class="card-body text-center">
                        <div class="feature-icon bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 80px; height: 80px;">
                            <i class="fas fa-vote-yea fa-2x"></i>
                        </div>
                        <h4 class="card-title">Vote en Ligne</h4>
                        <p class="card-text">Votez de manière sécurisée depuis n'importe où avec notre système de vote en ligne transparent et fiable.</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-4">
                <div class="card h-100 shadow-sm">
                    <div class="card-body text-center">
                        <div class="feature-icon bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 80px; height: 80px;">
                            <i class="fas fa-user-check fa-2x"></i>
                        </div>
                        <h4 class="card-title">Gestion des Candidatures</h4>
                        <p class="card-text">Déposez votre candidature facilement et gérez toutes les informations relatives aux candidats.</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-4">
                <div class="card h-100 shadow-sm">
                    <div class="card-body text-center">
                        <div class="feature-icon bg-info text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 80px; height: 80px;">
                            <i class="fas fa-chart-bar fa-2x"></i>
                        </div>
                        <h4 class="card-title">Résultats en Temps Réel</h4>
                        <p class="card-text">Suivez l'évolution des votes et consultez les résultats en temps réel de manière transparente.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Recent Elections Section -->
    <div class="container mb-5">
        <h2 class="text-center mb-5">Élections Récentes</h2>
        <div class="row">
            <div class="col-md-6 mb-4">
                <div class="card shadow-sm">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0">Conseil des Étudiants 2024</h5>
                    </div>
                    <div class="card-body">
                        <p class="card-text">Élection des représentants étudiants au conseil de l'université pour l'année 2024.</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">Du 15 Avril au 20 Avril 2024</small>
                            <span class="badge bg-success">En cours</span>
                        </div>
                        <div class="progress mt-3">
                            <div class="progress-bar bg-success" style="width: 65%">65%</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6 mb-4">
                <div class="card shadow-sm">
                    <div class="card-header bg-info text-white">
                        <h5 class="mb-0">Représentants de Filière</h5>
                    </div>
                    <div class="card-body">
                        <p class="card-text">Élection des représentants étudiants pour chaque filière d'études.</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">Du 1 Mai au 5 Mai 2024</small>
                            <span class="badge bg-warning">À venir</span>
                        </div>
                        <div class="progress mt-3">
                            <div class="progress-bar bg-warning" style="width: 0%">0%</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Quick Actions Section -->
    <div class="container mb-5">
        <div class="row">
            <div class="col-12">
                <div class="card bg-light">
                    <div class="card-body">
                        <h4 class="card-title text-center mb-4">Actions Rapides</h4>
                        <div class="row text-center">
                            <div class="col-md-3 mb-3">
                                <a href="{{ route('votes.create') }}" class="btn btn-outline-primary btn-lg w-100">
                                    <i class="fas fa-vote-yea d-block mb-2" style="font-size: 2rem;"></i>
                                    Voter
                                </a>
                            </div>
                            <div class="col-md-3 mb-3">
                                <a href="{{ route('candidatures.create') }}" class="btn btn-outline-success btn-lg w-100">
                                    <i class="fas fa-user-plus d-block mb-2" style="font-size: 2rem;"></i>
                                    Candidater
                                </a>
                            </div>
                            <div class="col-md-3 mb-3">
                                <a href="{{ route('elections.index') }}" class="btn btn-outline-info btn-lg w-100">
                                    <i class="fas fa-list d-block mb-2" style="font-size: 2rem;"></i>
                                    Voir les élections
                                </a>
                            </div>
                            <div class="col-md-3 mb-3">
                                <a href="#" class="btn btn-outline-warning btn-lg w-100">
                                    <i class="fas fa-chart-bar d-block mb-2" style="font-size: 2rem;"></i>
                                    Résultats
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
.hero-section {
    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
}

.feature-icon {
    transition: transform 0.3s ease;
}

.feature-icon:hover {
    transform: scale(1.1);
}

.card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.progress {
    height: 8px;
}

.btn-lg {
    transition: all 0.3s ease;
}

.btn-lg:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}
</style>
@endsection
