@echo off
setlocal

:: Set Python environment encoding to UTF-8 to prevent charmap output crash
set PYTHONIOENCODING=utf-8

:: Configuration variables
set SCRATCH_DIR=%USERPROFILE%\.gemini\ai-format\brain\8159f7ce-0a39-49a4-abf5-fecd766822f2\scratch
set RECALL_SCRIPT=%SCRATCH_DIR%\recall_context.py
set SAVE_SCRIPT=%SCRATCH_DIR%\save_active_context.py

if "%~1"=="" goto usage
if "%~1"=="load" goto load_context
if "%~1"=="save" goto save_context
goto usage

:load_context
if "%~2"=="" (
    echo Error: Please specify the context file to load.
    echo Example: .\ai load context.ai
    exit /b 1
)
python "%RECALL_SCRIPT%" "%~2"
exit /b %errorlevel%

:save_context
if "%~2"=="" (
    echo Error: Please specify the output file name.
    echo Example: .\ai save my_session.ai
    exit /b 1
)
python "%SAVE_SCRIPT%"
:: Copy output file to target location if required
set DEFAULT_OUTPUT=%SCRATCH_DIR%\session_context_production.ai
if exist "%DEFAULT_OUTPUT%" (
    copy /y "%DEFAULT_OUTPUT%" "%~2" >nul
    echo [+] Successfully exported context to: %~2
) else (
    echo [-] Error: Failed to generate context file.
    exit /b 1
)
exit /b 0

:usage
echo ==================================================
echo               AI CONTEXT FORMAT UTILITY           
echo ==================================================
echo Usage:
echo   .\ai load ^<file.ai^>   - Decrypts and prints context
echo   .\ai save ^<file.ai^>   - Saves active session to file
echo.
echo Examples:
echo   .\ai load session.ai
echo   .\ai save backup.ai
exit /b 1
