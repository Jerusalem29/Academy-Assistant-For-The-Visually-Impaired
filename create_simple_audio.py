#!/usr/bin/env python3
"""
Create simple audio files without numpy dependency
"""

import os
import wave
import struct
from pathlib import Path

def create_simple_wav(filename, frequency=440, duration=2.0, sample_rate=16000):
    """Create a simple WAV file with sine wave"""
    
    # Calculate number of samples
    num_samples = int(sample_rate * duration)
    
    # Generate sine wave data (simple approach without numpy)
    audio_data = []
    for i in range(num_samples):
        # Simple sine wave calculation
        t = i / sample_rate
        value = int(32767 * 0.3 * (2 ** 15 - 1) * 0.5 * (1 + (4 * t * frequency - int(4 * t * frequency)) / (4 * t * frequency)))
        audio_data.append(value)
    
    # Create WAV file
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(sample_rate)
        
        # Convert to bytes
        byte_data = struct.pack('<' + 'h' * len(audio_data), *audio_data)
        wav_file.writeframes(byte_data)

def main():
    print("🎵 Creating simple audio files...")
    
    base_dir = Path("./datasets")
    
    samples = {
        "a-publicly-available-ao-asr-dataset-partialAfaan": [
            ("sample1.wav", "Akkam badi"),
            ("sample2.wav", "Galatoomi"),
            ("sample3.wav", "Fayya")
        ],
        "amharic-speech-corpus": [
            ("sample1.wav", "ሰላም"),
            ("sample2.wav", "አመሰግክም"),
            ("sample3.wav", "ደማይ")
        ],
        "english-stt": [
            ("sample1.wav", "Hello world"),
            ("sample2.wav", "How are you"),
            ("sample3.wav", "Goodbye everyone")
        ]
    }
    
    for dataset_name, audio_files in samples.items():
        dataset_dir = base_dir / dataset_name
        audio_dir = dataset_dir / "audio"
        audio_dir.mkdir(parents=True, exist_ok=True)
        
        for filename, text in audio_files:
            audio_path = audio_dir / filename
            create_simple_wav(str(audio_path))
            print(f"✅ Created: {audio_path}")
    
    print("🎵 Simple audio files created!")
    print("📝 Now you have audio files to test the pipeline!")

if __name__ == "__main__":
    main()
