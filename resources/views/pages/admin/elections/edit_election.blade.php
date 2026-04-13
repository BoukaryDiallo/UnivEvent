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
            <label for="id_circonscription" class="form-label">Circonscription</label>
            <select class="form-select" id="id_circonscription" name="id_circonscription">
                @foreach($circonscriptions as $c)
                    <option value="{{ $c->id_circonscription }}" {{ $election->id_circonscription == $c->id_circonscription ? 'selected' : '' }}>
                        {{ $c->nom }}
                    </option>
                @endforeach
            </select>
        </div>

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
