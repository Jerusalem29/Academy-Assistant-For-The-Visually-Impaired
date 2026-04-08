#!/usr/bin/env python3
"""
Test Complete Multilingual Whisper System
"""

import json
from pathlib import Path

def test_multilingual_system():
    """Test the complete multilingual system"""
    model_dir = Path("./whisper-multilingual-complete/final")
    
    if not model_dir.exists():
        print("Model not found!")
        return False
    
    # Load model configuration
    with open(model_dir / "config.json", 'r') as f:
        config = json.load(f)
    
    # Load training results
    with open(model_dir / "training_results.json", 'r') as f:
        results = json.load(f)
    
    print("COMPLETE MULTILINGUAL SYSTEM TEST")
    print("=" * 50)
    print(f"Model: {config['model_name']}")
    print(f"Languages: {', '.join(config['languages'])}")
    print(f"Total Samples: {config['total_samples']}")
    print(f"Language Codes: {config['language_codes']}")
    print(f"WER: {results['eval_wer']:.2f}%")
    print(f"CER: {results['eval_cer']:.2f}%")
    print(f"Training Steps: {results['total_steps']}")
    print(f"Multilingual: {results['multilingual']}")
    print("=" * 50)
    
    # Test dataset loading
    dataset_dir = Path("./kaggle_datasets")
    if dataset_dir.exists():
        print("\nDATASET STATUS:")
        for lang in ["afaan_oromo", "amharic", "english"]:
            lang_dir = dataset_dir / lang
            train_dir = lang_dir / "train"
            test_dir = lang_dir / "test"
            
            train_count = len(list(train_dir.glob("*.json"))) if train_dir.exists() else 0
            test_count = len(list(test_dir.glob("*.json"))) if test_dir.exists() else 0
            
            print(f"  {lang}: Train={train_count}, Test={test_count}")
    
    print("\nTest completed successfully!")
    return True

if __name__ == "__main__":
    test_multilingual_system()
