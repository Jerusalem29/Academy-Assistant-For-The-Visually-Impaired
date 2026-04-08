"""
Configuration file for multilingual speech dataset preparation
Update these paths to match your actual dataset locations
"""

# Dataset paths - update these to your actual Kaggle dataset locations
DATASET_PATHS = {
    "af": "C:/Users/HP/FINAL YEAR PRO1/FINAL YEAR PRO/datasets/a-publicly-available-ao-asr-dataset-partialAfaan",
    "am": "C:/Users/HP/FINAL YEAR PRO1/FINAL YEAR PRO/datasets/amharic-speech-corpus", 
    "en": "C:/Users/HP/FINAL YEAR PRO1/FINAL YEAR PRO/datasets/english-stt"
}

# Output configuration
OUTPUT_DIR = "./multilingual_speech_dataset"

# Audio quality settings
MIN_DURATION = 0.5  # seconds
MAX_DURATION = 30.0  # seconds
MIN_SAMPLE_RATE = 16000
MAX_SAMPLE_RATE = 48000

# Supported languages
LANGUAGES = {
    "af": "Afaan Oromo",
    "am": "Amharic", 
    "en": "English"
}

# Common audio file extensions to search for
AUDIO_EXTENSIONS = [".wav", ".mp3", ".flac", ".m4a"]

# Common transcript file extensions to search for
TRANSCRIPT_EXTENSIONS = [".txt", ".csv", ".json"]

# Logging level
LOG_LEVEL = "INFO"
