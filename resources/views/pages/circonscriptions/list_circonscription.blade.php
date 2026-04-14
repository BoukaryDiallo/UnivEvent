@extends('layouts.app')

@section('content')
<div class="container mt-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="text-success">Liste des Circonscriptions</h2>
        <a href="{{ route('circonscriptions.create') }}" class="btn btn-success">+ Créer une circonscription</a>
    </div>

    @if(session('success'))
        <div class="alert alert-success">{{ session('success') }}</div>
    @endif

    <table class="table table-bordered shadow">
        <thead class="table-success">
            <tr>
                <th>Département</th>
                <th>Filière</th>
                <th>Niveau</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            @foreach($circonscriptions as $c)
            <tr>
                <td>{{ $c->departement }}</td>
                <td>{{ $c->filiere }}</td>
                <td>{{ $c->niveau }}</td>
                <td>
                    <a href="{{ route('circonscriptions.edit', $c->id_circonscription) }}" class="btn btn-warning btn-sm">Modifier</a>
                    <form action="{{ route('circonscriptions.destroy', $c->id_circonscription) }}" method="POST" style="display:inline;">
                        @csrf @method('DELETE')
                        <button class="btn btn-danger btn-sm" onclick="return confirm('Supprimer cette circonscription ?')">Supprimer</button>
                    </form>
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>
</div>
@endsection
