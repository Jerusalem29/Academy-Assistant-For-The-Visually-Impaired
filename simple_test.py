#!/usr/bin/env python3
"""
Simple test script to check Python environment and dataset structure
"""

import os
import sys
from pathlib import Path

def check_python_environment():
    """Check Python environment and installed packages"""
    print("🔍 Checking Python Environment...")
    print(f"Python version: {sys.version}")
    print(f"Python path: {sys.executable}")
    
    # Check basic packages
    packages_to_check = ['torch', 'transformers', 'datasets', 'librosa', 'pandas', 'matplotlib']
    
    for package in packages_to_check:
        try:
            __import__(package)
            print(f"✅ {package}: installed")
        except ImportError:
            print(f"❌ {package}: NOT installed")
    
    print()

def check_dataset_paths():
    """Check if dataset paths exist"""
    print("🔍 Checking Dataset Paths...")
    
    # Import config
    try:
        import config
        print("✅ config.py loaded successfully")
        
        for lang_code, path in config.DATASET_PATHS.items():
            lang_name = config.LANGUAGES.get(lang_code, lang_code)
            if os.path.exists(path):
                print(f"✅ {lang_name}: {path} - EXISTS")
                
                # Count files
                path_obj = Path(path)
                audio_files = list(path_obj.rglob("*.wav"))
                audio_files.extend(list(path_obj.rglob("*.mp3")))
                transcript_files = list(path_obj.rglob("*.txt"))
                transcript_files.extend(list(path_obj.rglob("*.csv")))
                transcript_files.extend(list(path_obj.rglob("*.json")))
                
                print(f"   📁 Audio files: {len(audio_files)}")
                print(f"   📝 Transcript files: {len(transcript_files)}")
                
                if len(audio_files) > 0:
                    print(f"   🎵 Sample audio: {audio_files[0].relative_to(path_obj)}")
                if len(transcript_files) > 0:
                    print(f"   📄 Sample transcript: {transcript_files[0].relative_to(path_obj)}")
                    
            else:
                print(f"❌ {lang_name}: {path} - NOT FOUND")
                
    except ImportError as e:
        print(f"❌ Failed to import config.py: {e}")
    
    print()

def create_sample_dataset_structure():
    """Create sample dataset structure for testing"""
    print("🔧 Creating sample dataset structure...")
    
    base_dir = Path("./datasets")
    base_dir.mkdir(exist_ok=True)
    
    # Create sample directories
    for lang in ["a-publicly-available-ao-asr-dataset-partialAfaan", "amharic-speech-corpus", "english-stt"]:
        lang_dir = base_dir / lang
        lang_dir.mkdir(exist_ok=True)
        
        # Create sample files
        (lang_dir / "audio").mkdir(exist_ok=True)
        (lang_dir / "transcripts").mkdir(exist_ok=True)
        
        # Create sample transcript
        with open(lang_dir / "transcripts" / "transcript.txt", 'w') as f:
            f.write("sample1.wav|Hello world\n")
            f.write("sample2.wav|How are you\n")
        
        print(f"✅ Created sample structure for {lang}")
    
    print("📁 Sample dataset structure created in ./datasets/")
    print("📝 You can now place your actual dataset files in these directories")

def main():
    print("="*60)
    print("SIMPLE ENVIRONMENT AND DATASET TEST")
    print("="*60)
    
    check_python_environment()
    check_dataset_paths()
    
    # If datasets don't exist, offer to create structure
    try:
        import config
        missing_paths = [path for path in config.DATASET_PATHS.values() if not os.path.exists(path)]
        
        if missing_paths:
            print("⚠️  Some dataset paths are missing!")
            print("Would you like to create a sample directory structure? (y/n)")
            
            # Auto-create for now
            create_sample_dataset_structure()
            
    except ImportError:
        print("⚠️  Cannot check dataset paths - config.py not found")
        create_sample_dataset_structure()
    
    print("\n🎯 Next Steps:")
    print("1. Install missing packages: pip install pandas matplotlib seaborn tqdm")
    print("2. Download your Kaggle datasets to the ./datasets/ folder")
    print("3. Update config.py with correct paths")
    print("4. Run: python test_dataset_structure.py")

if __name__ == "__main__":
    main()
