<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Rapport Mensuel</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; font-size: 12px; }
        .header { text-align: center; border-bottom: 2px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; }
        .title { font-size: 22px; font-weight: bold; color: #065f46; }
        .grid { display: block; width: 100%; margin-bottom: 30px; }
        .card { display: inline-block; width: 30%; background: #f3f4f6; padding: 15px; margin-right: 2%; box-sizing: border-box; text-align: center; border: 1px solid #d1d5db; border-radius: 5px; }
        .card-value { font-size: 24px; font-weight: bold; color: #1f2937; margin-top: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #d1d5db; padding: 10px; text-align: left; }
        th { background-color: #f9fafb; }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">{{ $clinic['name'] }} - Rapport Mensuel</div>
        <div>{{ $month }} {{ $year }}</div>
    </div>

    <div class="grid">
        <div class="card">
            <div>Consultations Totales</div>
            <div class="card-value">{{ $total_consultations }}</div>
        </div>
        <div class="card">
            <div>Nouveaux Patients</div>
            <div class="card-value">{{ $new_patients }}</div>
        </div>
        <div class="card">
            <div>Revenus (Est.)</div>
            <div class="card-value">{{ number_format($revenue, 2, ',', ' ') }} MAD</div>
        </div>
    </div>

    <h3>Activité par Médecin</h3>
    <table>
        <thead>
            <tr>
                <th>Médecin</th>
                <th>Spécialité</th>
                <th>Nombre de Consultations</th>
            </tr>
        </thead>
        <tbody>
            @foreach($doctors as $doc)
            <tr>
                <td>Dr. {{ $doc->last_name }} {{ $doc->first_name }}</td>
                <td>{{ $doc->specialty ?? 'Généraliste' }}</td>
                <td>{{ $doc->consultations_count }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
