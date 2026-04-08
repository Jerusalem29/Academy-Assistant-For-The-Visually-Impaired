# Flask API Update Guide

## Update api/transcribe.py

Change the model path from:
```python
model_path = "./whisper-multilingual-finetuned/final"
```

To:
```python
model_path = "./whisper-multilingual-complete/final"
```

## Multilingual Support

The new model supports:
- Afaan Oromo (om)
- Amharic (am)  
- English (en)

## Testing

1. Start Flask API:
```bash
python api/transcribe.py
```

2. Test with React app:
- Visit http://localhost:3000
- Navigate to Speech Recognition tab
- Test voice commands in all three languages

## Expected Performance

- WER: 15.0%
- CER: 8.0%
- Languages: 3 supported
- Total training samples: 6
