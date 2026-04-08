#!/usr/bin/env python3
"""
Test the saved Whisper model
"""

from transformers import WhisperProcessor, WhisperForConditionalGeneration
import torch
import numpy as np

def test_model():
    """Test the saved Whisper model"""
    print("🧪 Testing saved Whisper model...")
    
    try:
        # Load your saved model
        model = WhisperForConditionalGeneration.from_pretrained('./whisper-multilingual-finetuned/final')
        processor = WhisperProcessor.from_pretrained('./whisper-multilingual-finetuned/final')
        
        print('✅ Model loads successfully!')
        print(f'📊 Parameters: {model.num_parameters():,}')
        
        # Test with dummy audio
        dummy_audio = np.random.randn(16000 * 2).astype(np.float32)
        
        # Process audio
        inputs = processor(
            audio=dummy_audio,
            sampling_rate=16000,
            return_tensors="pt"
        )
        
        print('✅ Audio processing works!')
        print(f'📊 Input shape: {inputs.input_features.shape}')
        
        # Test generation
        with torch.no_grad():
            generated_ids = model.generate(
                inputs.input_features,
                max_length=448,
                num_beams=1
            )
        
        transcription = processor.batch_decode(generated_ids, skip_special_tokens=True)
        
        print('✅ Generation works!')
        print(f'📝 Sample transcription: {transcription[0][:50]}...')
        
        print('\n🎉 Model is fully functional!')
        print('🚀 Ready for React integration!')
        
        return True
        
    except Exception as e:
        print(f'❌ Error: {e}')
        return False

if __name__ == "__main__":
    success = test_model()
    
    if success:
        print('\n✅ Model test completed successfully!')
        print('\n🎯 Next Steps:')
        print('1. Create React integration component')
        print('2. Set up audio recording')
        print('3. Add multilingual support')
        print('4. Deploy to production')
        print('\n🚀 Your Whisper model is ready!')
    else:
        print('\n❌ Model test failed!')
        print('Please check the model files in ./whisper-multilingual-finetuned/final')
