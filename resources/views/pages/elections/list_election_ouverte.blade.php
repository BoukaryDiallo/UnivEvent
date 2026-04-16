@extends('layouts.app')

@section('content')
<div class="container mt-5">

    <h3 class="text-success mb-4">Élections ouvertes</h3>

    @if($elections->isEmpty())
        <div class="alert alert-info">
            Aucune élection disponible pour le moment.
        </div>
    @endif

    @foreach($elections as $election)
        <div class="card mb-3 shadow-sm p-3">

            <h5>{{ $election->titre }}</h5>
            <p class="text-muted">{{ $election->description }}</p>

            <a href="{{ route('votes.candidats', $election) }}"
               class="btn btn-success">
                Participer
            </a>

        </div>
    @endforeach

</div>
@endsection