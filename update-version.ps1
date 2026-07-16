<#
.SYNOPSIS
  Actualiza la versión de Cóndor Play en todos los archivos del sitio.

.DESCRIPTION
  Detecta la versión actual leyendo las URLs de descarga de index.html y
  reemplaza todas las ocurrencias (URLs de release, badges, textos visibles)
  en index.html, README.md y _redirects.

.EXAMPLE
  .\update-version.ps1 -Android 1.3.42tv
  .\update-version.ps1 -Windows 3.8.0
  .\update-version.ps1 -Android 1.3.42tv -Windows 3.8.0

.NOTES
  Después de ejecutar: git add -A; git commit -m "..."; git push
  Cloudflare Pages redespliega automáticamente al hacer push a main.
#>
param(
  # Tag del release de Android, ej: 1.3.42tv (como aparece en el tag vX.Y.ZZtv)
  [string]$Android,
  # Versión del release de Windows, ej: 3.8.0
  [string]$Windows
)

$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $MyInvocation.MyCommand.Path
$files = @('index.html', 'README.md', '_redirects') | ForEach-Object { Join-Path $repo $_ }

if (-not $Android -and -not $Windows) {
  Write-Host "Uso: .\update-version.ps1 [-Android X.Y.ZZtv] [-Windows X.Y.Z]" -ForegroundColor Yellow
  exit 1
}
if ($Android -and $Android -notmatch '^\d+\.\d+\.\d+tv$') {
  throw "Versión Android inválida: '$Android'. Formato esperado: X.Y.Ztv (ej: 1.3.42tv)"
}
if ($Windows -and $Windows -notmatch '^\d+\.\d+\.\d+$') {
  throw "Versión Windows inválida: '$Windows'. Formato esperado: X.Y.Z (ej: 3.8.0)"
}

# ── Detectar versiones actuales desde index.html (fuente de verdad: hrefs de descarga)
$indexContent = [System.IO.File]::ReadAllText((Join-Path $repo 'index.html'))

if ($indexContent -notmatch 'releases/download/v(\d+\.\d+\.\d+tv)/app-release\.apk') {
  throw "No se encontró la URL del APK de Android en index.html"
}
$currentAndroid = $Matches[1]

if ($indexContent -notmatch 'releases/download/v(\d+\.\d+\.\d+)/condorplay-') {
  throw "No se encontró la URL del EXE de Windows en index.html"
}
$currentWindows = $Matches[1]

Write-Host "Versión actual  → Android: $currentAndroid · Windows: $currentWindows"

# ── Construir lista de reemplazos (el tag completo antes que la versión visible)
$replacements = @()
if ($Android) {
  $currentDisplay = $currentAndroid -replace 'tv$', ''
  $newDisplay     = $Android -replace 'tv$', ''
  $replacements += @{ Old = $currentAndroid; New = $Android;    Label = 'Android (tag)' }
  $replacements += @{ Old = $currentDisplay; New = $newDisplay; Label = 'Android (visible)' }
}
if ($Windows) {
  $replacements += @{ Old = $currentWindows; New = $Windows; Label = 'Windows' }
}

# ── Aplicar en cada archivo
$totals = @{}
foreach ($file in $files) {
  $name = Split-Path -Leaf $file
  $content = [System.IO.File]::ReadAllText($file)
  $changed = $false

  foreach ($r in $replacements) {
    if ($r.Old -eq $r.New) { continue }
    $count = ([regex]::Matches($content, [regex]::Escape($r.Old))).Count
    if ($count -gt 0) {
      $content = $content.Replace($r.Old, $r.New)
      $changed = $true
      $totals[$r.Label] = [int]$totals[$r.Label] + $count
      Write-Host ("  {0,-12} {1,-18} {2} → {3}  ({4} ocurrencias)" -f $name, $r.Label, $r.Old, $r.New, $count)
    }
  }

  if ($changed) {
    [System.IO.File]::WriteAllText($file, $content, (New-Object System.Text.UTF8Encoding($false)))
  }
}

# ── Verificar que cada plataforma solicitada tuvo reemplazos
if ($Android -and $Android -ne $currentAndroid -and -not $totals['Android (tag)']) {
  throw "No se reemplazó ninguna URL de Android — revisa que index.html tenga el patrón esperado"
}
if ($Windows -and $Windows -ne $currentWindows -and -not $totals['Windows']) {
  throw "No se reemplazó ninguna URL de Windows — revisa que index.html tenga el patrón esperado"
}

if ($totals.Count -eq 0) {
  Write-Host "`nSin cambios: las versiones indicadas ya son las actuales." -ForegroundColor Yellow
} else {
  Write-Host "`n✔ Listo. Revisa los cambios y publica:" -ForegroundColor Green
  Write-Host '  git diff'
  Write-Host '  git add -A; git commit -m "chore: actualiza version"; git push'
  Write-Host '  (Cloudflare Pages redespliega automáticamente)'
}
