@extends('layouts.app')

@section('content')
<div class="container mt-4">

    <div class="card shadow-sm">
        <div class="card-header bg-success text-white">
            <h5>Votes en Direct</h5>
        </div>

        <div class="card-body">

            <h6>{{ $election->title }} - {{ $election->promotion }}</h6>

            <p>
                Statut :
                <span class="badge bg-primary">{{ $election->status }}</span>
            </p>

            {{-- PROGRESSION --}}
            <div class="progress mb-3">
                <div class="progress-bar bg-success"
                     style="width: {{ $election->progress }}%">
                    {{ $election->progress }}%
                </div>
            </div>

            <p>
                {{ $election->votes_count }} votes / {{ $election->total_voters }} électeurs
            </p>

            <hr>

            {{-- CANDIDATS --}}
            <h6>Votes en cours</h6>

            @foreach($candidates as $candidate)
                <div class="mb-3">

                    <div class="d-flex align-items-center">
                        <img src="{{ asset('storage/' . $candidate->photo) }}"
                             class="rounded-circle me-2"
                             width="40" height="40">

                        <div class="flex-grow-1">
                            <strong>{{ $candidate->name }}</strong>
                            <small class="text-muted d-block">
                                {{ $candidate->slogan }}
                            </small>

                            <div class="progress mt-1">
                                <div class="progress-bar bg-success"
                                     style="width: {{ $candidate->vote_percentage }}%">
                                    {{ $candidate->votes }} votes
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            @endforeach

            <hr>

            {{-- ACTIONS --}}
            <div class="d-grid gap-2">

                @if($election->status == 'ouverte')
                    <form method="POST"
                          action="{{ route('elections.cloturer', $election->id_election) }}">
                        @csrf
                        <button class="btn btn-danger w-100">
                            Clôturer le vote
                        </button>
                    </form>

                @elseif($election->status == 'cloturee')
                    <a href="{{ route('depouillement.depouiller', $election->id_election) }}"
                       class="btn btn-success w-100">
                        Lancer le dépouillement
                    </a>
                @endif

            </div>

        </div>
    </div>

</div>
@endsection