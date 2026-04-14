@extends('layouts.app')

@section('content')
<div class="container mt-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="text-success">Liste des Candidatures</h2>
        <a href="{{ route('candidatures.create') }}" class="btn btn-success">+ Nouvelle Candidature</a>
    </div>

    @if(session('success'))
        <div class="alert alert-success">{{ session('success') }}</div>
    @endif

    <table class="table table-bordered shadow">
        <thead class="table-success">
            <tr>
                <th>Candidat</th>
                <th>Élection</th>
                <th>Programme</th>
                <th>Statut</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            @foreach($candidatures as $candidature)
            <tr>
                <td>{{ $candidature->user->name }}</td>
                <td>{{ $candidature->election->titre }}</td>
                <td>{{ Str::limit($candidature->programme, 50, '...') }}</td>
                <td>
                    @if($candidature->statut == 'validee')
                        <span class="badge bg-success">Validée</span>
                    @elseif($candidature->statut == 'rejetee')
                        <span class="badge bg-danger">Rejetée</span>
                    @else
                        <span class="badge bg-warning">En attente</span>
                    @endif
                </td>
                <td>
                    <a href="{{ route('candidatures.show', $candidature->id_candidature) }}" class="btn btn-info btn-sm">Voir</a>
                    <a href="{{ route('candidatures.edit', $candidature->id_candidature) }}" class="btn btn-warning btn-sm">Modifier</a>
                    <form action="{{ route('candidatures.destroy', $candidature->id_candidature) }}" method="POST" style="display:inline;">
                        @csrf @method('DELETE')
                        <button class="btn btn-danger btn-sm" onclick="return confirm('Supprimer cette candidature ?')">Supprimer</button>
                    </form>
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>
</div>
@endsection
