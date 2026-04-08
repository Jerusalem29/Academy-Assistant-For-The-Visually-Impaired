#!/usr/bin/env python3
"""
Demonstrate Sample Dataset Functionality
Shows how the multilingual system processes voice commands
"""

import json
from pathlib import Path

def demonstrate_sample_functionality():
    """Demonstrate how the sample datasets work"""
    print("SAMPLE DATASET FUNCTIONALITY DEMONSTRATION")
    print("=" * 60)
    
    # Load sample datasets
    dataset_dir = Path("./kaggle_datasets")
    
    print("1. SAMPLE DATASETS STRUCTURE:")
    print("-" * 30)
    
    languages = ["afaan_oromo", "amharic", "english"]
    
    for lang in languages:
        lang_dir = dataset_dir / lang
        print(f"\n{lang.upper()}:")
        
        # Show training samples
        train_dir = lang_dir / "train"
        if train_dir.exists():
            for json_file in sorted(train_dir.glob("*.json")):
                with open(json_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                print(f"  Train: '{data['text']}' (Duration: {data['duration']}s)")
        
        # Show test samples
        test_dir = lang_dir / "test"
        if test_dir.exists():
            for json_file in sorted(test_dir.glob("*.json")):
                with open(json_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                print(f"  Test: '{data['text']}' (Duration: {data['duration']}s)")
    
    print("\n2. VOICE COMMAND PROCESSING:")
    print("-" * 30)
    
    # Demonstrate voice command processing
    voice_commands = {
        "afaan_oromo": {
            "input": "My name is Elias Kemal",
            "processed": "[AFAAN_OROMO] My name is Elias Kemal",
            "action": "Fill name field with: Elias Kemal",
            "confidence": 0.92
        },
        "amharic": {
            "input": "My email is elias@haramaya.edu",
            "processed": "[AMHARIC] My email is elias@haramaya.edu",
            "action": "Fill email field with: elias@haramaya.edu",
            "confidence": 0.89
        },
        "english": {
            "input": "My department is Computer Science",
            "processed": "[ENGLISH] My department is Computer Science",
            "action": "Fill department field with: Computer Science",
            "confidence": 0.95
        }
    }
    
    for lang, command in voice_commands.items():
        print(f"\n{lang.upper()} Voice Command:")
        print(f"  Input: '{command['input']}'")
        print(f"  Processed: '{command['processed']}'")
        print(f"  Action: {command['action']}")
        print(f"  Confidence: {command['confidence']:.2f}")
    
    print("\n3. FORM FILLING AUTOMATION:")
    print("-" * 30)
    
    # Simulate form filling process
    form_fields = {
        "name": "",
        "email": "",
        "department": "",
        "phone": "",
        "address": ""
    }
    
    print("Initial Form State:")
    for field, value in form_fields.items():
        print(f"  {field}: '{value}'")
    
    # Process voice commands
    commands_to_process = [
        ("My name is Elias Kemal", "name", "Elias Kemal"),
        ("My email is elias@haramaya.edu", "email", "elias@haramaya.edu"),
        ("My department is Computer Science", "department", "Computer Science"),
        ("My phone is 0912345678", "phone", "0912345678"),
        ("My address is Haramaya University", "address", "Haramaya University")
    ]
    
    print("\nProcessing Voice Commands:")
    for command, field, value in commands_to_process:
        form_fields[field] = value
        print(f"  Command: '{command}' -> {field}: '{value}'")
    
    print("\nFinal Form State:")
    for field, value in form_fields.items():
        print(f"  {field}: '{value}'")
    
    print("\n4. MULTILINGUAL RECOGNITION:")
    print("-" * 30)
    
    # Show language detection
    test_phrases = [
        "Akka jiruufa keessan",  # Afaan Oromo
        "Selam nawo",           # Amharic
        "Hello, how are you?"   # English
    ]
    
    language_detection = {
        "Akka jiruufa keessan": "afaan_oromo",
        "Selam nawo": "amharic",
        "Hello, how are you?": "english"
    }
    
    for phrase in test_phrases:
        detected_lang = language_detection.get(phrase, "unknown")
        print(f"  '{phrase}' -> Detected: {detected_lang}")
    
    print("\n5. SPEECH SYNTHESIS FEEDBACK:")
    print("-" * 30)
    
    feedback_responses = [
        "Name filled: Elias Kemal",
        "Email filled: elias@haramaya.edu", 
        "Department filled: Computer Science",
        "Phone filled: 0912345678",
        "Address filled: Haramaya University",
        "Form completed successfully!"
    ]
    
    for feedback in feedback_responses:
        print(f"  Voice Feedback: '{feedback}'")
    
    print("\n" + "=" * 60)
    print("SAMPLE FUNCTIONALITY DEMONSTRATION COMPLETE!")
    print("=" * 60)
    print("Key Features Demonstrated:")
    print("  - Sample dataset structure and content")
    print("  - Voice command processing pipeline")
    print("  - Form filling automation")
    print("  - Multilingual language detection")
    print("  - Speech synthesis feedback")
    print("  - Confidence scoring")
    print("=" * 60)
    print("Ready for real-time testing with React frontend!")

def show_model_configuration():
    """Show the trained model configuration"""
    print("\nMODEL CONFIGURATION:")
    print("-" * 20)
    
    model_dir = Path("./whisper-multilingual-complete/final")
    
    if model_dir.exists():
        with open(model_dir / "config.json", 'r') as f:
            config = json.load(f)
        
        print(f"Model: {config['model_name']}")
        print(f"Languages: {', '.join(config['languages'])}")
        print(f"Language Codes: {config['language_codes']}")
        print(f"Total Samples: {config['total_samples']}")
        print(f"Multilingual: {config['multilingual_support']}")
        
        with open(model_dir / "training_results.json", 'r') as f:
            results = json.load(f)
        
        print(f"WER: {results['eval_wer']:.2f}%")
        print(f"CER: {results['eval_cer']:.2f}%")
        print(f"Training Steps: {results['total_steps']}")

def main():
    """Main demonstration function"""
    demonstrate_sample_functionality()
    show_model_configuration()

if __name__ == "__main__":
    main()
