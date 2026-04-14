@extends('layouts.app')

@section('content')
<div class="container mt-5">
    <h2 class="text-center text-success mb-4">Détails du Vote</h2>

    <div class="card shadow p-4">
        <ul class="list-group list-group-flush">
            <li class="list-group-item"><strong>Électeur :</strong> {{ $vote->user->name }}</li>
            <li class="list-group-item"><strong>Élection :</strong> {{ $vote->election->titre }}</li>
            <li class="list-group-item"><strong>Candidat choisi :</strong> {{ $vote->candidature->user->name }}</li>
            <li class="list-group-item"><strong>Date du vote :</strong> {{ $vote->date_vote }}</li>
        </ul>

        <div class="mt-4 d-flex justify-content-end">
            <a href="{{ route('votes.index') }}" class="btn btn-secondary">Retour à la liste</a>
        </div>
    </div>
</div>
@endsection
