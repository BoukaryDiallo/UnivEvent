<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Emploi du Temps - {{ $edt->filiere->nom ?? '-' }} - {{ $edt->niveau->nom ?? '-' }}</title>

    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 11px;
        }

        h2 {
            text-align: center;
            margin-bottom: 10px;
        }

        h4 {
            text-align: center;
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
            background: #e7b100;
        }

        .info {
            text-align: center;
            margin-bottom: 10px;
            font-size: 11px;
        }

        .desc {
            font-size: 8px;
            color: gray
        }
        .inf{
            color: #f00
        }

        footer{
            text-align: center;
            color: gray;
            margin-top: 20
        }
    </style>
</head>
<body>
<h2>Emploi du Temps - {{ $edt->filiere->nom ?? '-' }} - {{ $edt->niveau->nom ?? '-' }}</h2>
<h4>{{ $user->name ?? '-'}}</h4>
<div class="info">
    Semestre: {{ $edt->semestre }} {{ $edt->groupe ? "| Groupe: $edt->groupe" : '' }} |
    Valable du {{ $edt->date_debut->format('d/m/Y') }} au {{ $edt->date_fin->format('d/m/Y') }}
</div>
{{-- <p class="inf">NB: L'emploie du temps peut subir des modifications en fonction de la disponibilté des enseignants. Veuillez donc consulter la plateforme regulierment.</p> --}}

<table>
    <thead>
        <tr>
            <th>Jour</th>
            <th>Module</th>
            <th>Salle</th>
            <th>Type de Séance</th>
            <th>Heures</th>
        </tr>
    </thead>

    <tbody>
        @foreach($sesSeances as $s)
            <tr>
                <td>{{ $s['jour'] }}</td>
                    <td>
                        {{ $s['module'] }}
                    </td>
                    <td>{{ $s['salle'] }}</td>
                    <td>{{ $s['type'] }}</td>
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
{{-- <h5 ></h5> --}}

</body>
</html>