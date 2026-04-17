@extends('layouts.app')

@section('content')
<div class="container">
    <h3 class="mb-4">Votes en direct</h3>

    <div class="row">
        @foreach($elections as $election)
            <div class="col-md-4 mb-3">
                <div class="card shadow-sm">
                    <div class="card-body">
                        <h5>{{ $election->titre }}</h5>
                        <p>Status: {{ $election->statut }}</p>

                        <a href="{{ route('votes.live.show', $election->id_election) }}"
                           class="btn btn-success w-100">
                            Voir le live
                        </a>
                    </div>
                </div>
            </div>
        @endforeach
    </div>
</div>
@endsection