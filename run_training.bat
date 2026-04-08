@echo off
echo Starting Multilingual Whisper Training Pipeline
echo ========================================

if "%1"=="test" (
    echo Testing dataset structure...
    python test_dataset_structure.py
) else if "%1"=="prepare" (
    echo Preparing dataset...
    python prepare_dataset.py
) else if "%1"=="train" (
    echo Training model...
    python train_whisper_multilingual.py
) else if "%1"=="evaluate" (
    echo Evaluating model...
    python evaluate_model.py
) else if "%1"=="full" (
    echo Running complete pipeline...
    python run_training.py --step full
) else (
    echo Usage: run_training.bat [test^|prepare^|train^|evaluate^|full]
    echo   test     - Test dataset structure
    echo   prepare  - Prepare dataset for training
    echo   train    - Train the model
    echo   evaluate - Evaluate the trained model
    echo   full     - Run complete pipeline
    echo.
    echo Example: run_training.bat test
)

pause
