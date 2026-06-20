<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Ordonnance Médicale</title>
    <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 14px; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
        .clinic-name { font-size: 24px; font-weight: bold; color: #1e3a8a; }
        .clinic-info { font-size: 12px; color: #666; margin-top: 5px; }
        .doc-info { margin-top: 15px; font-weight: bold; }
        .patient-info { margin-bottom: 30px; border: 1px solid #ddd; padding: 15px; background: #f9fafb; }
        .medications { width: 100%; border-collapse: collapse; margin-bottom: 50px; }
        .medications th, .medications td { padding: 10px; border-bottom: 1px solid #eee; text-align: left; }
        .medications th { background-color: #f3f4f6; color: #4b5563; }
        .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 10px; color: #9ca3af; border-top: 1px solid #eee; padding-top: 10px; }
        .signature-area { float: right; width: 200px; text-align: center; margin-top: 30px; }
        .watermark { position: fixed; top: 30%; left: 15%; font-size: 80px; color: rgba(0,0,0,0.05); transform: rotate(-45deg); z-index: -1; }
    </style>
</head>
<body>
    <div class="watermark">CONFIDENTIEL</div>
    
    <div class="header">
        <div class="clinic-name">{{ $clinic['name'] }}</div>
        <div class="clinic-info">{{ $clinic['address'] }} | Tél: {{ $clinic['phone'] }}</div>
        <div class="doc-info">Dr. {{ $prescription->doctor->first_name }} {{ $prescription->doctor->last_name }}</div>
        <div class="clinic-info">Spécialité: {{ $prescription->doctor->specialty ?? 'Généraliste' }} | INPE: 123456789</div>
    </div>

    <div style="text-align: right; margin-bottom: 20px;">
        Date: {{ \Carbon\Carbon::now()->format('d/m/Y') }}
    </div>

    <div class="patient-info">
        <strong>Patient(e):</strong> {{ $prescription->patient->first_name }} {{ $prescription->patient->last_name }}<br>
        <strong>Âge:</strong> {{ \Carbon\Carbon::parse($prescription->patient->date_of_birth)->age }} ans<br>
        <strong>CIN:</strong> {{ $prescription->patient->social_security_number ?? 'N/A' }}
    </div>

    <h3 style="text-align: center; text-decoration: underline; margin-bottom: 30px;">ORDONNANCE</h3>

    <table class="medications">
        <thead>
            <tr>
                <th>Médicament</th>
                <th>Posologie</th>
                <th>Durée</th>
            </tr>
        </thead>
        <tbody>
            @php $meds = json_decode($prescription->medications, true) ?? []; @endphp
            @foreach($meds as $med)
            <tr>
                <td><strong>{{ $med['name'] ?? 'Inconnu' }}</strong></td>
                <td>{{ $med['dosage'] ?? '' }}</td>
                <td>{{ $med['duration'] ?? '' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="signature-area">
        <p>Signature et Cachet du Médecin</p>
        <div style="height: 100px; border: 1px dashed #ccc; margin-top: 10px;"></div>
    </div>

    <div class="footer">
        Ce document est confidentiel. Toute falsification est passible de poursuites pénales.
    </div>
</body>
</html>
