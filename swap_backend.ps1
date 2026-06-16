$base = "C:\Users\HP\.gemini\antigravity\scratch\hospital_mcd_laravel"

Write-Host "--- Renaming backend/ to backend_old/ ---"
if (Test-Path "$base\backend_old") {
    Remove-Item -Recurse -Force "$base\backend_old"
    Write-Host "Removed stale backend_old"
}
Rename-Item "$base\backend" "$base\backend_old"
Write-Host "backend/ renamed to backend_old/"

Write-Host "--- Renaming backend_new/ to backend/ ---"
Rename-Item "$base\backend_new" "$base\backend"
Write-Host "backend_new/ renamed to backend/"

Write-Host "Swap complete."
