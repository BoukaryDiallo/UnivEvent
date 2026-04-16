@extends('layouts.app')

@section('content')
<div class="container mt-5">
    <h2 class="text-center text-success mb-4">Créer une Élection</h2>

    @if($errors->any())
        <div class="alert alert-danger">
            <ul class="mb-0">
                @foreach($errors->all() as $error)
                   <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <form action="{{ route('elections.store') }}" method="POST" class="shadow p-4 bg-white rounded">
        @csrf

        <div class="mb-3">
            <label class="form-label">Titre</label>
            <input type="text" class="form-control" name="titre"
                   value="{{ old('titre') }}">
        </div>

        <div class="mb-3">
            <label class="form-label">Description</label>
            <textarea class="form-control" name="description">{{ old('description') }}</textarea>
        </div>

        <div class="mb-3">
            <label class="form-label">Date de début</label>
            <input type="datetime-local" class="form-control"
                   name="date_debut" value="{{ old('date_debut') }}">
        </div>

        <div class="mb-3">
            <label class="form-label">Date de fin</label>
            <input type="datetime-local" class="form-control"
                   name="date_fin" value="{{ old('date_fin') }}">
        </div>

        <div class="mb-3">
            <label class="form-label">Type d'élection</label><br>

            <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio"
                       name="type" value="ufr"
                       {{ old('type')=='ufr'?'checked':'' }}>
                <label class="form-check-label">UFR</label>
            </div>

            <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio"
                       name="type" value="promotion"
                       {{ old('type')=='promotion'?'checked':'' }}>
                <label class="form-check-label">Promotion</label>
            </div>
        </div>

        <div id="ufr-group" class="mb-3">
            <label class="form-label">UFR</label>
            <select class="form-select" name="id_ufr">
                <option value="">-- Sélectionner UFR --</option>
                @foreach($ufrs as $ufr)
                    <option value="{{ $ufr->id_ufr }}"
                        {{ old('id_ufr')==$ufr->id_ufr?'selected':'' }}>
                        {{ $ufr->nom }}
                    </option>
                @endforeach
            </select>
        </div>

        <div id="promotion-group" class="mb-3">
            <label class="form-label">Filière</label>
            <select class="form-select" name="id_filiere">
                <option value="">-- Sélectionner filière --</option>
                @foreach($filieres as $filiere)
                    <option value="{{ $filiere->id_filiere }}"
                        {{ old('id_filiere')==$filiere->id_filiere?'selected':'' }}>
                        {{ $filiere->nom }}
                    </option>
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