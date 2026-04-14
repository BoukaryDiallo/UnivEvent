@extends('layouts.app')

@section('content')
<div class="container mt-5">
    <h2 class="text-center text-success mb-4">Modifier une Élection</h2>

    @if($errors->any())
        <div class="alert alert-danger">
            <ul>
                @foreach($errors->all() as $error)
                   <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <form action="{{ route('elections.update', $election->id_election) }}" method="POST" class="shadow p-4 bg-white rounded">
        @csrf
        @method('PUT')

        <div class="mb-3">
            <label for="titre" class="form-label">Titre</label>
            <input type="text" class="form-control" id="titre" name="titre" value="{{ $election->titre }}">
        </div>

        <div class="mb-3">
            <label for="description" class="form-label">Description</label>
            <textarea class="form-control" id="description" name="description" rows="3">{{ $election->description }}</textarea>
        </div>

        <div class="mb-3">
            <label for="date_debut" class="form-label">Date de début</label>
            <input type="datetime-local" class="form-control" id="date_debut" name="date_debut" value="{{ \Carbon\Carbon::parse($election->date_debut)->format('Y-m-d\TH:i') }}">
        </div>

        <div class="mb-3">
            <label for="date_fin" class="form-label">Date de fin</label>
            <input type="datetime-local" class="form-control" id="date_fin" name="date_fin" value="{{ \Carbon\Carbon::parse($election->date_fin)->format('Y-m-d\TH:i') }}">
        </div>

        <div class="mb-3">
            <label class="form-label">Type d\'élection</label>
            <div>
                <div class="form-check form-check-inline">
                    <input class="form-check-input" type="radio" name="type" id="type_ufr" value="ufr" {{ $election->type == 'ufr' ? 'checked' : '' }} required>
                    <label class="form-check-label" for="type_ufr">UFR</label>
                </div>
                <div class="form-check form-check-inline">
                    <input class="form-check-input" type="radio" name="type" id="type_promotion" value="promotion" {{ $election->type == 'promotion' ? 'checked' : '' }} required>
                    <label class="form-check-label" for="type_promotion">Promotion</label>
                </div>
            </div>
        </div>

        <div id="ufr-group" style="{{ $election->type == 'ufr' ? 'display: block;' : 'display: none;' }}" class="mb-3">
            <label for="id_ufr" class="form-label">UFR</label>
            <select class="form-select" id="id_ufr" name="id_ufr">
                <option value="">-- Sélectionner UFR --</option>
                @foreach($ufrs as $ufr)
                    <option value="{{ $ufr->id_ufr }}" {{ $election->id_ufr == $ufr->id_ufr ? 'selected' : '' }}>{{ $ufr->nom }}</option>
                @endforeach
            </select>
        </div>

        <div id="promotion-group" style="{{ $election->type == 'promotion' ? 'display: block;' : 'display: none;' }}" class="mb-3">
            <label for="id_filiere" class="form-label">Filière</label>
            <select class="form-select" id="id_filiere" name="id_filiere">
                <option value="">-- Sélectionner filière --</option>
                @foreach($filieres as $filiere)
                    <option value="{{ $filiere->id_filiere }}" {{ $election->id_filiere == $filiere->id_filiere ? 'selected' : '' }}>{{ $filiere->nom }}</option>
                @endforeach
            </select>
        </div>

        <script>
            document.querySelectorAll('input[name="type"]').forEach(radio => {
                radio.addEventListener('change', function() {
                    document.getElementById('ufr-group').style.display = this.value === 'ufr' ? 'block' : 'none';
                    document.getElementById('promotion-group').style.display = this.value === 'promotion' ? 'block' : 'none';
                });
            });
        </script>

        <div class="mb-3">
            <label for="statut" class="form-label">Statut</label>
            <select class="form-select" id="statut" name="statut">
                <option value="ouverte" {{ $election->statut == 'ouverte' ? 'selected' : '' }}>Ouverte</option>
                <option value="fermee" {{ $election->statut == 'fermee' ? 'selected' : '' }}>Fermée</option>
            </select>
        </div>

        <div class="text-end">
            <button type="submit" class="btn btn-success">Mettre à jour</button>
        </div>
    </form>
</div>
@endsection
