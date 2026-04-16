<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>UnivEvent - Gestion des Élections</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- Bootstrap -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

    <style>
        body {
            overflow-x: hidden;
        }
        .sidebar {
            width: 260px;
            min-height: 100vh;
        }
        .sidebar .nav-link {
            color: #ffffff;
            margin-bottom: 6px;
            border-radius: 6px;
        }
        .sidebar .nav-link:hover {
            background-color: #198754;
        }
        .content-area {
            width: 100%;
            background-color: #f8f9fa;
            min-height: 100vh;
        }
    </style>

    @stack('styles')
</head>

<body>

<!-- TOP NAVBAR -->
<nav class="navbar navbar-dark bg-dark px-3">
    <a class="navbar-brand" href="#">
        <i class="fas fa-vote-yea me-2"></i>UnivEvent Admin
    </a>
</nav>

<div class="d-flex">

    <!-- SIDEBAR -->
    <div class="sidebar bg-dark text-white p-3">

        <h6 class="text-uppercase text-muted mb-3">Navigation</h6>

        <ul class="nav nav-pills flex-column">

            <li class="nav-item">
            <a href="{{ route('dashboard') }}" class="nav-link {{ request()->routeIs('dashboard') ? 'active bg-success' : '' }}">
                    <i class="fas fa-tachometer-alt me-2"></i>Dashboard
                </a>
            </li>

            <li class="nav-item">
            <a href="{{ route('ufr.index') }}" class="nav-link {{ request()->routeIs('ufr.*') ? 'active bg-success' : '' }}">
                    <i class="fas fa-university me-2"></i>UFR
                </a>
            </li>

            <li class="nav-item">
            <a href="{{ route('departement.index') }}" class="nav-link {{ request()->routeIs('departement.*') ? 'active bg-success' : '' }}">
                    <i class="fas fa-building me-2"></i>Départements
                </a>
            </li>

            <li class="nav-item">
            <a href="{{ route('filiere.index') }}" class="nav-link {{ request()->routeIs('filiere.*') ? 'active bg-success' : '' }}">
                    <i class="fas fa-layer-group me-2"></i>Filières
                </a>
            </li>

            <li class="nav-item">
            <a href="{{ route('etudiants.index') }}" class="nav-link {{ request()->routeIs('etudiants.*') ? 'active bg-success' : '' }}">
                    <i class="fas fa-users me-2"></i>Étudiants
                </a>
            </li>

            <hr class="text-secondary">

            <h6 class="text-uppercase text-muted mb-3">Processus électoral</h6>

            <li class="nav-item">
            <a href="{{ route('elections.index') }}" class="nav-link {{ request()->routeIs('elections.*') ? 'active bg-success' : '' }}">
                    <i class="fas fa-poll me-2"></i>Élections
                </a>
            </li>

            <li class="nav-item">
            <a href="{{ route('elections.index') }}" class="nav-link {{ request()->routeIs('elections.*') ? 'active bg-success' : '' }}">
                    <i class="fas fa-list me-2"></i>Listes électorales
                </a>
            </li>

            <li class="nav-item">
            <a href="{{ route('candidatures.index') }}" class="nav-link {{ request()->routeIs('candidatures.*') ? 'active bg-success' : '' }}">
                    <i class="fas fa-user-check me-2"></i>Candidatures
                </a>
            </li>

            <li class="nav-item">
            <a href="{{ route('votes.index') }}" class="nav-link {{ request()->routeIs('votes.*') ? 'active bg-success' : '' }}">
                    <i class="fas fa-vote-yea me-2"></i>Votes
                </a>
            </li>
            <li class="nav-item">
                <a href="{{ route('votes.elections') }}"
                class="nav-link {{ request()->routeIs('votes.elections') ? 'active bg-success' : '' }}">
                    <i class="fas fa-play-circle me-2"></i>
                    Participer à un vote
                </a>
            </li>

            <li class="nav-item">
            <a href="#" class="nav-link {{ request()->routeIs('resultats.*') ? 'active bg-success' : '' }}">
                    <i class="fas fa-chart-bar me-2"></i>Résultats & Dépouillement
                </a>
            </li>

            <hr class="text-secondary">

            <h6 class="text-uppercase text-muted mb-3">Administration</h6>

            <li class="nav-item">
            <a href="{{ route('create.user') }}" class="nav-link {{ request()->is('create_user') ? 'active bg-success' : '' }}">
                    <i class="fas fa-user-cog me-2"></i>Utilisateurs
                </a>
            </li>

            <li class="nav-item">
            <a href="#" class="nav-link">
                    <i class="fas fa-cogs me-2"></i>Configuration
                </a>
            </li>

        </ul>
    </div>

    <!-- MAIN CONTENT -->
    <div class="content-area p-4">
        @yield('content')
    </div>

</div>

<!-- Bootstrap JS -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

@stack('scripts')
</body>
</html>