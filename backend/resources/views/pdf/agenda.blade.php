<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Agenda du Jour</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; font-size: 12px; }
        .header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 20px; }
        .title { font-size: 18px; font-weight: bold; color: #1e3a8a; }
        .doc-section { margin-top: 30px; margin-bottom: 10px; font-size: 16px; font-weight: bold; color: #4b5563; background: #f3f4f6; padding: 10px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f9fafb; color: #4b5563; }
        .status-badge { padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">{{ $clinic['name'] }} - Agenda du {{ $date }}</div>
    </div>

    @forelse($agenda as $doctorName => $appointments)
        <div class="doc-section">{{ $doctorName }} ({{ count($appointments) }} rendez-vous)</div>
        <table>
            <thead>
                <tr>
                    <th width="15%">Heure</th>
                    <th width="35%">Patient</th>
                    <th width="20%">Statut</th>
                    <th width="30%">Notes / Motif</th>
                </tr>
            </thead>
            <tbody>
                @foreach($appointments as $appt)
                <tr>
                    <td>{{ \Carbon\Carbon::parse($appt->date_heure)->format('H:i') }}</td>
                    <td>{{ $appt->patient->first_name }} {{ $appt->patient->last_name }}</td>
                    <td>{{ $appt->status }}</td>
                    <td>{{ $appt->motif ?? '' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    @empty
        <p style="text-align: center; margin-top: 50px;">Aucun rendez-vous prévu pour cette date.</p>
    @endforelse
</body>
</html>
