@echo off
echo Running torchcodec fix...
"C:/users/hp/appdata/local/programs/python/python310/python.exe" "fix_torchcodec.py"
echo.
if %errorlevel% neq 0 (
    echo ✅ torchcodec issue fixed!
    echo 🚀 You can now run training without issues!
) else (
    echo ❌ Fix failed
)
echo.
echo Now trying isolated training...
"C:/users/hp/appdata/local/programs/python/python310/python.exe" "train_whisper_isolated.py"
