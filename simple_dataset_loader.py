#!/usr/bin/env python3
"""
Simple Multilingual Dataset Loader - No heavy dependencies
"""

import json
import os
import logging
from pathlib import Path
from typing import Dict, List, Tuple
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

class SimpleMultilingualDatasetLoader:
    def __init__(self, dataset_base_dir: str = "./kaggle_datasets"):
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
    """Test the simple multilingual dataset loader"""
    loader = SimpleMultilingualDatasetLoader()
    
    try:
        # Load all datasets
        datasets = loader.load_all_datasets()
        
        # Get statistics
        stats = loader.get_dataset_statistics(datasets)
        
        print("\n" + "=" * 60)
        print("SIMPLE MULTILINGUAL DATASET STATISTICS")
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
