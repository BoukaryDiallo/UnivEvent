@extends('layouts.app')

@section('content')
<div class="container mt-5">
    <h2 class="text-center text-success mb-4">Déposer une Candidature</h2>
    <form id="candidatureForm" class="shadow p-4 bg-white rounded">
        <div class="mb-3">
            <label for="nom" class="form-label">Nom Complet</label>
            <input type="text" class="form-control" id="nom" placeholder="Jean Kaboré">
        </div>
        <div class="mb-3">
            <label for="slogan" class="form-label">Slogan de Campagne</label>
            <input type="text" class="form-control" id="slogan" placeholder="Pour une promotion unie et dynamique!">
        </div>
        <div class="mb-3">
            <label for="description" class="form-label">Description</label>
            <textarea class="form-control" id="description" rows="3" placeholder="Présentez votre motivation..."></textarea>
        </div>
        <div class="mb-3">
            <label for="photo" class="form-label">Photo du candidat</label>
            <input type="file" class="form-control" id="photo" accept="image/*">
        </div>
        <div class="text-end">
            <button type="reset" class="btn btn-outline-success me-2">Annuler</button>
            <button type="submit" class="btn btn-success">Soumettre Candidature</button>
        </div>
    </form>
</div>
@endsection

@push('styles')
<link rel="stylesheet" href="{{ asset('css/candidature.css') }}">
@endpush

@push('scripts')
<script src="{{ asset('js/candidature.js') }}"></script>
@endpush
