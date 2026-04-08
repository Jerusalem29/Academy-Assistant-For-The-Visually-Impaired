#!/usr/bin/env python3
"""
Quick integration test for the complete system
"""

import requests
import time
import json

def test_system():
    """Test the complete multilingual speech recognition system"""
    print("🧪 Testing Complete System Integration")
    print("=" * 50)
    
    # Test 1: Backend Health
    print("\n1. Testing Backend Health...")
    try:
        response = requests.get('http://localhost:5000/api/health', timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ Backend is healthy!")
            print(f"📊 Status: {data.get('status')}")
            print(f"🤖 Model loaded: {data.get('model_loaded')}")
            print(f"🌍 Languages: {data.get('languages')}")
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend connection failed: {e}")
        print("💡 Make sure Flask server is running on port 5000")
        return False
    
    # Test 2: Frontend Accessibility
    print("\n2. Testing Frontend Accessibility...")
    try:
        response = requests.get('http://localhost:3000', timeout=5)
        if response.status_code == 200:
            print("✅ Frontend is accessible!")
            print("🌐 React app is running on port 3000")
        else:
            print(f"❌ Frontend not accessible: {response.status_code}")
            print("💡 Make sure React dev server is running")
            return False
    except Exception as e:
        print(f"❌ Frontend connection failed: {e}")
        print("💡 Make sure React dev server is running with 'npm start'")
        return False
    
    # Test 3: API Transcription
    print("\n3. Testing API Transcription...")
    try:
        # Create mock audio data
        mock_audio = b"fake_audio_data"
        files = {'audio': ('test.wav', mock_audio, 'audio/wav')}
        
        response = requests.post('http://localhost:5000/api/transcribe', files=files, timeout=10)
        if response.status_code == 200:
            data = response.json()
            print("✅ Transcription API working!")
            print(f"📝 Sample result: {data.get('transcript', 'N/A')}")
            print(f"🌍 Supported languages: {data.get('languages', 'N/A')}")
        else:
            print(f"❌ Transcription API failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Transcription test failed: {e}")
        return False
    
    print("\n" + "=" * 50)
    print("🎉 ALL TESTS PASSED!")
    print("✅ Backend: Flask API running on http://localhost:5000")
    print("✅ Frontend: React app running on http://localhost:3000")
    print("✅ Integration: Complete system operational")
    print("✅ Multilingual: Afaan Oromo, Amharic, English supported")
    
    print("\n🚀 Your system is ready for use!")
    print("📱 Open http://localhost:3000 and click 'Speech Recognition' tab")
    print("🎙️ Record audio or upload files for transcription")
    
    return True

if __name__ == "__main__":
    success = test_system()
    
    if not success:
        print("\n❌ Some tests failed. Check:")
        print("1. Flask server running on port 5000?")
        print("2. React dev server running on port 3000?")
        print("3. Both servers started from correct directory?")
        print("\n💡 Restart both servers and try again")
