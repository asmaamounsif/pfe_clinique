$src = "C:\Users\HP\.gemini\antigravity\scratch\hospital_mcd_laravel\backend"
$dst = "C:\Users\HP\.gemini\antigravity\scratch\hospital_mcd_laravel\backend_new"

Write-Host "--- Copying app/ ---"
Copy-Item "$src\app\*" "$dst\app\" -Recurse -Force
Write-Host "app/ done"

Write-Host "--- Copying database/ ---"
Copy-Item "$src\database\*" "$dst\database\" -Recurse -Force
Write-Host "database/ done"

Write-Host "--- Copying routes/ ---"
Copy-Item "$src\routes\*" "$dst\routes\" -Recurse -Force
Write-Host "routes/ done"

Write-Host "--- Copying config/ ---"
Copy-Item "$src\config\*" "$dst\config\" -Recurse -Force
Write-Host "config/ done"

Write-Host "--- Copying .env ---"
Copy-Item "$src\.env" "$dst\.env" -Force
Write-Host ".env done"

Write-Host "All custom files copied successfully."
