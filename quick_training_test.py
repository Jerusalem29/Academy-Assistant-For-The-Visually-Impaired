#!/usr/bin/env python3
"""
Quick Training Test - Small scale test to verify everything works
"""

import torch
from transformers import WhisperProcessor, WhisperForConditionalGeneration
from datasets import load_from_disk
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def quick_test():
    """Quick test of model and dataset loading"""
    logger.info("🧪 Running quick training test...")
    
    # Test 1: Check CUDA
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
    
    # Test 4: Check dataset
    try:
        logger.info("📂 Checking dataset...")
        dataset = load_from_disk("./test_dataset")
        logger.info(f"✅ Dataset loaded: {len(dataset)} samples")
        
        # Test audio processing
        sample = dataset[0]
        logger.info(f"📄 Sample audio: {sample['audio']}")
        logger.info(f"📝 Sample text: {sample['text']}")
        
        # Test processor
        inputs = processor(
            audio=sample['audio']['array'],
            text=sample['text'],
            sampling_rate=16000,
            return_tensors="pt"
        )
        logger.info("✅ Audio processing works")
        
    except Exception as e:
        logger.error(f"❌ Failed to load dataset: {e}")
        return False
    
    # Test 5: Quick generation test
    try:
        logger.info("🎤 Testing audio generation...")
        with torch.no_grad():
            predicted_ids = model.generate(
                inputs.input_features.to(device),
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

def show_training_info():
    """Show training configuration and requirements"""
    print("="*60)
    print("TRAINING INFORMATION")
    print("="*60)
    
    print(f"🖥️  Device: {'CUDA' if torch.cuda.is_available() else 'CPU'}")
    if torch.cuda.is_available():
        print(f"📊 GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB")
    
    print("\n📋 Training Configuration:")
    print("  • Model: openai/whisper-base")
    print("  • Languages: Afaan Oromo, Amharic, English")
    print("  • Batch size: 4 (adjust based on GPU memory)")
    print("  • Learning rate: 1e-5")
    print("  • Max steps: 5000 (for quick test)")
    
    print("\n⏱️  Estimated Training Time:")
    print("  • Small dataset (9 samples): 5-10 minutes")
    print("  • Medium dataset (1000 samples): 2-4 hours")
    print("  • Large dataset (10000+ samples): 12-24 hours")
    
    print("\n🎯 Expected Results:")
    print("  • English WER: 5-15% (already good)")
    print("  • Amharic WER: 15-30% (needs fine-tuning)")
    print("  • Afaan Oromo WER: 20-35% (needs more data)")
    
    print("="*60)

if __name__ == "__main__":
    show_training_info()
    success = quick_test()
    
    if success:
        print("\n🚀 Ready to start training!")
        print("Run: C:/users/hp/appdata/local/programs/python/python310/python.exe train_whisper_multilingual.py")
    else:
        print("\n❌ Some tests failed. Check the errors above.")
