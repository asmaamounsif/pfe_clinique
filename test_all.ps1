# Hospital Management System - Full Test Script
# Run this from the project root directory

$ErrorActionPreference = "Continue"
$results = @()

function Test-Endpoint {
    param($method, $url, $headers = @{}, $body = $null, $expectedStatus = 200)
    try {
        $params = @{
            Uri = $url
            Method = $method
            Headers = $headers
            UseBasicParsing = $true
            TimeoutSec = 10
            ErrorAction = "Stop"
        }
        if ($body) {
            $params.Body = $body | ConvertTo-Json
            $params.ContentType = "application/json"
        }
        $r = Invoke-WebRequest @params
        return @{ status = $r.StatusCode; body = $r.Content; ok = $true }
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        $msg = $_.Exception.Message
        try { $errBody = $_.Exception.Response.GetResponseStream() | % { $reader = New-Object System.IO.StreamReader($_); $reader.ReadToEnd() } } catch { $errBody = "" }
        return @{ status = $code; body = $errBody; ok = $false; error = $msg }
    }
}

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "STEP 1 - SERVER HEALTH CHECKS" -ForegroundColor Cyan
Write-Host "============================================="

# Laravel health
$r = Test-Endpoint "GET" "http://127.0.0.1:8000/api/health"
Write-Host "Laravel /api/health: Status=$($r.status) Body=$($r.body)"

# Gateway health
$r = Test-Endpoint "GET" "http://localhost:3050/health"
Write-Host "Gateway /health: Status=$($r.status) Body=$($r.body)"

# React
$r = Test-Endpoint "GET" "http://localhost:5173"
Write-Host "React frontend: Status=$($r.status)"

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "STEP 2 - AUTHENTICATION TESTS" -ForegroundColor Cyan
Write-Host "============================================="

$emails = @("admin@example.com","medecin@example.com","secretaire@example.com","infirmier@example.com","patient@example.com")
$tokens = @{}

