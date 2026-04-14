@extends('layouts.app')

@section('content')
<div class="container mt-5">
    <h2 class="text-center text-success mb-4">Modifier un Étudiant</h2>

    <!-- Messages -->
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

    <form action="{{ route('admin.post_modifier.etudiant', $etudiant->id) }}" method="POST" enctype="multipart/form-data" class="shadow p-4 bg-white rounded">
        @csrf

        <!-- Nom et prénom (User) -->
        <div class="mb-3">
            <label for="name" class="form-label">Nom</label>
            <input type="text" class="form-control" id="name" name="name" value="{{ $etudiant->user->name }}">
        </div>
        <div class="mb-3">
            <label for="prenom" class="form-label">Prénom</label>
            <input type="text" class="form-control" id="prenom" name="prenom" value="{{ $etudiant->user->prenom ?? '' }}">
        </div>

        <!-- INE (readonly) -->
        <div class="mb-3">
            <label for="ine" class="form-label">INE</label>
            <input type="text" class="form-control" id="ine" name="INE" value="{{ $etudiant->INE }}" readonly>
        </div>

        <!-- Filière -->
        <div class="mb-3">
            <label for="id_filiere" class="form-label">Filière</label>
            <select class="form-select" id="id_filiere" name="id_filiere">
                <option value="">-- Sélectionner une filière --</option>
                @foreach($filieres as $f)
                    <option value="{{ $f->id_filiere }}" {{ $etudiant->id_filiere == $f->id_filiere ? 'selected' : '' }}>{{ $f->nom }}</option>
                @endforeach
            </select>
        </div>

        <!-- Niveau -->
        <div class="mb-3">
            <label for="niveau" class="form-label">Niveau</label>
            <select class="form-select" id="niveau" name="niveau">
                @foreach($niveaux as $value => $label)
                    <option value="{{ $value }}" {{ $etudiant->niveau === $value ? 'selected' : '' }}>{{ $label }}</option>
                @endforeach
            </select>
        </div>

        <!-- Date de naissance -->
        <div class="mb-3">
            <label for="date_naissance" class="form-label">Date de naissance</label>
            <input type="date" class="form-control" id="date_naissance" name="date_naissance" value="{{ $etudiant->date_naissance }}">
        </div>

        <!-- Photo -->
        <div class="mb-3">
            <label for="photo" class="form-label">Photo</label>
            @if($etudiant->photo)
                <div class="mb-2">
                    <img src="{{ asset('storage/'.$etudiant->photo) }}" width="80">
                </div>
            @endif
            <input type="file" class="form-control" id="photo" name="photo" accept="image/*">
        </div>

        <div class="text-end">
            <button type="submit" class="btn btn-success">Mettre à jour</button>
        </div>
    </form>
</div>
@endsection
