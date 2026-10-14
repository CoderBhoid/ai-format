@echo off
setlocal

set SCRIPT_DIR=%~dp0
set BIN_PATH=%SCRIPT_DIR%target\release\aif.exe

if not exist "%BIN_PATH%" (
    set BIN_PATH=%SCRIPT_DIR%target\release\aif
)

if not exist "%BIN_PATH%" (
    echo [*] Compiling AIF V4 release binary...
    cargo build --release --manifest-path "%SCRIPT_DIR%Cargo.toml"
    if errorlevel 1 (
        echo [-] Cargo build failed.
        exit /b 1
    )
    if exist "%SCRIPT_DIR%target\release\aif.exe" (
        set BIN_PATH=%SCRIPT_DIR%target\release\aif.exe
    ) else (
        set BIN_PATH=%SCRIPT_DIR%target\release\aif
    )
)

"%BIN_PATH%" %*
exit /b %errorlevel%
