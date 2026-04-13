@extends('layouts.app')

@section('content')
<div class="container mt-5">
    <h2 class="text-center text-success mb-4">Créer une Circonscription</h2>

    @if($errors->any())
        <div class="alert alert-danger">
            <ul>
                @foreach($errors->all() as $error)
                   <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <form action="{{ route('circonscriptions.store') }}" method="POST" class="shadow p-4 bg-white rounded">
        @csrf

        <div class="mb-3">
            <label for="departement" class="form-label">Département</label>
            <input type="text" class="form-control" id="departement" name="departement" placeholder="Ex: Sciences">
        </div>

        <div class="mb-3">
            <label for="filiere" class="form-label">Filière</label>
            <input type="text" class="form-control" id="filiere" name="filiere" placeholder="Ex: Informatique">
        </div>

        <div class="mb-3">
            <label for="niveau" class="form-label">Niveau</label>
            <input type="text" class="form-control" id="niveau" name="niveau" placeholder="Ex: Licence 3">
        </div>

        <div class="text-end">
            <button type="reset" class="btn btn-outline-success me-2">Annuler</button>
            <button type="submit" class="btn btn-success">Créer Circonscription</button>
        </div>
    </form>
</div>
@endsection
