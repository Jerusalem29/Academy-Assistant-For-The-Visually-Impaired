#!/usr/bin/env python3
"""
Simple model test without audio encoding
"""

import torch
from transformers import WhisperProcessor, WhisperForConditionalGeneration
import numpy as np
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def simple_test():
    """Test model without complex audio processing"""
    logger.info("🧪 Running simple model test...")
    
    # Test 1: Check device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info(f"🖥️  Using device: {device}")
    
    # Test 2: Load model
    try:
        logger.info("🤖 Loading Whisper model...")
        model = WhisperForConditionalGeneration.from_pretrained("openai/whisper-base")
        model.to(device)
        logger.info("✅ Model loaded successfully")
        logger.info(f"📊 Model parameters: {model.num_parameters():,}")
    except Exception as e:
        logger.error(f"❌ Failed to load model: {e}")
        return False
    
    # Test 3: Load processor
    try:
        logger.info("🔧 Loading Whisper processor...")
        processor = WhisperProcessor.from_pretrained("openai/whisper-base")
        logger.info("✅ Processor loaded successfully")
    except Exception as e:
        logger.error(f"❌ Failed to load processor: {e}")
        return False
    
    # Test 4: Create mock audio features (what Whisper expects)
    try:
        logger.info("🎵 Creating mock audio features...")
        
        # Whisper expects mel spectrogram features: [batch_size, 80, 3000]
        mock_features = torch.randn(1, 80, 3000).to(device)
        
        logger.info("✅ Mock audio features created")
        logger.info(f"📊 Features shape: {mock_features.shape}")
        
    except Exception as e:
        logger.error(f"❌ Failed to create features: {e}")
        return False
    
    # Test 5: Test generation
    try:
        logger.info("🎤 Testing audio generation...")
        
        with torch.no_grad():
            predicted_ids = model.generate(
                mock_features,
                max_length=448,
                num_beams=1,
                task="transcribe",
                language="en"
            )
        
        transcription = processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]
        logger.info(f"📝 Test transcription: {transcription}")
        logger.info("✅ Generation test successful")
        
    except Exception as e:
        logger.error(f"❌ Generation test failed: {e}")
        return False
    
    logger.info("🎉 All tests passed! Ready for training!")
    return True

def show_training_readiness():
    """Show training readiness status"""
    print("\n" + "="*60)
    print("TRAINING READINESS CHECK")
    print("="*60)
    
    # Check basic requirements
    checks = []
    
    # Device check
    if torch.cuda.is_available():
        checks.append("✅ CUDA available - GPU training supported")
        gpu_memory = torch.cuda.get_device_properties(0).total_memory / 1e9
        checks.append(f"📊 GPU Memory: {gpu_memory:.1f} GB")
    else:
        checks.append("⚠️  CPU only - Training will be slower")
    
    # Model check
    try:
        model = WhisperForConditionalGeneration.from_pretrained("openai/whisper-base")
        checks.append("✅ Whisper model loads successfully")
        checks.append(f"📊 Model size: {model.num_parameters():,} parameters")
    except:
        checks.append("❌ Failed to load Whisper model")
    
    # Dataset check
    import os
    if os.path.exists("./datasets"):
        audio_files = sum(1 for _ in os.scandir("./datasets") if _.is_dir())
        checks.append(f"📁 Dataset folders found: {audio_files}")
    else:
        checks.append("❌ No datasets folder found")
    
    # Print results
    for check in checks:
        print(check)
    
    print("\n🎯 Next Steps:")
    print("1. Install torchcodec: pip install torchcodec")
    print("2. Prepare dataset: python prepare_dataset_simple.py")
    print("3. Train model: python train_whisper_multilingual.py")
    print("4. Evaluate: python evaluate_model.py")
    
    print("="*60)

if __name__ == "__main__":
    show_training_readiness()
    success = simple_test()
    
    if success:
        print("\n🚀 Ready for training!")
        print("\n💡 To fix audio encoding, run:")
        print("   C:/users/hp/appdata/local/programs/python/python310/python.exe -m pip install torchcodec")
    else:
        print("\n❌ Some tests failed. Check the errors above.")
