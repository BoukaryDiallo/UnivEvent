<head>
    <meta charset="UTF-8">
    <title>UnivEvent - Gestion des Élections</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- Bootstrap CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome CDN -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <!-- CSS Select2 -->
    <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />

    <!-- ton CSS global -->
    <link rel="stylesheet" href="{{ asset('css/style.css') }}">

    <!-- styles spécifiques poussés par les pages -->
    @stack('styles')
</head>
<body>

<!-- NAVBAR -->
<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
  <div class="container">
    <a class="navbar-brand" href="{{ route('home') }}">
      <i class="fas fa-vote-yea me-2"></i>UnivEvent
    </a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav ms-auto">
        <li class="nav-item">
          <a class="nav-link active" href="{{ route('home') }}">
            <i class="fas fa-home me-1"></i>Accueil
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="{{ route('elections.index') }}">
            <i class="fas fa-poll me-1"></i>Élections
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="{{ route('candidatures.index') }}">
            <i class="fas fa-users me-1"></i>Candidatures
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="{{ route('votes.index') }}">
            <i class="fas fa-vote-yea me-1"></i>Votes
          </a>
        </li>
        @guest
          <li class="nav-item">
            <a class="nav-link" href="{{ route('login') }}">
              <i class="fas fa-sign-in-alt me-1"></i>Connexion
            </a>
          </li>
        @else
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown">
              <i class="fas fa-user me-1"></i>{{ Auth::user()->name }}
            </a>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="{{ route('dashboard') }}">
                <i class="fas fa-tachometer-alt me-1"></i>Tableau de bord
              </a></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item" href="{{ route('logout') }}">
                <i class="fas fa-sign-out-alt me-1"></i>Déconnexion
              </a></li>
            </ul>
          </li>
        @endguest
      </ul>
    </div>
  </div>
</nav>

<!-- CONTENU -->
<div class="container mt-4">
    @yield('content')
</div>

<!-- Bootstrap JS -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<!-- JS Select2 -->
<script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>


<!-- JS global -->
<script src="{{ asset('js/app.js') }}"></script>

<!-- scripts spécifiques poussés par les pages -->
@stack('scripts')

</body>
</html>
