@extends('layouts.app')

@section('content')
<div class="container mt-5">

    <h2 class="text-center text-success mb-4">Créer un Étudiant</h2>

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

    <form action="{{ route('etudiants.store') }}" method="POST" enctype="multipart/form-data"
          class="shadow p-4 bg-white rounded">
        @csrf

        {{-- USER --}}
        <div class="mb-3">
            <label class="form-label">Utilisateur</label>
            <select class="form-select" name="id_user" required>
                <option value="">-- Sélectionner un utilisateur --</option>
                @foreach($users as $user)
                    <option value="{{ $user->id }}"
                        {{ old('id_user') == $user->id ? 'selected' : '' }}>
                        {{ $user->name }} ({{ $user->email }})
                    </option>
                @endforeach
            </select>
        </div>

        {{-- INE --}}
        <div class="mb-3">
            <label class="form-label">INE</label>
            <input type="text"
                   class="form-control"
                   name="INE"
                   value="{{ old('INE') }}"
                   placeholder="Ex: 2026INE123"
                   required>
        </div>

        {{-- UFR --}}
        <div class="mb-3">
            <label class="form-label">UFR</label>
            <select class="form-select" id="ufr" name="id_ufr" required>
                <option value="">-- Sélectionner un UFR --</option>
                @foreach($ufrs as $u)
                    <option value="{{ $u->id_ufr }}"
                        {{ old('id_ufr') == $u->id_ufr ? 'selected' : '' }}>
                        {{ $u->nom }}
                    </option>
                @endforeach
            </select>
        </div>

        {{-- DEPARTEMENT --}}
        <div class="mb-3">
            <label class="form-label">Département</label>
            <select class="form-select" id="departement" name="id_departement" required>
                <option value="">-- Sélectionner un département --</option>
                @foreach($departements as $d)
                    <option value="{{ $d->id_departement }}"
                        {{ old('id_departement') == $d->id_departement ? 'selected' : '' }}>
                        {{ $d->nom }}
                    </option>
                @endforeach
            </select>
        </div>

        {{-- FILIERE --}}
        <div class="mb-3">
            <label class="form-label">Filière</label>
            <select class="form-select" name="id_filiere" required>
                <option value="">-- Sélectionner une filière --</option>
                @foreach($filieres as $f)
                    <option value="{{ $f->id_filiere }}"
                        {{ old('id_filiere') == $f->id_filiere ? 'selected' : '' }}>
                        {{ $f->nom }}
                    </option>
                @endforeach
            </select>
        </div>

        {{-- NIVEAU --}}
        <div class="mb-3">
            <label class="form-label">Niveau</label>
            <select class="form-select" name="niveau" required>
                @foreach($niveaux as $value => $label)
                    <option value="{{ $value }}"
                        {{ old('niveau') == $value ? 'selected' : '' }}>
                        {{ $label }}
                    </option>
                @endforeach
            </select>
        </div>

        {{-- DATE --}}
        <div class="mb-3">
            <label class="form-label">Date de naissance</label>
            <input type="date"
                   class="form-control"
                   name="date_naissance"
                   value="{{ old('date_naissance') }}">
        </div>

        {{-- PHOTO --}}
        <div class="mb-3">
            <label class="form-label">Photo</label>
            <input type="file" class="form-control" name="photo" accept="image/*">
        </div>

        {{-- ACTIONS --}}
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