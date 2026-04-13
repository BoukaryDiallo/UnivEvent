<head>
    <meta charset="UTF-8">
    <title>UnivEvent</title>

    <!-- Bootstrap CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
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
    <a class="navbar-brand" href="#">UnivEvent</a>
    <div class="collapse navbar-collapse">
      <ul class="navbar-nav ms-auto">
        <li class="nav-item"><a class="nav-link" href="/">Accueil</a></li>
        <li class="nav-item"><a class="nav-link" href="/events">Événements</a></li>
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
