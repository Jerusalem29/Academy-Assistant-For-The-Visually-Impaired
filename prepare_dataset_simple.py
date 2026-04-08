#!/usr/bin/env python3
"""
Simplified Dataset Preparation - Skip Audio Validation
"""

import os
import json
from pathlib import Path
from datasets import Dataset, Audio
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def prepare_simple_dataset():
    """Prepare dataset without audio validation"""
    logger.info("🚀 Starting simplified dataset preparation...")
    
    base_dir = Path("./datasets")
    
    # Collect all data
    all_data = {
        "audio": [],
        "text": [],
        "language": [],
        "language_code": [],
        "dataset_source": []
    }
    
    languages = {
        "af": "Afaan Oromo",
        "am": "Amharic", 
        "en": "English"
    }
    
    for lang_code, lang_name in languages.items():
        if lang_code == "af":
            dataset_dir = base_dir / "a-publicly-available-ao-asr-dataset-partialAfaan"
        elif lang_code == "am":
            dataset_dir = base_dir / "amharic-speech-corpus"
        else:
            dataset_dir = base_dir / "english-stt"
        
        audio_dir = dataset_dir / "audio"
        transcript_file = dataset_dir / "transcripts" / "transcript.txt"
        
        logger.info(f"📊 Processing {lang_name}...")
        
        if not audio_dir.exists():
            logger.warning(f"⚠️ Audio directory not found: {audio_dir}")
            continue
        
        if not transcript_file.exists():
            logger.warning(f"⚠️ Transcript file not found: {transcript_file}")
            continue
        
        # Load transcripts
        transcripts = {}
        try:
            with open(transcript_file, 'r', encoding='utf-8') as f:
                for line in f:
                    if '|' in line:
                        parts = line.strip().split('|', 1)
                        if len(parts) == 2:
                            audio_name = parts[0].strip()
                            text = parts[1].strip()
                            transcripts[audio_name] = text
        except Exception as e:
            logger.warning(f"⚠️ Error reading transcripts: {e}")
            continue
        
        # Match audio files with transcripts
        audio_files = list(audio_dir.glob("*.wav"))
        
        for audio_file in audio_files:
            audio_name = audio_file.name
            
            if audio_name in transcripts:
                all_data["audio"].append(str(audio_file))
                all_data["text"].append(transcripts[audio_name])
                all_data["language"].append(lang_name)
                all_data["language_code"].append(lang_code)
                all_data["dataset_source"].append(f"sample_{lang_code}")
                
                logger.info(f"✅ Added: {audio_name} -> {transcripts[audio_name]}")
            else:
                logger.warning(f"⚠️ No transcript found for {audio_name}")
    
    # Create dataset
    if not all_data["audio"]:
        logger.error("❌ No data collected!")
        return False
    
    logger.info(f"📦 Creating Hugging Face dataset with {len(all_data['audio'])} samples...")
    
    dataset = Dataset.from_dict(all_data)
    dataset = dataset.cast_column("audio", Audio())
    
    # Save dataset
    output_dir = Path("./multilingual_speech_dataset")
    output_dir.mkdir(exist_ok=True)
    
    dataset.save_to_disk(str(output_dir))
    
    # Save statistics
    stats = {
        "total_samples": len(all_data["audio"]),
        "languages": {},
        "samples": list(zip(all_data["language"], all_data["text"]))
    }
    
    for lang_code in languages.keys():
        count = sum(1 for lc in all_data["language_code"] if lc == lang_code)
        if count > 0:
            stats["languages"][languages[lang_code]] = {
                "code": lang_code,
                "count": count,
                "percentage": (count / len(all_data["audio"])) * 100
            }
    
    stats_file = output_dir / "dataset_statistics.json"
    with open(stats_file, 'w', encoding='utf-8') as f:
        json.dump(stats, f, indent=2, ensure_ascii=False)
    
    logger.info(f"✅ Dataset saved to {output_dir}")
    logger.info(f"📊 Total samples: {len(all_data['audio'])}")
    
    # Print summary
    print("\n" + "="*50)
    print("DATASET PREPARATION COMPLETE")
    print("="*50)
    print(f"Total samples: {len(all_data['audio'])}")
    print("\nLanguage distribution:")
    for lang_name, lang_info in stats["languages"].items():
        print(f"  {lang_name}: {lang_info['count']} ({lang_info['percentage']:.1f}%)")
    print("="*50)
    
    return True

def main():
    try:
        success = prepare_simple_dataset()
        if success:
            print("\n🎉 Dataset preparation completed successfully!")
            print("📁 Dataset saved to: ./multilingual_speech_dataset")
            print("🚀 Ready for training!")
            print("\nNext step: C:/users/hp/appdata/local/programs/python/python310/python.exe train_whisper_multilingual.py")
        else:
            print("\n❌ Dataset preparation failed!")
            
    except Exception as e:
        logger.error(f"❌ Error: {e}")
        print(f"\n❌ Dataset preparation failed: {e}")

if __name__ == "__main__":
    main()
