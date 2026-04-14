@extends('layouts.app')

@section('content')
<div class="container mt-5">
    <h2 class="text-center text-success mb-4">Déposer une Candidature</h2>

    @if($errors->any())
        <div class="alert alert-danger">
            <ul>
                @foreach($errors->all() as $error)
                   <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <form action="{{ route('candidatures.store') }}" method="POST" enctype="multipart/form-data" class="shadow p-4 bg-white rounded">
        @csrf

        <div class="mb-3">
            <label for="id_user" class="form-label">Candidat</label>
            <select class="form-select" id="id_user" name="id_user">
                <option value="">-- Sélectionner un utilisateur --</option>
                @foreach($users as $user)
                    <option value="{{ $user->id }}">{{ $user->name }}</option>
                @endforeach
            </select>
        </div>

        <div class="mb-3">
            <label for="id_election" class="form-label">Élection</label>
            <select class="form-select" id="id_election" name="id_election">
                <option value="">-- Sélectionner une élection --</option>
                @foreach($elections as $election)
                    <option value="{{ $election->id_election }}">{{ $election->titre }}</option>
                @endforeach
            </select>
        </div>

        <div class="mb-3">
            <label for="programme" class="form-label">Programme</label>
            <textarea class="form-control" id="programme" name="programme" rows="3"></textarea>
        </div>

        <div class="mb-3">
            <label for="photo" class="form-label">Photo</label>
            <input type="file" class="form-control" id="photo" name="photo" accept="image/*">
        </div>

        <div class="mb-3">
            <label for="cnib_pdf" class="form-label">CNIB (PDF)</label>
            <input type="file" class="form-control" id="cnib_pdf" name="cnib_pdf" accept="application/pdf">
        </div>

        <div class="mb-3">
            <label for="casier_judiciaire_pdf" class="form-label">Casier judiciaire (PDF)</label>
            <input type="file" class="form-control" id="casier_judiciaire_pdf" name="casier_judiciaire_pdf" accept="application/pdf">
        </div>

        <div class="mb-3">
            <label for="attestation_inscription_pdf" class="form-label">Attestation d'inscription (PDF)</label>
            <input type="file" class="form-control" id="attestation_inscription_pdf" name="attestation_inscription_pdf" accept="application/pdf">
        </div>

        <div class="text-end">
            <button type="reset" class="btn btn-outline-success me-2">Annuler</button>
            <button type="submit" class="btn btn-success">Soumettre Candidature</button>
        </div>
    </form>
</div>
@endsection
