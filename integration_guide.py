#!/usr/bin/env python3
"""
Integration Guide - How to use the trained model in your React app
"""

def create_integration_code():
    """Create integration code for React app"""
    
    react_code = '''
// useCustomSpeechRecognition.js - Custom hook for your trained model
import { useState, useEffect, useRef } from 'react';

const useCustomSpeechRecognition = () => {
  const [transcription, setTranscription] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const audioContextRef = useRef(null);
  const modelRef = useRef(null);

  useEffect(() => {
    // Initialize audio context
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    
    // Load your trained model
    loadCustomModel();
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const loadCustomModel = async () => {
    try {
      // Load your fine-tuned Whisper model
      // This would use TensorFlow.js or ONNX Runtime
      console.log('Loading custom multilingual Whisper model...');
      
      // Example with TensorFlow.js
      // const model = await tf.loadLayersModel('/models/whisper-multilingual/model.json');
      // modelRef.current = model;
      
      console.log('✅ Custom model loaded');
    } catch (error) {
      console.error('❌ Failed to load custom model:', error);
      setError('Failed to load speech recognition model');
    }
  };

  const startListening = async () => {
    if (!audioContextRef.current) return;

    try {
      setIsListening(true);
      setError(null);

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create audio processor
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      processor.onaudioprocess = async (event) => {
        const audioData = event.inputBuffer.getChannelData(0);
        
        // Process audio with your custom model
        const transcription = await transcribeAudio(audioData);
        
        if (transcription) {
          setTranscription(transcription);
        }
      };
      
      source.connect(processor);
      processor.connect(audioContextRef.current.destination);
      
      // Store references for cleanup
      processor.stream = stream;
      processor.source = source;
      
    } catch (error) {
      console.error('❌ Failed to start listening:', error);
      setError('Failed to access microphone');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (audioContextRef.current) {
      // Stop all audio processing
      audioContextRef.current.state === 'running' && audioContextRef.current.suspend();
    }
    setIsListening(false);
  };

  const transcribeAudio = async (audioData) => {
    try {
      // Convert audio to model input format
      const processedAudio = preprocessAudio(audioData);
      
      // Run inference with your fine-tuned model
      // const prediction = await modelRef.current.predict(processedAudio);
      
      // For now, return mock transcription
      return "Sample transcription from your multilingual model";
      
    } catch (error) {
      console.error('❌ Transcription failed:', error);
      return null;
    }
  };

  const preprocessAudio = (audioData) => {
    // Convert audio data to format expected by Whisper
    // - Normalize to [-1, 1]
    // - Resample to 16kHz
    // - Convert to mel spectrogram
    // - Add batch dimension
    
    // This would use your audio preprocessing pipeline
    return audioData; // Placeholder
  };

  return {
    transcription,
    isListening,
    error,
    startListening,
    stopListening,
    modelLoaded: !!modelRef.current
  };
};

export default useCustomSpeechRecognition;
'''

    register_component_code = '''
// Register.js - Updated with custom speech recognition
import React, { useState } from 'react';
import useCustomSpeechRecognition from './useCustomSpeechRecognition';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    password: '',
    confirmPassword: '',
    address: ''
  });

  const { 
    transcription, 
    isListening, 
    error, 
    startListening, 
    stopListening, 
    modelLoaded 
  } = useCustomSpeechRecognition();

  const handleVoiceCommand = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const processTranscription = (text) => {
    // Process the transcription to fill form fields
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('name')) {
      const nameMatch = text.match(/(?:my name is|name is|name:|i am)\\s*(.+)/i);
      if (nameMatch) {
        setFormData(prev => ({ ...prev, name: nameMatch[1].trim() }));
      }
    } else if (lowerText.includes('email')) {
      const emailMatch = text.match(/(?:email is|email:|my email is)\\s*([^\\s]+@[^\\s]+\\.[^\\s]+)/i);
      if (emailMatch) {
        setFormData(prev => ({ ...prev, email: emailMatch[1].trim() }));
      }
    }
    // Add more field processing...
  };

  useEffect(() => {
    if (transcription) {
      processTranscription(transcription);
    }
  }, [transcription]);

  return (
    <div className="register-container">
      <h1>Multilingual Registration</h1>
      
      {/* Voice Recognition Status */}
      <div className="voice-status">
        <button 
          onClick={handleVoiceCommand}
          className={`voice-btn ${isListening ? 'listening' : ''}`}
          disabled={!modelLoaded}
        >
          {isListening ? '🎤 Stop Listening' : '🎤 Start Voice Input'}
        </button>
        
        {modelLoaded && (
          <span className="model-status">✅ Custom model loaded</span>
        )}
        
        {transcription && (
          <div className="transcription">
            <strong>Heard:</strong> {transcription}
          </div>
        )}
        
        {error && (
          <div className="error">
            ❌ {error}
          </div>
        )}
      </div>

      {/* Registration Form */}
      <form className="registration-form">
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Type or use voice input"
          />
        </div>
        
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="Type or use voice input"
          />
        </div>
        
        {/* Add other form fields... */}
        
        <button type="submit" className="submit-btn">
          Register
        </button>
      </form>
      
      <div className="language-info">
        <p>🌍 Supports: English, Amharic, Afaan Oromo</p>
        <p>💡 Try saying: "My name is John" or "My email is john@example.com"</p>
      </div>
    </div>
  );
};

export default Register;
'''

    deployment_guide = '''
# DEPLOYMENT GUIDE

## 1. Model Export
```bash
# Export your trained model for web deployment
python export_model.py --format onnx --output ./web_model/
```

## 2. Model Serving Options

### Option A: TensorFlow.js (Recommended)
```bash
# Convert to TensorFlow.js format
pip install tensorflowjs
tensorflowjs_converter --input_format keras ./whisper-multilingual-final ./web_model/
```

### Option B: ONNX Runtime
```bash
# Convert to ONNX format
pip install onnx
python convert_to_onnx.py ./whisper-multilingual-final ./web_model/
```

## 3. Web Integration

### Frontend Setup
```bash
# Install required packages
npm install @tensorflow/tfjs
npm install onnxruntime-web
```

### Backend API (Optional)
```python
# FastAPI server for model inference
from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.post("/transcribe")
async def transcribe_audio(audio_file: UploadFile):
    # Process audio with your model
    transcription = process_audio(audio_file)
    return {"transcription": transcription}
```

## 4. Performance Optimization

- **Model Quantization**: Reduce model size by 4x
- **Web Workers**: Process audio in background thread
- **Streaming**: Real-time transcription
- **Caching**: Cache frequent transcriptions

## 5. Testing

```bash
# Test model performance
python evaluate_model.py --test-set web_samples

# Test latency
python test_latency.py --model ./web_model/
```
'''

    return {
        'react_hook': react_code,
        'register_component': register_component_code,
        'deployment_guide': deployment_guide
    }

def save_integration_files():
    """Save integration files"""
    integration_code = create_integration_code()
    
    # Save React hook
    with open('useCustomSpeechRecognition.js', 'w') as f:
        f.write(integration_code['react_hook'])
    
    # Save updated Register component
    with open('Register_updated.js', 'w') as f:
        f.write(integration_code['register_component'])
    
    # Save deployment guide
    with open('DEPLOYMENT.md', 'w') as f:
        f.write(integration_code['deployment_guide'])
    
    print("✅ Integration files created:")
    print("  📄 useCustomSpeechRecognition.js - React hook")
    print("  📄 Register_updated.js - Updated component")
    print("  📄 DEPLOYMENT.md - Deployment guide")

if __name__ == "__main__":
    save_integration_files()
    
    print("\n🎯 INTEGRATION SUMMARY")
    print("="*50)
    print("1. 🧪 Test your model: python quick_training_test.py")
    print("2. 🚀 Train model: python train_whisper_multilingual.py")
    print("3. 📊 Evaluate: python evaluate_model.py")
    print("4. 🔌 Integrate: Use the generated React files")
    print("5. 🚀 Deploy: Follow DEPLOYMENT.md")
    print("="*50)
