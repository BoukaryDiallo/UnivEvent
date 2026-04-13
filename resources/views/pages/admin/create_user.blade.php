@extends('layouts.app')

@section('content')
<div class="container mt-5">
    <h2 class="text-center text-success mb-4">Créer un Utilisateur</h2>
    <form id="createUserForm" class="shadow p-4 bg-white rounded">
        <div class="mb-3">
            <label for="name" class="form-label">Nom complet</label>
            <input type="text" class="form-control" id="name" placeholder="Ex: Jean Kaboré">
        </div>
        <div class="mb-3">
            <label for="email" class="form-label">Adresse email</label>
            <input type="email" class="form-control" id="email" placeholder="exemple@univ-event.bf">
        </div>
        <div class="mb-3">
            <label for="role" class="form-label">Rôle</label>
            <select class="form-select" id="role">
                <option value="etudiant">Étudiant</option>
                <option value="candidat">Candidat</option>
                <option value="admin">Admin</option>
            </select>
        </div>
        <div class="mb-3">
            <label for="password" class="form-label">Mot de passe</label>
            <input type="password" class="form-control" id="password" placeholder="********">
        </div>
        <div class="text-end">
            <button type="reset" class="btn btn-outline-success me-2">Annuler</button>
            <button type="submit" class="btn btn-success">Créer Utilisateur</button>
        </div>
    </form>
</div>
@endsection

@push('styles')
<link rel="stylesheet" href="{{ asset('css/user.css') }}">
@endpush

@push('scripts')
<script src="{{ asset('js/user.js') }}"></script>
@endpush
