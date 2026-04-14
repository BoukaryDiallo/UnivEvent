@extends('layouts.app')

@section('content')
<div class="container mt-5">
    <h2 class="text-success mb-4">Liste des Votes</h2>

    @if(session('success'))
        <div class="alert alert-success">{{ session('success') }}</div>
    @endif

    <table class="table table-bordered shadow">
        <thead class="table-success">
            <tr>
                <th>Électeur</th>
                <th>Élection</th>
                <th>Candidat choisi</th>
                <th>Date du vote</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            @foreach($votes as $vote)
            <tr>
                <td>{{ $vote->user->name }}</td>
                <td>{{ $vote->election->titre }}</td>
                <td>{{ $vote->candidature->user->name }}</td>
                <td>{{ $vote->date_vote }}</td>
                <td>
                    <a href="{{ route('votes.show', $vote->id_vote) }}" class="btn btn-info btn-sm">Voir</a>
                    <form action="{{ route('votes.destroy', $vote->id_vote) }}" method="POST" style="display:inline;">
                        @csrf @method('DELETE')
                        <button class="btn btn-danger btn-sm" onclick="return confirm('Supprimer ce vote ?')">Supprimer</button>
                    </form>
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>
</div>
@endsection
