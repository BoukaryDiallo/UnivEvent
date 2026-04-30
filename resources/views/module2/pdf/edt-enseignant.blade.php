<h2>Emploi du temps - {{ $edt->titre }}</h2>

<h4>Enseignant : {{ $enseignant->name }}</h4>

<p>
Période :
{{ $edt->date_debut->format('d/m/Y') }}
-
{{ $edt->date_fin->format('d/m/Y') }}
</p>

<table width="100%" border="1" cellspacing="0" cellpadding="5">
    <thead>
        <tr>
            <th>Jour</th>
            <th>Module</th>
            <th>Salle</th>
            <th>Type</th>
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
                <td>
                    {{ \Carbon\Carbon::parse($s['debut'])->format('H:i') }}
                    -
                    {{ \Carbon\Carbon::parse($s['fin'])->format('H:i') }}
                </td>
            </tr>
        @endforeach
    </tbody>
</table>