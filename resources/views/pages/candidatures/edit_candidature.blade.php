@extends('layouts.app')

@section('content')
<div class="container mt-5">
    <h2 class="text-center text-success mb-4">Modifier une Candidature</h2>

    @if($errors->any())
        <div class="alert alert-danger">
            <ul>
                @foreach($errors->all() as $error)
                   <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <form action="{{ route('candidatures.update', $candidature->id_candidature) }}" method="POST" enctype="multipart/form-data" class="shadow p-4 bg-white rounded">
        @csrf
        @method('PUT')

        <div class="mb-3">
            <label for="programme" class="form-label">Programme</label>
            <textarea class="form-control" id="programme" name="programme" rows="3">{{ $candidature->programme }}</textarea>
        </div>

        <div class="mb-3">
            <label for="photo" class="form-label">Photo</label>
            @if($candidature->photo)
                <div class="mb-2">
                    <img src="{{ asset('storage/'.$candidature->photo) }}" width="80">
                </div>
            @endif
            <input type="file" class="form-control" id="photo" name="photo" accept="image/*">
        </div>

        <div class="mb-3">
            <label for="statut" class="form-label">Statut</label>
            <select class="form-select" id="statut" name="statut">
                <option value="en_attente" {{ $candidature->statut == 'en_attente' ? 'selected' : '' }}>En attente</option>
                <option value="validee" {{ $candidature->statut == 'validee' ? 'selected' : '' }}>Validée</option>
                <option value="rejetee" {{ $candidature->statut == 'rejetee' ? 'selected' : '' }}>Rejetée</option>
            </select>
        </div>

        <div class="text-end">
            <button type="submit" class="btn btn-success">Mettre à jour</button>
        </div>
    </form>
</div>
@endsection
