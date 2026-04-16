@extends('layouts.app')

@section('content')
<div class="container mt-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="text-success">Liste des Élections</h2>
        <a href="{{ route('elections.create') }}" class="btn btn-success">+ Créer une élection</a>
    </div>

    @if(session('success'))
        <div class="alert alert-success">{{ session('success') }}</div>
    @endif

    <table class="table table-bordered shadow">
        <thead class="table-success">
            <tr>
                <th>Titre</th>
                <th>Description</th>
                <th>Date début</th>
                <th>Date fin</th>
                <th>Statut</th>
                <th>Portée</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            @foreach($elections as $election)
            <tr>
                <td>{{ $election->titre }}</td>
                <td>{{ Str::limit($election->description ?? '', 50) }}</td>
                <td>{{ $election->date_debut }}</td>
                <td>{{ $election->date_fin }}</td>
                <td>
                    <span class="badge {{ $election->statut == 'ouverte' ? 'bg-success' : 'bg-secondary' }}">
                        {{ ucfirst($election->statut) }}
                    </span>
                </td>
                <td>
                    @if($election->type == 'ufr' && $election->ufr)
                        UFR: {{ $election->ufr->nom }}
                    @elseif($election->type == 'promotion' && $election->filiere)
                        Promotion: {{ $election->filiere->nom }}
                    @else
                        Non définie
                    @endif
                </td>
                <div class="row">
                    <td class="text-center">
                        <a href="{{ route('elections.edit', $election->id_election) }}"
                        class="btn btn-warning btn-sm"
                        title="Modifier">
                            <i class="bi bi-pencil-square"></i>
                        </a>

                        <form action="{{ route('elections.destroy', $election->id_election) }}"
                            method="POST"
                            style="display:inline;">
                            @csrf
                            @method('DELETE')

                            <button class="btn btn-danger btn-sm"
                                    onclick="return confirm('Annuler cette élection ?')"
                                    title="Annuler">
                                <i class="bi bi-trash"></i>
                            </button>
                        </form>
                    </td>
                </div>
            </tr>
            @endforeach
        </tbody>
    </table>
</div>
@endsection
