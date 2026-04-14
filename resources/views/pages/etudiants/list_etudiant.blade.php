@extends('layouts.app')

@section('content')
<div class="container mt-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="text-success">Liste des Étudiants</h2>
        <a href="{{ route('admin.create.etudiant') }}" class="btn btn-success">+ Ajouter un étudiant</a>
    </div>

    <!-- Barre de recherche et tri -->
    <div class="row mb-3">
        <div class="col-md-6">
            <input type="text" id="searchInput" class="form-control" placeholder="Rechercher par nom ou INE...">
        </div>
        <div class="col-md-6">
            <select id="sortSelect" class="form-select">
                <option value="">Trier par...</option>
                <option value="nom">Nom</option>
                <option value="filiere">Filière</option>
                <option value="niveau">Niveau</option>
                <option value="date_naissance">Date de naissance</option>
            </select>
        </div>
    </div>

    <!-- Tableau -->
    <table class="table table-bordered shadow" id="etudiantsTable">
        <thead class="table-success">
            <tr>
                <th>INE</th>
                <th>Nom</th>
                <th>UFR</th>
                <th>Département</th>
                <th>Filière</th>
                <th>Niveau</th>
                <th>Date de naissance</th>
                <th>Photo</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            @foreach($etudiants as $etudiant)
            <tr>
                <td>{{ $etudiant->INE }}</td>
                <td>{{ $etudiant->user->name }}</td>
                <td>{{ $etudiant->ufr }}</td>
                <td>{{ $etudiant->departement }}</td>
                <td>{{ $etudiant->filiere }}</td>
                <td>{{ $etudiant->niveau }}</td>
                <td>{{ $etudiant->date_naissance }}</td>
                <td>
                    @if($etudiant->photo)
                        <img src="{{ asset('storage/'.$etudiant->photo) }}" width="50">
                    @endif
                </td>
                <td>
                    <a href="{{ route('admin.modifier.etudiant', $etudiant->id) }}" class="btn btn-warning btn-sm">Modifier</a>
                    <form action="{{ route('admin.delete.etudiant', $etudiant->id) }}" method="POST" style="display:inline;">
                        @csrf @method('DELETE')
                        <button class="btn btn-danger btn-sm" onclick="return confirm('Supprimer cet étudiant ?')">Supprimer</button>
                    </form>
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>
</div>
@endsection

@push('styles')
<link rel="stylesheet" href="{{ asset('css/etudiants.css') }}">
@endpush

@push('scripts')
<script src="{{ asset('js/etudiants.js') }}"></script>
@endpush
