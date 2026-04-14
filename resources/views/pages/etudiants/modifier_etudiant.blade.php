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
            <label for="filiere" class="form-label">Filière</label>
            <input type="text" class="form-control" id="filiere" name="filiere" value="{{ $etudiant->filiere }}">
        </div>

        <!-- Niveau -->
        <div class="mb-3">
            <label for="niveau" class="form-label">Niveau</label>
            <select class="form-select" id="niveau" name="niveau">
                <option value="Licence 1" {{ $etudiant->niveau == 'Licence 1' ? 'selected' : '' }}>Licence 1</option>
                <option value="Licence 2" {{ $etudiant->niveau == 'Licence 2' ? 'selected' : '' }}>Licence 2</option>
                <option value="Licence 3" {{ $etudiant->niveau == 'Licence 3' ? 'selected' : '' }}>Licence 3</option>
                <option value="Master 1" {{ $etudiant->niveau == 'Master 1' ? 'selected' : '' }}>Master 1</option>
                <option value="Master 2" {{ $etudiant->niveau == 'Master 2' ? 'selected' : '' }}>Master 2</option>
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
