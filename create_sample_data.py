#!/usr/bin/env python3
"""
Create sample audio and transcript data for testing
"""

import os
import numpy as np
import soundfile as sf
from pathlib import Path

def create_sample_audio():
    """Create sample audio files for testing"""
    print("🎵 Creating sample audio files...")
    
    # Sample data paths
    base_dir = Path("./datasets")
    
    # Sample audio data (simple sine waves)
    sample_rate = 16000
    duration = 2.0  # seconds
    
    # Create sample for each language
    samples = {
        "a-publicly-available-ao-asr-dataset-partialAfaan": [
            ("sample1.wav", "Akkam badi", "Hello"),
            ("sample2.wav", "Galatoomi", "Thank you"),
            ("sample3.wav", "Fayya", "Goodbye")
        ],
        "amharic-speech-corpus": [
            ("sample1.wav", "ሰላም", "Hello"),
            ("sample2.wav", "አመሰግክም", "Thank you"),
            ("sample3.wav", "ደማይ", "Goodbye")
        ],
        "english-stt": [
            ("sample1.wav", "Hello world", "Hello world"),
            ("sample2.wav", "How are you", "How are you"),
            ("sample3.wav", "Goodbye everyone", "Goodbye everyone")
        ]
    }
    
    for dataset_name, audio_files in samples.items():
        dataset_dir = base_dir / dataset_name
        audio_dir = dataset_dir / "audio"
        audio_dir.mkdir(parents=True, exist_ok=True)
        
        for filename, text, _ in audio_files:
            # Generate simple audio (sine wave)
            t = np.linspace(0, duration, int(sample_rate * duration), False)
            frequency = 440 + np.random.randint(-100, 100)  # Random frequency
            audio = 0.3 * np.sin(2 * np.pi * frequency * t)
            
            # Add some noise to make it more realistic
            noise = 0.01 * np.random.randn(len(audio))
            audio = audio + noise
            
            # Save audio file
            audio_path = audio_dir / filename
            sf.write(audio_path, audio, sample_rate)
            print(f"✅ Created: {audio_path}")
    
    print("🎵 Sample audio files created!")

def create_sample_transcripts():
    """Create sample transcript files"""
    print("📝 Creating sample transcript files...")
    
    base_dir = Path("./datasets")
    
    samples = {
        "a-publicly-available-ao-asr-dataset-partialAfaan": [
            "sample1.wav|Akkam badi\n",
            "sample2.wav|Galatoomi\n",
            "sample3.wav|Fayya\n"
        ],
        "amharic-speech-corpus": [
            "sample1.wav|ሰላም\n",
            "sample2.wav|አመሰግክም\n",
            "sample3.wav|ደማይ\n"
        ],
        "english-stt": [
            "sample1.wav|Hello world\n",
            "sample2.wav|How are you\n",
            "sample3.wav|Goodbye everyone\n"
        ]
    }
    
    for dataset_name, transcripts in samples.items():
        dataset_dir = base_dir / dataset_name
        transcript_dir = dataset_dir / "transcripts"
        transcript_dir.mkdir(parents=True, exist_ok=True)
        
        # Create TXT transcript
        txt_file = transcript_dir / "transcript.txt"
        with open(txt_file, 'w', encoding='utf-8') as f:
            f.writelines(transcripts)
        print(f"✅ Created: {txt_file}")
        
        # Create CSV transcript
        csv_file = transcript_dir / "transcript.csv"
        with open(csv_file, 'w', encoding='utf-8', newline='') as f:
            f.write("filename,text\n")
            for line in transcripts:
                parts = line.strip().split('|', 1)
                if len(parts) == 2:
                    f.write(f"{parts[0]},{parts[1]}\n")
        print(f"✅ Created: {csv_file}")
        
        # Create JSON transcript
        json_file = transcript_dir / "transcript.json"
        import json
        json_data = []
        for line in transcripts:
            parts = line.strip().split('|', 1)
            if len(parts) == 2:
                json_data.append({
                    "audio": parts[0],
                    "text": parts[1]
                })
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(json_data, f, indent=2, ensure_ascii=False)
        print(f"✅ Created: {json_file}")
    
    print("📝 Sample transcript files created!")

def main():
    print("🎯 Creating Sample Dataset for Testing")
    print("="*50)
    
    create_sample_audio()
    create_sample_transcripts()
    
    print("\n✅ Sample dataset created successfully!")
    print("📁 Location: ./datasets/")
    print("🎯 Now you can test the pipeline:")
    print("   python test_dataset_structure.py")
    print("   python prepare_dataset.py")
    print("   python train_whisper_multilingual.py")

if __name__ == "__main__":
    main()
