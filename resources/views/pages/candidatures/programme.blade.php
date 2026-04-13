@extends('layouts.app')

@section('content')
<div class="container mt-5">
    <h2 class="text-center text-success mb-4">Programme du Candidat</h2>
    <div class="card shadow candidat-programme">
        <div class="row g-0">
            <div class="col-md-4">
                <img src="{{ asset('images/candidat_homme.png') }}" class="img-fluid rounded-start" alt="Photo candidat">
            </div>
            <div class="col-md-8">
                <div class="card-body">
                    <h4 class="card-title text-success">Jean Kaboré</h4>
                    <p class="card-text"><strong>Slogan :</strong> Pour une promotion unie et dynamique!</p>
                    <p class="card-text">Je m’engage à défendre vos intérêts, améliorer la communication entre étudiants et administration, et organiser des activités pour renforcer la cohésion.</p>
                    <a href="/vote" class="btn btn-success mt-3">Voter pour ce candidat</a>
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
