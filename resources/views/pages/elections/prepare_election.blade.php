@extends('layouts.app')

@section('content')
<div class="container mt-5">

    <div class="card shadow p-4">

        {{-- ALERTS --}}
        @if(session('success'))
            <div class="alert alert-success">
                {{ session('success') }}
            </div>
        @endif

        @if(session('error'))
            <div class="alert alert-danger">
                {{ session('error') }}
            </div>
        @endif

        {{-- HEADER --}}
        <h4 class="text-success mb-2">
            {{ $election->titre }}
        </h4>

        <p class="text-muted">
            {{ $election->description }}
        </p>

        <hr>

        <p>
            <strong>Statut :</strong>
            <span class="badge bg-warning text-dark">
                {{ $election->statut }}
            </span>
        </p>

        {{-- ================= BROUILLON ================= --}}
        @if($election->statut === 'brouillon')

            <div class="alert alert-info">
                Configuration de la liste électorale requise.
            </div>

            <a href="{{ route('elections.genererListe.form', $election) }}"
               class="btn btn-success">
                Configurer la liste électorale
            </a>

        {{-- ================= LISTE GÉNÉRÉE ================= --}}
        @elseif($election->statut === 'liste_generee')

            <div class="alert alert-success">
                Liste électorale générée ✔
            </div>

            <a href="{{ route('elections.ouvrir', $election) }}"
               class="btn btn-primary">
                Ouvrir le vote
            </a>

            <a href="{{ route('elections.cloturer', $election) }}"
               class="btn btn-dark ms-2">
                Clôturer l’élection
            </a>

        {{-- ================= VOTE OUVERT ================= --}}
        @elseif($election->statut === 'ouverte')

            <div class="alert alert-primary">
                Le vote est en cours.
            </div>

            <a href="{{ route('depouillement.depouiller', $election) }}"
            class="btn btn-danger">
                Lancer le dépouillement
            </a>

            <a href="{{ route('elections.cloturer', $election) }}"
               class="btn btn-dark ms-2">
                Clôturer l’élection
            </a>

        {{-- ================= SECOND TOUR ================= --}}
        @elseif($election->statut === 'second_tour')

            <div class="alert alert-warning">
                Second tour en cours.
            </div>

            <a href="{{ route('depouillement.depouiller', $election) }}"
            class="btn btn-danger">
                Lancer le dépouillement
            </a>

            <a href="{{ route('elections.cloturer', $election) }}"
               class="btn btn-dark ms-2">
                Clôturer l’élection
            </a>

        {{-- ================= TERMINÉE ================= --}}
        @elseif($election->statut === 'terminee')

            <div class="alert alert-dark">
                Cette élection est terminée.
            </div>

        @endif

    </div>
</div>
@endsection