@extends('layouts.app')

@section('content')
<div class="container-fluid py-4" style="background:#f4f6f9; min-height:100vh;">

    <!-- HEADER -->
    <div class="mb-4">
        <h3 class="fw-bold text-success">Tableau de bord Administrateur</h3>
        <p class="text-muted mb-0">Vue globale du système UnivEvent</p>
    </div>

    <!-- ACTIONS RAPIDES -->
    <div class="mb-4">
        <div class="d-flex flex-wrap gap-2">

            <a href="#" class="btn btn-success shadow-sm">
                <i class="fas fa-plus me-1"></i> Nouvelle élection
            </a>

            <a href="#" class="btn btn-outline-success">
                <i class="fas fa-users me-1"></i> Ajouter étudiants
            </a>

            <a href="#" class="btn btn-outline-success">
                <i class="fas fa-user-check me-1"></i> Valider candidatures
            </a>

            <a href="#" class="btn btn-outline-success">
                <i class="fas fa-vote-yea me-1"></i> Ouvrir vote
            </a>

            <a href="#" class="btn btn-outline-success">
                <i class="fas fa-chart-bar me-1"></i> Voir résultats
            </a>

        </div>
    </div>

    <!-- STATS -->
    <div class="row g-3 mb-4">

        <div class="col-md-3">
            <div class="p-3 rounded shadow-sm" style="background:#e9f7ef;">
                <small class="text-muted">Étudiants</small>
                <h2 class="text-success fw-bold">1250</h2>
            </div>
        </div>

        <div class="col-md-3">
            <div class="p-3 rounded shadow-sm" style="background:#e8f0fe;">
                <small class="text-muted">Élections</small>
                <h2 class="text-success fw-bold">8</h2>
            </div>
        </div>

        <div class="col-md-3">
            <div class="p-3 rounded shadow-sm" style="background:#fff4e5;">
                <small class="text-muted">Candidatures</small>
                <h2 class="text-success fw-bold">42</h2>
            </div>
        </div>

        <div class="col-md-3">
            <div class="p-3 rounded shadow-sm" style="background:#fce8e6;">
                <small class="text-muted">Votes</small>
                <h2 class="text-success fw-bold">980</h2>
            </div>
        </div>

    </div>

    <div class="row g-4">

        <!-- ACTIVITÉS -->
        <div class="col-lg-6">
            <div class="p-3 rounded shadow-sm" style="background:#ffffffcc; backdrop-filter:blur(5px);">

                <h6 class="fw-bold text-success mb-3">
                    Activités récentes
                </h6>

                <div class="list-group">

                    <div class="list-group-item border-0 mb-2 rounded" style="background:#f8f9fa;">
                        🟢 Nouvelle élection créée
                    </div>

                    <div class="list-group-item border-0 mb-2 rounded" style="background:#f8f9fa;">
                        🟡 Candidature en attente de validation
                    </div>

                    <div class="list-group-item border-0 mb-2 rounded" style="background:#f8f9fa;">
                        🔵 Liste électorale générée
                    </div>

                    <div class="list-group-item border-0 mb-2 rounded" style="background:#f8f9fa;">
                        🟢 Vote en cours
                    </div>

                </div>

            </div>
        </div>

        <!-- ÉLECTIONS -->
        <div class="col-lg-6">
            <div class="p-3 rounded shadow-sm" style="background:#ffffffcc; backdrop-filter:blur(5px);">

                <h6 class="fw-bold text-success mb-3">
                    Élections en cours
                </h6>

                <div class="mb-3 p-2 rounded" style="background:#f8f9fa;">
                    <strong>Délégué UFR SEA</strong><br>
                    <span class="badge bg-success">EN COURS</span>
                </div>

                <div class="mb-3 p-2 rounded" style="background:#f8f9fa;">
                    <strong>Délégué Informatique</strong><br>
                    <span class="badge bg-warning text-dark">BROUILLON</span>
                </div>

                <div class="p-2 rounded" style="background:#f8f9fa;">
                    <strong>Délégué Mathématiques</strong><br>
                    <span class="badge bg-secondary">TERMINÉ</span>
                </div>

            </div>
        </div>

    </div>

</div>
@endsection