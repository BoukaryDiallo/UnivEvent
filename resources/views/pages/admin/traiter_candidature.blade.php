@extends('layouts.app')

@section('content')
<div class="container mt-5">
    <h2 class="text-center text-success mb-4">Validation des Candidats</h2>
    <table class="table table-bordered shadow">
        <thead class="table-success">
            <tr>
                <th>Nom</th>
                <th>Slogan</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Jean Kaboré</td>
                <td>Pour une promotion unie et dynamique!</td>
                <td>
                    <button class="btn btn-success btn-sm">Accepter</button>
                    <button class="btn btn-danger btn-sm">Refuser</button>
                </td>
            </tr>
            <tr>
                <td>Amina Traoré</td>
                <td>Ensemble pour la réussite!</td>
                <td>
                    <button class="btn btn-success btn-sm">Accepter</button>
                    <button class="btn btn-danger btn-sm">Refuser</button>
                </td>
            </tr>
        </tbody>
    </table>
</div>
@endsection

@push('styles')
<link rel="stylesheet" href="{{ asset('css/candidature.css') }}">
@endpush

@push('scripts')
<script src="{{ asset('js/candidature.js') }}"></script>
@endpush
