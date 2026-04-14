@extends('layouts.app')

@section('content')
<div class="container mt-5">
    <h2 class="text-center text-success mb-4">Votez pour votre Délégué</h2>

    @if($errors->any())
        <div class="alert alert-danger">
            <ul>
                @foreach($errors->all() as $error)
                   <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <form id="voteForm" action="{{ route('votes.store') }}" method="POST" class="shadow p-4 bg-white rounded">
        @csrf
        <input type="hidden" name="id_election" value="{{ $election->id_election }}">

        <div class="mb-3">
            <label class="form-label">Choisissez votre candidat :</label>
            @foreach($election->candidatures as $candidature)
                <div class="form-check">
                    <input class="form-check-input" type="radio" 
                           name="id_candidature" 
                           id="candidat{{ $candidature->id_candidature }}" 
                           value="{{ $candidature->id_candidature }}">
                    <label class="form-check-label" for="candidat{{ $candidature->id_candidature }}">
                        {{ $candidature->user->name }}
                        @if($candidature->programme)
                            – {{ Str::limit($candidature->programme, 50, '...') }}
                        @endif
                    </label>
                </div>
            @endforeach
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
