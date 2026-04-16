@extends('layouts.app')

@section('content')
<div class="container mt-5">

    <h3 class="text-success mb-4">
        {{ $election->titre }}
    </h3>

    <a href="{{ route('votes.elections') }}" class="btn btn-secondary mb-4">
        ← Retour aux élections
    </a>

    <div class="row">

        @foreach($candidatures as $c)
            <div class="col-md-4 col-sm-6 mb-4">

                <div class="card h-100 shadow-sm border-0">

                    {{-- IMAGE PROFIL --}}
                    <div class="text-center p-3">
                        <img src="{{ $c->user->photo ?? 'https://via.placeholder.com/150' }}"
                             class="rounded-circle"
                             width="120"
                             height="120"
                             style="object-fit: cover;">
                    </div>

                    {{-- BODY --}}
                    <div class="card-body text-center">

                        <h5 class="fw-bold mb-2">
                            {{ $c->user->name }}
                        </h5>

                        <p class="text-muted small">
                            {{ Str::limit($c->programme ?? 'Programme non disponible', 80) }}
                        </p>

                    </div>

                    {{-- FOOTER ACTIONS --}}
                    <div class="card-footer bg-white border-0 d-flex justify-content-between">

                        <a href="{{ route('votes.candidat', $c) }}"
                           class="btn btn-outline-info btn-sm w-50 me-1">
                            Voir profil
                        </a>

                        <form method="POST" action="{{ route('votes.store') }}" class="w-50 ms-1">
                            @csrf
                            <input type="hidden" name="id_election" value="{{ $election->id_election }}">
                            <input type="hidden" name="id_candidature" value="{{ $c->id_candidature }}">

                            <button class="btn btn-success btn-sm w-100">
                                Voter
                            </button>
                        </form>

                    </div>

                </div>

            </div>
        @endforeach

    </div>

</div>
@endsection