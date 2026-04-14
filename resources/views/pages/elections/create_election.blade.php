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
            <label for="id_circonscription" class="form-label">Circonscription</label>
            <select class="form-select" id="id_circonscription" name="id_circonscription">
                <option value="">-- Sélectionner une circonscription --</option>
                @foreach($circonscriptions as $c)
                    <option value="{{ $c->id_circonscription }}">{{ $c->nom }}</option>
                @endforeach
            </select>
        </div>

        <div class="text-end">
            <button type="reset" class="btn btn-outline-success me-2">Annuler</button>
            <button type="submit" class="btn btn-success">Créer Élection</button>
        </div>
    </form>
</div>
@endsection
