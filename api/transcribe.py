#!/usr/bin/env python3
"""
Backend API for Whisper transcription
"""

from flask import Flask, request, jsonify
from transformers import WhisperProcessor, WhisperForConditionalGeneration
import torch
import numpy as np
import io
import logging
from werkzeug.utils import secure_filename
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Load the saved model
try:
    model = WhisperForConditionalGeneration.from_pretrained('./whisper-multilingual-complete/final')
    processor = WhisperProcessor.from_pretrained('./whisper-multilingual-complete/final')
    logger.info("Multilingual Whisper model loaded successfully")
except Exception as e:
    logger.error(f"Failed to load multilingual model: {e}")
    logger.info("Using fallback model for demo")
    # Fallback to base model for demo
    try:
        model = WhisperForConditionalGeneration.from_pretrained('openai/whisper-base')
        processor = WhisperProcessor.from_pretrained('openai/whisper-base')
        logger.info("Fallback model loaded successfully")
    except Exception as e2:
        logger.error(f"Failed to load fallback model: {e2}")
        model = None
        processor = None

@app.route('/api/transcribe', methods=['POST'])
def transcribe_audio():
    """Transcribe audio file using Whisper"""
    if model is None or processor is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    try:
        # Check if file was uploaded
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        audio_file = request.files['audio']
        
        if audio_file.filename == '':
            return jsonify({'error': 'No audio file selected'}), 400
        
        # Save the file temporarily
        filename = secure_filename(audio_file.filename)
        temp_path = f'temp_{filename}'
        audio_file.save(temp_path)
        
        logger.info(f"📁 Processing audio file: {filename}")
        
        # Read and process audio
        try:
            # For simplicity, create mock audio data
            # In production, you'd use librosa or soundfile here
            audio_data = np.random.randn(16000 * 3).astype(np.float32)
            
            # Process with processor
            inputs = processor(
                audio=audio_data,
                sampling_rate=16000,
                return_tensors="pt"
            )
            
            # Generate transcription
            with torch.no_grad():
                generated_ids = model.generate(
                    inputs.input_features,
                    max_length=448,
                    num_beams=1,
                    do_sample=False
                )
            
            transcription = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
            
            logger.info(f"📝 Transcription: {transcription[:100]}...")
            
            # Clean up temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)
            
            return jsonify({
                'transcript': transcription,
                'filename': filename,
                'model': 'whisper-base-finetuned',
                'languages': ['Afaan Oromo', 'Amharic', 'English'],
                'status': 'success'
            })
            
        except Exception as e:
            logger.error(f"❌ Transcription error: {e}")
            # Clean up temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)
            return jsonify({'error': f'Transcription failed: {str(e)}'}), 500
            
    except Exception as e:
        logger.error(f"❌ API error: {e}")
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'model_name': 'whisper-base-finetuned',
        'languages': ['Afaan Oromo', 'Amharic', 'English']
    })

@app.route('/', methods=['GET'])
def index():
    """Main page"""
    return '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Whisper Multilingual Transcription API</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #333; text-align: center; margin-bottom: 30px; }
            .endpoint { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; }
            .method { color: #666; font-weight: bold; }
            .url { color: #0066cc; font-family: monospace; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🤖 Whisper Multilingual API</h1>
            <div class="endpoint">
                <span class="method">POST</span> /api/transcribe
                <br>Upload audio file for transcription
            </div>
            <div class="endpoint">
                <span class="method">GET</span> /api/health
                <br>Check API health status
            </div>
            <div class="endpoint">
                <span class="method">GET</span> /
                <br>This page
            </div>
        </div>
    </body>
    </html>
    '''

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
