@extends('layouts.app')

@section('content')
<div class="container mt-5">
    <h2 class="text-center text-success mb-4">Créer une Élection</h2>
    <form id="createElectionForm" class="shadow p-4 bg-white rounded">
        <div class="mb-3">
            <label for="titre" class="form-label">Titre de l'Élection</label>
            <input type="text" class="form-control" id="titre" placeholder="Élection Délégué 2026">
        </div>
        <div class="mb-3">
            <label for="description" class="form-label">Description</label>
            <textarea class="form-control" id="description" rows="3" placeholder="Décrivez l'élection..."></textarea>
        </div>
        <div class="row">
            <div class="col-md-6 mb-3">
                <label for="dateDebut" class="form-label">Date de Début</label>
                <input type="date" class="form-control" id="dateDebut">
            </div>
            <div class="col-md-6 mb-3">
                <label for="dateFin" class="form-label">Date de Fin</label>
                <input type="date" class="form-control" id="dateFin">
            </div>
        </div>
        <div class="mb-3">
            <label for="departement" class="form-label">Département</label>
            <select class="form-select" id="departement">
                <option selected>Sciences Exacts et Appliquées</option>
                <option>Sciences Informatiques appliquées</option>
                <option>Lettre moderne</option>
            </select>
        </div>
        <div class="mb-3">
            <label for="filiere" class="form-label">Filière</label>
            <select class="form-select" id="departement">
                <option selected>MPCI</option>
                <option>Sciences Informatiques appliquées</option>
                <option>Lettre moderne</option>
            </select>
        </div>
        <div class="mb-3">
            <label for="promotion" class="form-label">Promotion</label>
            <select class="form-select" id="promotion">
                <option selected>Licence Informatique 3</option>
                <option>Master Informatique 1</option>
                <option>Master Informatique 2</option>
            </select>
        </div>
        <div class="text-end">
            <button type="reset" class="btn btn-outline-success me-2">Annuler</button>
            <button type="submit" class="btn btn-success">Créer Élection</button>
        </div>
    </form>
</div>
@endsection

@push('styles')
<link rel="stylesheet" href="{{ asset('css/election.css') }}">
@endpush

@push('scripts')
<script src="{{ asset('js/election.js') }}"></script>
@endpush