foreach ($email in $emails) {
    $r = Test-Endpoint "POST" "http://localhost:3050/api/auth/login" -body @{email=$email; password="password"}
    Write-Host "Login $email : Status=$($r.status) Body=$($r.body)"
    if ($r.ok) {
        try {
            $data = $r.body | ConvertFrom-Json
            $token = $data.token
            if (-not $token) { $token = $data.data.token }
            if (-not $token) { $token = $data.access_token }
            if (-not $token) { $token = $data.data.access_token }
            if ($token) {
                $tokens[$email] = $token
                Write-Host "  -> Token obtained: $($token.Substring(0, [Math]::Min(20, $token.Length)))..."
            }
        } catch { Write-Host "  -> Could not parse token" }
    }
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "STEP 3 - API ENDPOINT TESTS" -ForegroundColor Cyan
Write-Host "============================================="

$adminToken = $tokens["admin@example.com"]
$medecinToken = $tokens["medecin@example.com"]
$secretaireToken = $tokens["secretaire@example.com"]
$infirmierToken = $tokens["infirmier@example.com"]
$patientToken = $tokens["patient@example.com"]

function Test-WithToken {
    param($method, $url, $token, $label)
    $h = @{ Authorization = "Bearer $token" }
    $r = Test-Endpoint $method $url -headers $h
    Write-Host "$label : Status=$($r.status) $(if($r.status -ge 200 -and $r.status -lt 300){'✅'}elseif($r.status -eq 403){'✅ (403 as expected)'}else{'❌'}) Body=$($r.body.Substring(0,[Math]::Min(200,$r.body.Length)))"
    return $r
}

if ($adminToken) {
    Write-Host "-- Admin endpoints --"
    Test-WithToken "GET" "http://localhost:3050/api/admin/stats" $adminToken "GET /api/admin/stats"
    Test-WithToken "GET" "http://localhost:3050/api/admin/users" $adminToken "GET /api/admin/users"
    Test-WithToken "GET" "http://localhost:3050/api/admin/audit-logs" $adminToken "GET /api/admin/audit-logs"
    Test-WithToken "GET" "http://localhost:3050/api/admin/appointments" $adminToken "GET /api/admin/appointments"
} else {
    Write-Host "No admin token - skipping admin tests"
}

if ($medecinToken) {
    Write-Host "-- Medecin endpoints --"
    Test-WithToken "GET" "http://localhost:3050/api/medecin/patients" $medecinToken "GET /api/medecin/patients"
    Test-WithToken "GET" "http://localhost:3050/api/medecin/consultations" $medecinToken "GET /api/medecin/consultations"
    Test-WithToken "GET" "http://localhost:3050/api/medecin/appointments" $medecinToken "GET /api/medecin/appointments"
    Test-WithToken "GET" "http://localhost:3050/api/medecin/prescriptions" $medecinToken "GET /api/medecin/prescriptions"
} else {
    Write-Host "No medecin token - skipping medecin tests"
}

if ($infirmierToken) {
    Write-Host "-- Infirmier endpoints --"
    Test-WithToken "GET" "http://localhost:3050/api/infirmier/patients" $infirmierToken "GET /api/infirmier/patients"
    Test-WithToken "GET" "http://localhost:3050/api/infirmier/appointments" $infirmierToken "GET /api/infirmier/appointments"
} else {
    Write-Host "No infirmier token - skipping infirmier tests"
}

if ($secretaireToken) {
    Write-Host "-- Secretaire endpoints --"
    Test-WithToken "GET" "http://localhost:3050/api/secretaire/patients" $secretaireToken "GET /api/secretaire/patients"
    Test-WithToken "GET" "http://localhost:3050/api/secretaire/appointments" $secretaireToken "GET /api/secretaire/appointments"
    Test-WithToken "GET" "http://localhost:3050/api/secretaire/doctors" $secretaireToken "GET /api/secretaire/doctors"
} else {
    Write-Host "No secretaire token - skipping secretaire tests"
}

if ($patientToken) {
    Write-Host "-- Patient endpoints --"
    Test-WithToken "GET" "http://localhost:3050/api/patient/appointments" $patientToken "GET /api/patient/appointments"
    Test-WithToken "GET" "http://localhost:3050/api/patient/prescriptions" $patientToken "GET /api/patient/prescriptions"
} else {
    Write-Host "No patient token - skipping patient tests"
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "STEP 4 - RBAC ACCESS CONTROL TESTS" -ForegroundColor Cyan
Write-Host "============================================="

if ($patientToken) {
    Write-Host "-- Patient token trying admin routes (expect 403) --"
    $r = Test-WithToken "GET" "http://localhost:3050/api/admin/users" $patientToken "GET /api/admin/users (patient token)"
    $r = Test-WithToken "GET" "http://localhost:3050/api/admin/audit-logs" $patientToken "GET /api/admin/audit-logs (patient token)"
    $r = Test-WithToken "GET" "http://localhost:3050/api/admin/stats" $patientToken "GET /api/admin/stats (patient token)"
}

if ($medecinToken) {
    Write-Host "-- Medecin token trying admin routes (expect 403) --"
    $r = Test-WithToken "GET" "http://localhost:3050/api/admin/users" $medecinToken "GET /api/admin/users (medecin token)"
}

if ($secretaireToken) {
    Write-Host "-- Secretaire token trying admin routes (expect 403) --"
    $r = Test-WithToken "GET" "http://localhost:3050/api/admin/users" $secretaireToken "GET /api/admin/users (secretaire token)"
    $r = Test-WithToken "GET" "http://localhost:3050/api/admin/audit-logs" $secretaireToken "GET /api/admin/audit-logs (secretaire token)"
}

if ($patientToken) {
    Write-Host "-- Patient token trying secretaire routes (expect 403) --"
    $r = Test-WithToken "GET" "http://localhost:3050/api/secretaire/patients" $patientToken "GET /api/secretaire/patients (patient token)"
}

Write-Host ""
Write-Host "Done. Results saved." -ForegroundColor Green
