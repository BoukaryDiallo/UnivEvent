@extends('layouts.app')

@section('content')
<div class="container mt-5">
    <h2 class="text-center text-success mb-4">Votez pour votre Délégué</h2>
    <form id="voteForm" class="shadow p-4 bg-white rounded">
        <div class="mb-3">
            <label class="form-label">Choisissez votre candidat :</label>
            <div class="form-check">
                <input class="form-check-input" type="radio" name="candidat" id="jean" value="Jean Kaboré">
                <label class="form-check-label" for="jean">Jean Kaboré</label>
            </div>
            <div class="form-check">
                <input class="form-check-input" type="radio" name="candidat" id="amina" value="Amina Traoré">
                <label class="form-check-label" for="amina">Amina Traoré</label>
            </div>
        </div>
        <div class="text-end">
            <button type="submit" class="btn btn-success">Valider mon Vote</button>
        </div>
    </form>
</div>
@endsection

@push('styles')
<link rel="stylesheet" href="{{ asset('css/vote.css') }}">
@endpush

@push('scripts')
<script src="{{ asset('js/vote.js') }}"></script>
@endpush
