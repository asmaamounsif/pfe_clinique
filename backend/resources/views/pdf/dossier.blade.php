<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Dossier Médical</title>
    <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 12px; color: #333; line-height: 1.5; }
        .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #3b82f6; margin-bottom: 20px; }
        .clinic-name { font-size: 20px; font-weight: bold; color: #1e3a8a; }
        h1 { color: #1e3a8a; text-align: center; font-size: 24px; margin-top: 40px; }
        h2 { color: #2563eb; font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 30px; }
        .info-box { background: #f9fafb; border: 1px solid #e5e7eb; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
        .row { width: 100%; margin-bottom: 5px; }
        .label { font-weight: bold; width: 150px; display: inline-block; color: #4b5563; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
        th { background-color: #f3f4f6; color: #4b5563; font-weight: bold; }
        .page-break { page-break-after: always; }
        .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 10px; color: #9ca3af; border-top: 1px solid #eee; padding-top: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="clinic-name">{{ $clinic['name'] }}</div>
        <div>Dossier Médical Électronique</div>
    </div>

    <h1>DOSSIER PATIENT COMPLET</h1>

    <div class="info-box">
        <div class="row"><span class="label">Nom complet:</span> {{ $patient->first_name }} {{ $patient->last_name }}</div>
        <div class="row"><span class="label">Date de naissance:</span> {{ \Carbon\Carbon::parse($patient->date_of_birth)->format('d/m/Y') }} ({{ \Carbon\Carbon::parse($patient->date_of_birth)->age }} ans)</div>
        <div class="row"><span class="label">Sexe:</span> {{ $patient->gender }}</div>
        <div class="row"><span class="label">CIN / SSN:</span> {{ $patient->social_security_number }}</div>
        <div class="row"><span class="label">Téléphone:</span> {{ $patient->phone }}</div>
        <div class="row"><span class="label">Groupe Sanguin:</span> {{ $patient->blood_type ?? 'Non spécifié' }}</div>
    </div>

    <h2>Antécédents Médicaux</h2>
    <div class="info-box">
        <strong>Allergies:</strong>
        @php $allergies = json_decode($patient->medicalRecord->allergies, true) ?? []; @endphp
        <ul>
            @forelse($allergies as $a)
                <li>{{ $a['name'] ?? '' }} (Sévérité: {{ $a['severity'] ?? 'Inconnue' }})</li>
            @empty
                <li>Aucune allergie connue</li>
            @endforelse
        </ul>
        <br>
        <strong>Antécédents Personnels:</strong>
        <p>{{ $patient->medicalRecord->medical_history ?? 'Néant' }}</p>
        <br>
        <strong>Antécédents Familiaux:</strong>
        <p>{{ $patient->medicalRecord->family_history ?? 'Néant' }}</p>
    </div>

    <div class="page-break"></div>

    <h2>Historique des Consultations</h2>
    @forelse($patient->consultations as $consult)
        <div class="info-box" style="margin-bottom: 10px;">
            <div style="float:right; font-size: 10px; color:#666;">{{ \Carbon\Carbon::parse($consult->created_at)->format('d/m/Y H:i') }}</div>
            <strong>Dr. {{ $consult->doctor->last_name }}</strong><br>
            <span class="label">Motif:</span> {{ $consult->motif }}<br>
            <span class="label">Diagnostic:</span> {{ $consult->diagnostic ?? 'N/A' }}<br>
            <span class="label">Notes:</span> {{ $consult->notes ?? 'N/A' }}
        </div>
    @empty
        <p>Aucune consultation enregistrée.</p>
    @endforelse

    <h2>Résultats d'Examens</h2>
    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Examen</th>
                <th>Résultat</th>
                <th>Statut</th>
            </tr>
        </thead>
        <tbody>
            @forelse($patient->examResults as $exam)
            <tr>
                <td>{{ \Carbon\Carbon::parse($exam->date_examen)->format('d/m/Y') }}</td>
                <td>{{ $exam->type_examen }}</td>
                <td>{{ $exam->nom_examen }}</td>
                <td>{{ $exam->resultat }} (Normal: {{ $exam->valeur_normale }})</td>
                <td>{{ $exam->statut }}</td>
            </tr>
            @empty
            <tr><td colSpan="5" style="text-align:center;">Aucun examen enregistré</td></tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Généré le {{ \Carbon\Carbon::now()->format('d/m/Y à H:i') }} | {{ $clinic['name'] }}
    </div>
</body>
</html>
