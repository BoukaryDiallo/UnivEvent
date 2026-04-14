@extends('layouts.app')

@section('content')
<div class="container mt-5">
    <h2 class="text-center text-success mb-4">Créer une Élection</h2>

    @if($errors->any())
        <div class="alert alert-danger">
            <ul>
                @foreach($errors->all() as $error)
                   <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <form action="{{ route('elections.store') }}" method="POST" class="shadow p-4 bg-white rounded">
        @csrf

        <div class="mb-3">
            <label for="titre" class="form-label">Titre</label>
            <input type="text" class="form-control" id="titre" name="titre" placeholder="Titre de l'élection">
        </div>

        <div class="mb-3">
            <label for="description" class="form-label">Description</label>
            <textarea class="form-control" id="description" name="description" rows="3"></textarea>
        </div>

        <div class="mb-3">
            <label for="date_debut" class="form-label">Date de début</label>
            <input type="datetime-local" class="form-control" id="date_debut" name="date_debut">
        </div>

        <div class="mb-3">
            <label for="date_fin" class="form-label">Date de fin</label>
            <input type="datetime-local" class="form-control" id="date_fin" name="date_fin">
        </div>

        <div class="mb-3">
            <label class="form-label">Type d\'élection</label>
            <div>
                <div class="form-check form-check-inline">
                    <input class="form-check-input" type="radio" name="type" id="type_ufr" value="ufr" required>
                    <label class="form-check-label" for="type_ufr">UFR</label>
                </div>
                <div class="form-check form-check-inline">
                    <input class="form-check-input" type="radio" name="type" id="type_promotion" value="promotion" required>
                    <label class="form-check-label" for="type_promotion">Promotion</label>
                </div>
            </div>
        </div>

        <div id="ufr-group" style="display: none;" class="mb-3">
            <label for="id_ufr" class="form-label">UFR</label>
            <select class="form-select" id="id_ufr" name="id_ufr">
                <option value="">-- Sélectionner UFR --</option>
                @foreach($ufrs as $ufr)
                    <option value="{{ $ufr->id_ufr }}">{{ $ufr->nom }}</option>
                @endforeach
            </select>
        </div>

        <div id="promotion-group" style="display: none;" class="mb-3">
            <label for="id_filiere" class="form-label">Filière</label>
            <select class="form-select" id="id_filiere" name="id_filiere">
                <option value="">-- Sélectionner filière --</option>
                @foreach($filieres as $filiere)
                    <option value="{{ $filiere->id_filiere }}">{{ $filiere->nom }}</option>
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

        <div class="text-end">
            <button type="reset" class="btn btn-outline-success me-2">Annuler</button>
            <button type="submit" class="btn btn-success">Créer Élection</button>
        </div>
    </form>
</div>
@endsection
