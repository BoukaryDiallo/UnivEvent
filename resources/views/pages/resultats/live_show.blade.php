@extends('layouts.app')

@section('content')
<div class="container mt-4">

    <h3 class="mb-2">
        Live — {{ $election->title }}
    </h3>

    <p class="text-muted mb-4">
        Statut : {{ $election->status }}
    </p>

    <!-- Résumé global -->
    <div class="row mb-4">
        <div class="col-md-4">
            <div class="card shadow-sm">
                <div class="card-body text-center">
                    <h6>Total votes</h6>
                    <h3 class="text-primary">{{ $election->votes_count }}</h3>
                </div>
            </div>
        </div>

        <div class="col-md-4">
            <div class="card shadow-sm">
                <div class="card-body text-center">
                    <h6>Électeurs</h6>
                    <h3 class="text-dark">{{ $election->total_voters }}</h3>
                </div>
            </div>
        </div>

        <div class="col-md-4">
            <div class="card shadow-sm">
                <div class="card-body text-center">
                    <h6>Taux participation</h6>
                    <h3 class="text-success">{{ $election->progress }}%</h3>
                </div>
            </div>
        </div>
    </div>

    <!-- CANDIDATS -->
    <div class="row">
        @foreach($candidates as $cand)
            <div class="col-md-6 mb-4">

                <div class="card shadow-sm h-100">

                    <div class="card-body">

                        <!-- Header candidat -->
                        <div class="d-flex align-items-center mb-3">

                            <!-- Photo -->
                            <img src="{{ $cand->photo ? asset('storage/' . $cand->photo) : 'https://via.placeholder.com/80' }}"
                                 class="rounded-circle me-3"
                                 width="70"
                                 height="70"
                                 style="object-fit: cover;">

                            <div>
                                <h5 class="mb-0">{{ $cand->name }}</h5>
                                <small class="text-muted">{{ $cand->slogan }}</small>
                            </div>

                        </div>

                        <!-- Votes -->
                        <div class="d-flex justify-content-between mb-1">
                            <span>Votes</span>
                            <strong>{{ $cand->votes }}</strong>
                        </div>

                        <!-- Progress bar -->
                        <div class="progress" style="height: 18px;">
                            <div class="progress-bar bg-success"
                                 role="progressbar"
                                 style="width: {{ $cand->percent }}%;"
                                 aria-valuenow="{{ $cand->percent }}"
                                 aria-valuemin="0"
                                 aria-valuemax="100">

                                {{ $cand->percent }}%
                            </div>
                        </div>

                    </div>

                </div>

            </div>
        @endforeach
    </div>

</div>
@endsection