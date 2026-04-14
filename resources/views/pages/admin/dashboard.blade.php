@extends('layouts.app')

@section('content')
<div class="container mt-5">

    <!-- TITRE -->
    <h2 class="text-center text-success mb-4">
        📊 Résultats en temps réel - {{ $election->titre }}
    </h2>

    <!-- CARDS STATS -->
    <div class="row mb-4">

        <div class="col-md-4">
            <div class="card shadow border-success">
                <div class="card-body text-center">
                    <h5>Total votes</h5>
                    <h2 class="text-success">{{ $totalVotes }}</h2>
                </div>
            </div>
        </div>

        <div class="col-md-4">
            <div class="card shadow border-success">
                <div class="card-body text-center">
                    <h5>Tour actuel</h5>
                    <h2 class="text-success">{{ $election->tour }}</h2>
                </div>
            </div>
        </div>

        <div class="col-md-4">
            <div class="card shadow border-success">
                <div class="card-body text-center">
                    <h5>Statut</h5>
                    <h2 class="text-success">{{ $election->statut }}</h2>
                </div>
            </div>
        </div>

    </div>

    <!-- GRAPHIQUE -->
    <div class="card shadow mb-4">
        <div class="card-body">
            <canvas id="resultatsChart" height="100"></canvas>
        </div>
    </div>

    <!-- DETAILS CANDIDATS -->
    <div class="card shadow">
        <div class="card-header bg-success text-white">
            🧑‍💼 Détails des candidats
        </div>

        <div class="card-body">

            @foreach($resultats as $r)

                <div class="mb-4">

                    <div class="d-flex justify-content-between align-items-center">

                        <div class="d-flex align-items-center">

                            <img src="{{ asset('storage/'.$r->candidat->photo) }}"
                                 class="rounded-circle me-3"
                                 width="50" height="50">

                            <div>
                                <h6 class="mb-0">
                                    {{ $r->candidat->user->name }}
                                </h6>

                                <small class="text-muted">
                                    Statut : {{ $r->statut }}
                                </small>
                            </div>

                        </div>

                        <div>
                            <strong>{{ $r->nb_voix }} votes</strong>
                            <span class="text-success">
                                ({{ $r->pourcentage }}%)
                            </span>
                        </div>

                    </div>

                    <!-- BARRE PROGRESSION -->
                    <div class="progress mt-2" style="height: 20px;">
                        <div class="progress-bar bg-success"
                             style="width: {{ $r->pourcentage }}%">
                            {{ $r->pourcentage }}%
                        </div>
                    </div>

                </div>

            @endforeach

        </div>
    </div>

</div>
@endsection

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<script>
    window.labels = @json($resultats->pluck('candidat.user.name'));
    window.data = @json($resultats->pluck('nb_voix'));
</script>

<script src="{{ asset('js/resultats.js') }}"></script>
@endpush