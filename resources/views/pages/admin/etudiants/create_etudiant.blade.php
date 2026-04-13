@extends('layouts.app')

@section('content')
<div class="container mt-5">
    <h2 class="text-center text-success mb-4">Créer un Étudiant</h2>

    <!-- Message de succès ou d'erreur -->
    @if(session('success'))
        <div class="alert alert-success">{{ session('success') }}</div>
    @endif
    @if($errors->any())
        <div class="alert alert-danger">
            <ul>
                @foreach($errors->all() as $error)
                   <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <!-- Formulaire relié au contrôleur -->
    <form action="{{ route('admin.post_create.etudiant') }}" method="POST" enctype="multipart/form-data" class="shadow p-4 bg-white rounded">
        @csrf

        <!-- Champ Nom (select avec recherche) -->
        <div class="mb-3">
            <label for="user_id" class="form-label">Nom de l'utilisateur</label>
            <select class="form-select" id="user_id" name="id_user">
                <option value="">-- Sélectionner un utilisateur --</option>
                @foreach($users as $user)
                    <option value="{{ $user->id }}">{{ $user->name }} ({{ $user->email }})</option>
                @endforeach
            </select>
        </div>

        <div class="mb-3">
            <label for="ine" class="form-label">INE</label>
            <input type="text" class="form-control" id="ine" name="INE" placeholder="Ex: 2026INE123">
        </div>
        <div class="mb-3">
            <label for="filiere" class="form-label">Filière</label>
            <input type="text" class="form-control" id="filiere" name="filiere" placeholder="Informatique">
        </div>
        <div class="mb-3">
            <label for="niveau" class="form-label">Niveau</label>
            <select class="form-select" id="niveau" name="niveau">
                <option value="Licence 1">Licence 1</option>
                <option value="Licence 2">Licence 2</option>
                <option value="Licence 3">Licence 3</option>
                <option value="Master 1">Master 1</option>
                <option value="Master 2">Master 2</option>
            </select>
        </div>
        <div class="mb-3">
            <label for="date_naissance" class="form-label">Date de naissance</label>
            <input type="date" class="form-control" id="date_naissance" name="date_naissance">
        </div>
        <div class="mb-3">
            <label for="photo" class="form-label">Photo</label>
            <input type="file" class="form-control" id="photo" name="photo" accept="image/*">
        </div>
        <div class="text-end">
            <button type="reset" class="btn btn-outline-success me-2">Annuler</button>
            <button type="submit" class="btn btn-success">Créer Étudiant</button>
        </div>
    </form>
</div>
@endsection

@push('styles')
<link rel="stylesheet" href="{{ asset('css/etudiant.css') }}">
@endpush

@push('scripts')
<script src="{{ asset('js/etudiant.js') }}"></script>
@endpush
