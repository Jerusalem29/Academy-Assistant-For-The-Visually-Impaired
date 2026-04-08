#!/usr/bin/env python3
"""
Fix the test dataset format issue
"""

from datasets import Dataset, Audio
import numpy as np

def fix_test_dataset():
    """Create a properly formatted test dataset"""
    print("🔧 Fixing test dataset...")
    
    # Create simple audio data (sine wave)
    sample_rate = 16000
    duration = 2.0
    t = np.linspace(0, duration, int(sample_rate * duration), False)
    audio_data = 0.3 * np.sin(2 * np.pi * 440 * t)  # 440 Hz sine wave
    
    # Create dataset with proper format
    data = {
        'audio': [{
            'array': audio_data,
            'sampling_rate': sample_rate
        }],
        'text': ['Akkam badi'],
        'language': ['Afaan Oromo']
    }
    
    dataset = Dataset.from_dict(data)
    dataset = dataset.cast_column("audio", Audio())
    
    # Save the fixed dataset
    dataset.save_to_disk('./test_dataset_fixed')
    
    print("✅ Fixed test dataset created!")
    print(f"📊 Dataset size: {len(dataset)} samples")
    print(f"🎵 Audio shape: {dataset[0]['audio']['array'].shape}")
    print(f"📝 Text: {dataset[0]['text']}")
    
    return dataset

def test_with_fixed_dataset():
    """Test with the corrected dataset"""
    print("🧪 Testing with fixed dataset...")
    
    try:
        # Load the fixed dataset
        dataset = fix_test_dataset()
        
        # Test audio processing
        from transformers import WhisperProcessor
        
        processor = WhisperProcessor.from_pretrained("openai/whisper-base")
        
        # Process the audio
        inputs = processor(
            audio=dataset[0]['audio']['array'],
            text=dataset[0]['text'],
            sampling_rate=16000,
            return_tensors="pt"
        )
        
        print("✅ Audio processing works!")
        print(f"📊 Input features shape: {inputs.input_features.shape}")
        print(f"📝 Labels shape: {inputs.labels.shape}")
        
        # Test generation
        import torch
        model = WhisperForConditionalGeneration.from_pretrained("openai/whisper-base")
        
        with torch.no_grad():
            predicted_ids = model.generate(
                inputs.input_features,
                max_length=448,
                num_beams=1,
                task="transcribe",
                language="en"
            )
        
        transcription = processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]
        print(f"🎤 Test transcription: {transcription}")
        
        print("🎉 All tests passed! Ready for training!")
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

if __name__ == "__main__":
    test_with_fixed_dataset()
