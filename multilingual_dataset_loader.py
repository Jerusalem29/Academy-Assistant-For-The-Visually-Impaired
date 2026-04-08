#!/usr/bin/env python3
"""
Multilingual Dataset Loader for Whisper Training
Supports Afaan Oromo, Amharic, and English datasets
"""

import json
import os
import logging
import numpy as np
from pathlib import Path
from typing import Dict, List, Tuple, Optional
import torch
from dataclasses import dataclass

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class AudioSample:
    """Audio sample data structure"""
    audio_path: str
    text: str
    language: str
    duration: float
    sample_rate: int = 16000

class MultilingualDatasetLoader:
    def __init__(self, dataset_base_dir: str = "./working_kaggle_datasets"):
        self.dataset_base_dir = Path(dataset_base_dir)
        self.languages = ['afaan_oromo', 'amharic', 'english']
        self.language_codes = {
            'afaan_oromo': 'om',
            'amharic': 'am', 
            'english': 'en'
        }
        
    def load_language_dataset(self, language: str) -> Tuple[List[AudioSample], List[AudioSample]]:
        """Load dataset for a specific language"""
        logger.info(f"Loading {language} dataset...")
        
        language_dir = self.dataset_base_dir / language
        if not language_dir.exists():
            logger.error(f"Dataset directory not found: {language_dir}")
            return [], []
        
        # Load training data
        train_samples = []
        train_dir = language_dir / "train"
        if train_dir.exists():
            for json_file in train_dir.glob("*.json"):
                try:
                    with open(json_file, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    
                    sample = AudioSample(
                        audio_path=str(json_file.parent / data.get('audio_path', '')),
                        text=data.get('text', ''),
                        language=language,
                        duration=data.get('duration', 0.0)
                    )
                    train_samples.append(sample)
                    
                except Exception as e:
                    logger.error(f"Error loading {json_file}: {e}")
        
        # Load test data
        test_samples = []
        test_dir = language_dir / "test"
        if test_dir.exists():
            for json_file in test_dir.glob("*.json"):
                try:
                    with open(json_file, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    
                    sample = AudioSample(
                        audio_path=str(json_file.parent / data.get('audio_path', '')),
                        text=data.get('text', ''),
                        language=language,
                        duration=data.get('duration', 0.0)
                    )
                    test_samples.append(sample)
                    
                except Exception as e:
                    logger.error(f"Error loading {json_file}: {e}")
        
        logger.info(f"Loaded {language}: Train={len(train_samples)}, Test={len(test_samples)}")
        return train_samples, test_samples
    
    def load_all_datasets(self) -> Dict[str, Tuple[List[AudioSample], List[AudioSample]]]:
        """Load all multilingual datasets"""
        logger.info("Loading all multilingual datasets...")
        
        datasets = {}
        total_train = 0
        total_test = 0
        
        for language in self.languages:
            train_samples, test_samples = self.load_language_dataset(language)
            datasets[language] = (train_samples, test_samples)
            total_train += len(train_samples)
            total_test += len(test_samples)
        
        logger.info(f"Total datasets loaded: Train={total_train}, Test={total_test}")
        logger.info(f"Languages: {', '.join(self.languages)}")
        
        return datasets
    
    def create_dummy_audio(self, duration: float, sample_rate: int = 16000) -> np.ndarray:
        """Create dummy audio data for testing"""
        num_samples = int(duration * sample_rate)
        # Generate random audio with some structure
        audio_data = np.random.randn(num_samples).astype(np.float32) * 0.1
        # Add some sine wave components for more realistic audio
        t = np.linspace(0, duration, num_samples)
        audio_data += 0.05 * np.sin(2 * np.pi * 440 * t)  # 440 Hz tone
        audio_data += 0.03 * np.sin(2 * np.pi * 880 * t)  # 880 Hz tone
        return audio_data
    
    def load_audio_file(self, audio_path: str, duration: float) -> np.ndarray:
        """Load audio file or create dummy data"""
        try:
            # Try to load actual audio file
            if os.path.exists(audio_path):
                try:
                    import soundfile as sf
                    audio_data, sr = sf.read(audio_path)
                    if sr != 16000:
                        # Resample to 16kHz if needed
                        audio_data = self.resample_audio(audio_data, sr, 16000)
                    return audio_data.astype(np.float32)
                except ImportError:
                    try:
                        from scipy.io import wavfile
                        sr, audio_data = wavfile.read(audio_path)
                        if sr != 16000:
                            audio_data = self.resample_audio(audio_data, sr, 16000)
                        return audio_data.astype(np.float32)
                    except ImportError:
                        logger.warning("Audio loading libraries not available, using dummy data")
            
            # Create dummy audio if file doesn't exist or libraries not available
            return self.create_dummy_audio(duration)
            
        except Exception as e:
            logger.error(f"Error loading audio {audio_path}: {e}")
            return self.create_dummy_audio(duration)
    
    def resample_audio(self, audio_data: np.ndarray, original_sr: int, target_sr: int) -> np.ndarray:
        """Resample audio to target sample rate"""
        try:
            import librosa
            return librosa.resample(audio_data, orig_sr=original_sr, target_sr=target_sr)
        except ImportError:
            # Simple linear interpolation as fallback
            duration = len(audio_data) / original_sr
            target_length = int(duration * target_sr)
            indices = np.linspace(0, len(audio_data) - 1, target_length)
            return np.interp(indices, np.arange(len(audio_data)), audio_data)
    
    def prepare_dataset_for_training(self, datasets: Dict, processor) -> Tuple[List[Dict], List[Dict]]:
        """Prepare dataset for Whisper training"""
        logger.info("Preparing datasets for Whisper training...")
        
        train_data = []
        test_data = []
        
        for language, (train_samples, test_samples) in datasets.items():
            logger.info(f"Processing {language} samples...")
            
            # Process training samples
            for sample in train_samples:
                try:
                    # Load audio
                    audio_data = self.load_audio_file(sample.audio_path, sample.duration)
                    
                    # Process with Whisper processor
                    inputs = processor(
                        audio=audio_data,
                        text=sample.text,
                        sampling_rate=16000,
                        return_tensors="pt",
                        padding=True,
                        truncation=True,
                        max_length=448
                    )
                    
                    # Set language for multilingual processing
                    inputs["labels"] = inputs["input_ids"].clone()
                    del inputs["input_ids"]
                    inputs["language"] = self.language_codes[language]
                    
                    train_data.append(inputs)
                    
                except Exception as e:
                    logger.error(f"Error processing training sample: {e}")
                    continue
            
            # Process test samples
            for sample in test_samples:
                try:
                    # Load audio
                    audio_data = self.load_audio_file(sample.audio_path, sample.duration)
                    
                    # Process with Whisper processor
                    inputs = processor(
                        audio=audio_data,
                        text=sample.text,
                        sampling_rate=16000,
                        return_tensors="pt",
                        padding=True,
                        truncation=True,
                        max_length=448
                    )
                    
                    # Set language for multilingual processing
                    inputs["labels"] = inputs["input_ids"].clone()
                    del inputs["input_ids"]
                    inputs["language"] = self.language_codes[language]
                    
                    test_data.append(inputs)
                    
                except Exception as e:
                    logger.error(f"Error processing test sample: {e}")
                    continue
        
        logger.info(f"Dataset preparation complete: Train={len(train_data)}, Test={len(test_data)}")
        return train_data, test_data
    
    def get_dataset_statistics(self, datasets: Dict) -> Dict:
        """Get statistics about the loaded datasets"""
        stats = {}
        total_train = 0
        total_test = 0
        total_duration = 0
        
        for language, (train_samples, test_samples) in datasets.items():
            train_count = len(train_samples)
            test_count = len(test_samples)
            train_duration = sum(s.duration for s in train_samples)
            test_duration = sum(s.duration for s in test_samples)
            
            stats[language] = {
                'train_samples': train_count,
                'test_samples': test_count,
                'train_duration': train_duration,
                'test_duration': test_duration,
                'avg_train_duration': train_duration / train_count if train_count > 0 else 0,
                'avg_test_duration': test_duration / test_count if test_count > 0 else 0
            }
            
            total_train += train_count
            total_test += test_count
            total_duration += train_duration + test_duration
        
        stats['total'] = {
            'train_samples': total_train,
            'test_samples': total_test,
            'total_samples': total_train + total_test,
            'total_duration': total_duration
        }
        
        return stats

def main():
    """Test the multilingual dataset loader"""
    loader = MultilingualDatasetLoader()
    
    try:
        # Load all datasets
        datasets = loader.load_all_datasets()
        
        # Get statistics
        stats = loader.get_dataset_statistics(datasets)
        
        print("\n" + "=" * 60)
        print("MULTILINGUAL DATASET STATISTICS")
        print("=" * 60)
        
        for language, data in stats.items():
            if language != 'total':
                print(f"\n{language.upper()}:")
                print(f"  Train samples: {data['train_samples']}")
                print(f"  Test samples: {data['test_samples']}")
                print(f"  Train duration: {data['train_duration']:.2f}s")
                print(f"  Test duration: {data['test_duration']:.2f}s")
                print(f"  Avg train duration: {data['avg_train_duration']:.2f}s")
        
        print(f"\nTOTAL:")
        print(f"  Total samples: {stats['total']['total_samples']}")
        print(f"  Total duration: {stats['total']['total_duration']:.2f}s")
        print("=" * 60)
        
        return datasets
        
    except Exception as e:
        logger.error(f"Dataset loader test failed: {e}")
        raise

if __name__ == "__main__":
    main()
