#!/usr/bin/env python3
"""
Data Preparation Script for Multilingual Speech Recognition
Supports: Afaan Oromo, Amharic, English
"""

import os
import json
import pandas as pd
import librosa
import soundfile as sf
import numpy as np
from pathlib import Path
from datasets import Dataset, Audio
from typing import List, Dict, Tuple
import logging
from tqdm import tqdm
import warnings

warnings.filterwarnings("ignore")
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class MultilingualDataPreparer:
    def __init__(self, output_dir: str = "./multilingual_speech_dataset"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        # Language codes and names
        self.languages = {
            "af": "Afaan Oromo",
            "am": "Amharic", 
            "en": "English"
        }
        
        # Storage for all data
        self.all_data = {
            "audio": [],
            "text": [],
            "language": [],
            "language_code": [],
            "duration": [],
            "sample_rate": [],
            "dataset_source": []
        }
        
        # Audio quality thresholds
        self.min_duration = 0.5  # seconds
        self.max_duration = 30.0  # seconds
        self.min_sample_rate = 16000
        self.max_sample_rate = 48000
        
    def load_afghan_oromo_dataset(self, dataset_path: str) -> List[Dict]:
        """Load Afaan Oromo dataset from Kaggle"""
        logger.info("🔍 Loading Afaan Oromo dataset...")
        data = []
        
        # Adjust based on actual dataset structure
        dataset_path = Path(dataset_path)
        
        # Common patterns for dataset organization
        possible_patterns = [
            dataset_path / "*.wav",
            dataset_path / "audio" / "*.wav",
            dataset_path / "wav" / "*.wav",
            dataset_path / "data" / "*.wav"
        ]
        
        audio_files = []
        for pattern in possible_patterns:
            audio_files.extend(list(pattern.rglob("*.wav")))
            if audio_files:
                break
        
        # Look for transcript files
        transcript_files = list(dataset_path.rglob("*.txt"))
        transcript_files.extend(list(dataset_path.rglob("*.csv")))
        transcript_files.extend(list(dataset_path.rglob("*.json")))
        
        # Load transcripts
        transcripts = {}
        for transcript_file in transcript_files:
            try:
                if transcript_file.suffix == ".txt":
                    with open(transcript_file, 'r', encoding='utf-8') as f:
                        lines = f.readlines()
                        for line in lines:
                            if '|' in line:
                                parts = line.strip().split('|', 1)
                                if len(parts) == 2:
                                    audio_name = parts[0].strip()
                                    text = parts[1].strip()
                                    transcripts[audio_name] = text
                            elif '\t' in line:
                                parts = line.strip().split('\t', 1)
                                if len(parts) == 2:
                                    audio_name = parts[0].strip()
                                    text = parts[1].strip()
                                    transcripts[audio_name] = text
                                    
                elif transcript_file.suffix == ".csv":
                    df = pd.read_csv(transcript_file)
                    if 'filename' in df.columns and 'text' in df.columns:
                        for _, row in df.iterrows():
                            transcripts[row['filename']] = row['text']
                            
                elif transcript_file.suffix == ".json":
                    with open(transcript_file, 'r', encoding='utf-8') as f:
                        json_data = json.load(f)
                        if isinstance(json_data, list):
                            for item in json_data:
                                if 'audio' in item and 'text' in item:
                                    transcripts[item['audio']] = item['text']
                        elif isinstance(json_data, dict):
                            transcripts.update(json_data)
                            
            except Exception as e:
                logger.warning(f"Error reading {transcript_file}: {e}")
        
        # Match audio files with transcripts
        matched_count = 0
        for audio_file in tqdm(audio_files, desc="Processing Afaan Oromo audio"):
            audio_name = audio_file.stem
            
            # Try different naming conventions
            possible_names = [
                audio_name,
                audio_name.replace('_', ' '),
                audio_name.replace('-', ' '),
                audio_name.split('.')[0]
            ]
            
            for name in possible_names:
                if name in transcripts:
                    data.append({
                        "audio_path": str(audio_file),
                        "text": transcripts[name],
                        "language": "af",
                        "dataset_source": "afghan_oromo"
                    })
                    matched_count += 1
                    break
        
        logger.info(f"✅ Loaded {matched_count} Afaan Oromo samples")
        return data
    
    def load_amharic_dataset(self, dataset_path: str) -> List[Dict]:
        """Load Amharic dataset from Kaggle"""
        logger.info("🔍 Loading Amharic dataset...")
        data = []
        
        dataset_path = Path(dataset_path)
        
        # Look for audio files
        audio_files = list(dataset_path.rglob("*.wav"))
        audio_files.extend(list(dataset_path.rglob("*.mp3")))
        
        # Look for transcript files
        transcript_files = list(dataset_path.rglob("*.txt"))
        transcript_files.extend(list(dataset_path.rglob("*.csv")))
        transcript_files.extend(list(dataset_path.rglob("*.json")))
        
        # Load transcripts
        transcripts = {}
        for transcript_file in transcript_files:
            try:
                if transcript_file.suffix == ".txt":
                    with open(transcript_file, 'r', encoding='utf-8') as f:
                        lines = f.readlines()
                        for line in lines:
                            if '|' in line:
                                parts = line.strip().split('|', 1)
                                if len(parts) == 2:
                                    audio_name = parts[0].strip()
                                    text = parts[1].strip()
                                    transcripts[audio_name] = text
                            elif '\t' in line:
                                parts = line.strip().split('\t', 1)
                                if len(parts) == 2:
                                    audio_name = parts[0].strip()
                                    text = parts[1].strip()
                                    transcripts[audio_name] = text
                                    
                elif transcript_file.suffix == ".csv":
                    df = pd.read_csv(transcript_file)
                    if 'filename' in df.columns and 'text' in df.columns:
                        for _, row in df.iterrows():
                            transcripts[row['filename']] = row['text']
                    elif 'audio' in df.columns and 'transcript' in df.columns:
                        for _, row in df.iterrows():
                            transcripts[row['audio']] = row['transcript']
                            
                elif transcript_file.suffix == ".json":
                    with open(transcript_file, 'r', encoding='utf-8') as f:
                        json_data = json.load(f)
                        if isinstance(json_data, list):
                            for item in json_data:
                                audio_key = item.get('audio') or item.get('filename') or item.get('path')
                                text_key = item.get('text') or item.get('transcript') or item.get('sentence')
                                if audio_key and text_key:
                                    transcripts[audio_key] = text_key
                        elif isinstance(json_data, dict):
                            transcripts.update(json_data)
                            
            except Exception as e:
                logger.warning(f"Error reading {transcript_file}: {e}")
        
        # Match audio files with transcripts
        matched_count = 0
        for audio_file in tqdm(audio_files, desc="Processing Amharic audio"):
            audio_name = audio_file.stem
            
            possible_names = [
                audio_name,
                audio_name.replace('_', ' '),
                audio_name.replace('-', ' '),
                audio_name.split('.')[0]
            ]
            
            for name in possible_names:
                if name in transcripts:
                    data.append({
                        "audio_path": str(audio_file),
                        "text": transcripts[name],
                        "language": "am",
                        "dataset_source": "amharic_corpus"
                    })
                    matched_count += 1
                    break
        
        logger.info(f"✅ Loaded {matched_count} Amharic samples")
        return data
    
    def load_english_dataset(self, dataset_path: str) -> List[Dict]:
        """Load English dataset from Kaggle"""
        logger.info("🔍 Loading English dataset...")
        data = []
        
        dataset_path = Path(dataset_path)
        
        # Look for audio files
        audio_files = list(dataset_path.rglob("*.wav"))
        audio_files.extend(list(dataset_path.rglob("*.mp3")))
        audio_files.extend(list(dataset_path.rglob("*.flac")))
        
        # Look for transcript files
        transcript_files = list(dataset_path.rglob("*.txt"))
        transcript_files.extend(list(dataset_path.rglob("*.csv")))
        transcript_files.extend(list(dataset_path.rglob("*.json")))
        
        # Load transcripts
        transcripts = {}
        for transcript_file in transcript_files:
            try:
                if transcript_file.suffix == ".txt":
                    with open(transcript_file, 'r', encoding='utf-8') as f:
                        lines = f.readlines()
                        for line in lines:
                            if '|' in line:
                                parts = line.strip().split('|', 1)
                                if len(parts) == 2:
                                    audio_name = parts[0].strip()
                                    text = parts[1].strip()
                                    transcripts[audio_name] = text
                            elif '\t' in line:
                                parts = line.strip().split('\t', 1)
                                if len(parts) == 2:
                                    audio_name = parts[0].strip()
                                    text = parts[1].strip()
                                    transcripts[audio_name] = text
                            elif ' ' in line and len(line.strip().split()) > 1:
                                # If it's just text without filename, use index
                                parts = line.strip().split(maxsplit=1)
                                if len(parts) >= 2:
                                    transcripts[f"sample_{len(transcripts)}"] = line.strip()
                                    
                elif transcript_file.suffix == ".csv":
                    df = pd.read_csv(transcript_file)
                    filename_col = None
                    text_col = None
                    
                    for col in df.columns:
                        col_lower = col.lower()
                        if 'filename' in col_lower or 'audio' in col_lower or 'path' in col_lower:
                            filename_col = col
                        elif 'text' in col_lower or 'transcript' in col_lower or 'sentence' in col_lower:
                            text_col = col
                    
                    if filename_col and text_col:
                        for _, row in df.iterrows():
                            transcripts[row[filename_col]] = row[text_col]
                            
                elif transcript_file.suffix == ".json":
                    with open(transcript_file, 'r', encoding='utf-8') as f:
                        json_data = json.load(f)
                        if isinstance(json_data, list):
                            for item in json_data:
                                audio_key = item.get('audio') or item.get('filename') or item.get('path')
                                text_key = item.get('text') or item.get('transcript') or item.get('sentence')
                                if audio_key and text_key:
                                    transcripts[audio_key] = text_key
                        elif isinstance(json_data, dict):
                            transcripts.update(json_data)
                            
            except Exception as e:
                logger.warning(f"Error reading {transcript_file}: {e}")
        
        # Match audio files with transcripts
        matched_count = 0
        for audio_file in tqdm(audio_files, desc="Processing English audio"):
            audio_name = audio_file.stem
            
            possible_names = [
                audio_name,
                audio_name.replace('_', ' '),
                audio_name.replace('-', ' '),
                audio_name.split('.')[0]
            ]
            
            for name in possible_names:
                if name in transcripts:
                    data.append({
                        "audio_path": str(audio_file),
                        "text": transcripts[name],
                        "language": "en",
                        "dataset_source": "english_stt"
                    })
                    matched_count += 1
                    break
        
        logger.info(f"✅ Loaded {matched_count} English samples")
        return data
    
    def validate_audio_quality(self, audio_path: str) -> Tuple[bool, str, Dict]:
        """Validate audio file quality"""
        try:
            # Load audio
            audio, sr = librosa.load(audio_path, sr=None)
            duration = len(audio) / sr
            
            # Quality checks
            if duration < self.min_duration:
                return False, f"Duration {duration:.2f}s below minimum {self.min_duration}s", {}
            if duration > self.max_duration:
                return False, f"Duration {duration:.2f}s above maximum {self.max_duration}s", {}
            
            # Check sample rate
            if sr < self.min_sample_rate or sr > self.max_sample_rate:
                return False, f"Sample rate {sr}Hz out of range [{self.min_sample_rate}, {self.max_sample_rate}]", {}
            
            # Check for silence
            rms = np.sqrt(np.mean(audio**2))
            if rms < 0.01:
                return False, f"Audio too quiet (RMS: {rms:.4f})", {}
            
            # Check for clipping
            if np.any(np.abs(audio) > 0.99):
                return False, "Audio clipped", {}
            
            # Return audio info
            return True, "Valid audio", {
                "duration": duration,
                "sample_rate": sr,
                "rms": rms,
                "channels": 1 if audio.ndim == 1 else audio.shape[0]
            }
            
        except Exception as e:
            return False, f"Error loading audio: {e}", {}
    
    def process_audio_file(self, audio_path: str, text: str, language: str, dataset_source: str) -> bool:
        """Process individual audio file"""
        # Validate audio
        is_valid, message, audio_info = self.validate_audio_quality(audio_path)
        
        if not is_valid:
            logger.debug(f"Skipping {audio_path}: {message}")
            return False
        
        # Add to dataset
        self.all_data["audio"].append(audio_path)
        self.all_data["text"].append(text.strip())
        self.all_data["language"].append(self.languages[language])
        self.all_data["language_code"].append(language)
        self.all_data["duration"].append(audio_info["duration"])
        self.all_data["sample_rate"].append(audio_info["sample_rate"])
        self.all_data["dataset_source"].append(dataset_source)
        
        return True
    
    def prepare_multilingual_dataset(self, dataset_paths: Dict[str, str]) -> Dataset:
        """Prepare complete multilingual dataset"""
        logger.info("🚀 Starting multilingual dataset preparation...")
        
        # Process each language
        for lang_code, dataset_path in dataset_paths.items():
            if not os.path.exists(dataset_path):
                logger.warning(f"⚠️ Dataset path not found: {dataset_path}")
                continue
            
            logger.info(f"📊 Processing {self.languages.get(lang_code, lang_code)} dataset...")
            
            # Load language-specific dataset
            if lang_code == "af":
                lang_data = self.load_afghan_oromo_dataset(dataset_path)
            elif lang_code == "am":
                lang_data = self.load_amharic_dataset(dataset_path)
            elif lang_code == "en":
                lang_data = self.load_english_dataset(dataset_path)
            else:
                logger.warning(f"Unsupported language code: {lang_code}")
                continue
            
            # Process audio files
            valid_count = 0
            for item in tqdm(lang_data, desc=f"Validating {lang_code} audio"):
                if self.process_audio_file(
                    item["audio_path"], 
                    item["text"], 
                    item["language"], 
                    item["dataset_source"]
                ):
                    valid_count += 1
            
            logger.info(f"✅ {self.languages.get(lang_code, lang_code)}: {valid_count}/{len(lang_data)} valid samples")
        
        # Create dataset
        logger.info("📦 Creating Hugging Face dataset...")
        
        if not self.all_data["audio"]:
            raise ValueError("No valid audio files found!")
        
        dataset = Dataset.from_dict(self.all_data)
        
        # Add audio feature
        dataset = dataset.cast_column("audio", Audio())
        
        # Save dataset statistics
        self.save_dataset_statistics(dataset)
        
        # Save dataset
        dataset.save_to_disk(str(self.output_dir))
        
        logger.info(f"✅ Dataset saved to {self.output_dir}")
        logger.info(f"📊 Total samples: {len(dataset)}")
        
        return dataset
    
    def save_dataset_statistics(self, dataset: Dataset):
        """Save dataset statistics"""
        stats = {
            "total_samples": len(dataset),
            "languages": {},
            "duration_stats": {},
            "sample_rates": {}
        }
        
        # Language distribution
        lang_counts = {}
        for lang_code in dataset["language_code"]:
            lang_counts[lang_code] = lang_counts.get(lang_code, 0) + 1
        
        for lang_code, count in lang_counts.items():
            stats["languages"][self.languages.get(lang_code, lang_code)] = {
                "code": lang_code,
                "count": count,
                "percentage": (count / len(dataset)) * 100
            }
        
        # Duration statistics
        durations = dataset["duration"]
        stats["duration_stats"] = {
            "min": min(durations),
            "max": max(durations),
            "mean": np.mean(durations),
            "median": np.median(durations),
            "std": np.std(durations)
        }
        
        # Sample rate distribution
        sr_counts = {}
        for sr in dataset["sample_rate"]:
            sr_counts[sr] = sr_counts.get(sr, 0) + 1
        
        stats["sample_rates"] = sr_counts
        
        # Save statistics
        stats_path = self.output_dir / "dataset_statistics.json"
        with open(stats_path, 'w', encoding='utf-8') as f:
            json.dump(stats, f, indent=2, ensure_ascii=False)
        
        logger.info(f"📈 Dataset statistics saved to {stats_path}")
        
        # Print summary
        print("\n" + "="*50)
        print("DATASET SUMMARY")
        print("="*50)
        print(f"Total samples: {stats['total_samples']}")
        print("\nLanguage distribution:")
        for lang_name, lang_info in stats["languages"].items():
            print(f"  {lang_name}: {lang_info['count']} ({lang_info['percentage']:.1f}%)")
        print(f"\nDuration: {stats['duration_stats']['min']:.1f}s - {stats['duration_stats']['max']:.1f}s")
        print(f"Mean duration: {stats['duration_stats']['mean']:.1f}s")
        print("="*50)

def main():
    """Main execution function"""
    # Import config
    try:
        from config import DATASET_PATHS, LANGUAGES
        dataset_paths = DATASET_PATHS
    except ImportError:
        logger.error("❌ config.py not found. Please create it first.")
        return
    
    # Initialize preparer
    preparer = MultilingualDataPreparer()
    
    try:
        # Prepare dataset
        dataset = preparer.prepare_multilingual_dataset(dataset_paths)
        
        print("\n🎉 Dataset preparation completed successfully!")
        print(f"📁 Dataset saved to: {preparer.output_dir}")
        print("📊 Check dataset_statistics.json for detailed information")
        
    except Exception as e:
        logger.error(f"❌ Dataset preparation failed: {e}")
        raise

if __name__ == "__main__":
    main()
