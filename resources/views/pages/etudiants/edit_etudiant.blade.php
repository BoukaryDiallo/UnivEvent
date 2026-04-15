@extends('layouts.app')

@section('content')
<div class="container mt-5">

    <h2 class="text-center text-success mb-4 fw-bold">
        Modifier un Étudiant
    </h2>

    @if($errors->any())
        <div class="alert alert-danger">
            <ul class="mb-0">
                @foreach($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <form action="{{ route('etudiants.update', $etudiant) }}"
          method="POST"
          enctype="multipart/form-data"
          class="shadow p-4 bg-white rounded">

        @csrf
        @method('PUT')

        <!-- NOM -->
        <div class="mb-3">
            <label class="form-label">Nom</label>
            <input type="text"
                   class="form-control"
                   name="name"
                   value="{{ old('name', $etudiant->user->name) }}">
        </div>

        <!-- INE -->
        <div class="mb-3">
            <label class="form-label">INE</label>
            <input type="text"
                   class="form-control"
                   value="{{ $etudiant->INE }}"
                   readonly>
        </div>

        <!-- FILIERE -->
        <div class="mb-3">
            <label class="form-label">Filière</label>
            <select class="form-select" name="id_filiere">
                <option value="">-- Choisir --</option>
                @foreach($filieres as $f)
                    <option value="{{ $f->id_filiere }}"
                        {{ $etudiant->id_filiere == $f->id_filiere ? 'selected' : '' }}>
                        {{ $f->nom }}
                    </option>
                @endforeach
            </select>
        </div>

        <!-- NIVEAU -->
        <div class="mb-3">
            <label class="form-label">Niveau</label>
            <select class="form-select" name="niveau">
                @foreach($niveaux as $value => $label)
                    <option value="{{ $value }}"
                        {{ $etudiant->getRawOriginal('niveau') === $value ? 'selected' : '' }}>
                        {{ $label }}
                    </option>
                @endforeach
            </select>
        </div>

        <!-- DATE -->
        <div class="mb-3">
            <label class="form-label">Date de naissance</label>
            <input type="date"
                   class="form-control"
                   name="date_naissance"
                   value="{{ $etudiant->date_naissance }}">
        </div>

        <!-- PHOTO -->
        <div class="mb-3">
            <label class="form-label">Photo</label>

            @if($etudiant->photo)
                <div class="mb-2">
                    <img src="{{ asset('storage/'.$etudiant->photo) }}"
                         width="80"
                         class="rounded">
                </div>
            @endif

            <input type="file"
                   class="form-control"
                   name="photo">
        </div>

        <div class="text-end">
            <button class="btn btn-success">
                Mettre à jour
            </button>
        </div>

    </form>

</div>
@endsection