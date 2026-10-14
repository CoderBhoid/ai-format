$ErrorActionPreference = "Stop"

$InstallDir = if ($env:AIF_INSTALL_DIR) { $env:AIF_INSTALL_DIR } else { "$env:USERPROFILE\.local\bin" }
$Repo = "CoderBhoid/ai-format"
$Version = "v4.0.0"

Write-Host "[*] Installing AIF V4 Memory Engine for Windows..." -ForegroundColor Cyan

if (-not (Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
}

$Target = "x86_64-pc-windows-msvc"
$DownloadUrl = "https://github.com/$Repo/releases/download/$Version/aif-$Target.zip"
$Installed = $false

$TempZip = "$env:TEMP\aif.zip"
try {
    Invoke-WebRequest -Uri $DownloadUrl -OutFile $TempZip -UseBasicParsing
    Expand-Archive -Path $TempZip -DestinationPath $InstallDir -Force
    Remove-Item $TempZip -Force
    $Installed = $true
} catch {
    Write-Host "[*] Pre-built binary not found online, compiling with cargo..." -ForegroundColor Yellow
    if (Get-Command cargo -ErrorAction SilentlyContinue) {
        cargo install --git "https://github.com/$Repo.git" --root "$env:USERPROFILE\.local"
        $Installed = $true
    } else {
        Write-Error "Cargo is not installed. Please install Rust from https://rustup.rs"
        exit 1
    }
}

$ExePath = Join-Path $InstallDir "aif.exe"
Write-Host "[+] Successfully installed AIF to $ExePath" -ForegroundColor Green

& $ExePath init --project "default" --model "default"
Write-Host "[+] AIF V4 initialization complete." -ForegroundColor Green
