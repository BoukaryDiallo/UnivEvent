@extends('layouts.app')

@section('content')
<div class="container mt-5">
    <h2 class="text-center text-success mb-4">Liste des Candidats</h2>
    <div class="row" id="candidatsList">
        <!-- Exemple de carte -->
        <div class="col-md-4 mb-4">
            <div class="card candidat-card shadow-sm">
                <img src="{{ asset('images/candidat_homme.png') }}" class="card-img-top" alt="Candidat homme">
                <div class="card-body text-center">
                    <h5 class="card-title">Jean Kaboré</h5>
                    <p class="card-text">Pour une promotion unie et dynamique!</p>
                    <a href="{{ route('detail.candidature') }}" class="btn btn-success">Voir le programme</a>

                </div>
            </div>
        </div>

        <!-- Exemple de carte -->
        <div class="col-md-4 mb-4">
            <div class="card candidat-card shadow-sm">
                <img src="{{ asset('images/candidat_femme.png') }}" class="card-img-top" alt="Candidat femme">
                <div class="card-body text-center">
                    <h5 class="card-title">Amina Traoré</h5>
                    <p class="card-text">Ensemble pour la réussite!</p>
                    <a href="{{ route('detail.candidature') }}" class="btn btn-success">Voir le programme</a>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('styles')
<link rel="stylesheet" href="{{ asset('css/candidature.css') }}">
@endpush

@push('scripts')
<script src="{{ asset('js/candidature.js') }}"></script>
@endpush
