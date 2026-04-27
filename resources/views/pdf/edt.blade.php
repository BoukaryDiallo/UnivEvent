<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Emploi du Temps</title>

    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 11px;
        }

        h2 {
            text-align: center;
            margin-bottom: 10px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th, td {
            border: 1px solid #000;
            padding: 6px;
            text-align: center;
            vertical-align: middle;
        }

        th {
            background: #f2f2f2;
        }

        .info {
            text-align: center;
            margin-bottom: 10px;
            font-size: 11px;
        }
         footer{
            text-align: center;
            color: gray;
            margin-top: 20
        }
    </style>
</head>
<body>

<h2>{{ $edt->titre }}</h2>
<div class="info">
    Semestre: {{ $edt->semestre }} |
    {{-- Groupe: {{ $edt->groupe }} | --}}
    Période: {{ $edt->date_debut->format('d/m/Y') }} - {{ $edt->date_fin->format('d/m/Y') }}
</div>

<table>
    <thead>
        <tr>
            <th>Jour</th>
            <th>Module</th>
            <th>Salle</th>
            <th>Type de Séance</th>
            <th>Enseignant</th>
            <th>Heures</th>
        </tr>
    </thead>

    <tbody>
        @foreach($seances as $s)
            <tr>
                <td>{{ $s['jour'] }}</td>
                <td>{{ $s['module'] }}</td>
                <td>{{ $s['salle'] }}</td>
                <td>{{ $s['type'] }}</td>
                <td>{{ $s['enseignant'] }}</td>
                <td>
                    {{ \Carbon\Carbon::parse($s['debut'])->format('H:i') }}
                    -
                    {{ \Carbon\Carbon::parse($s['fin'])->format('H:i') }}
                </td>
            </tr>
        @endforeach
    </tbody>
</table>

<footer>
    Univ Event - Bonne séance !
</footer>
</body>
</html>