#!/usr/bin/env python3
"""
Test the Flask API transcription endpoint
"""

import requests
import json
import time

def test_health_endpoint():
    """Test the health check endpoint"""
    print("🔍 Testing health endpoint...")
    
    try:
        response = requests.get('http://localhost:5000/api/health')
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Health check successful!")
            print(f"📊 Status: {data.get('status')}")
            print(f"🤖 Model loaded: {data.get('model_loaded')}")
            print(f"🌍 Languages: {data.get('languages')}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_transcription_endpoint():
    """Test the transcription endpoint with a mock audio file"""
    print("\n🔍 Testing transcription endpoint...")
    
    try:
        # Create a mock audio file (just for testing the API)
        mock_audio_data = b"fake_audio_data_for_testing"
        
        # Prepare the request
        files = {'audio': ('test.wav', mock_audio_data, 'audio/wav')}
        
        response = requests.post(
            'http://localhost:5000/api/transcribe',
            files=files
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Transcription test successful!")
            print(f"📝 Transcript: {data.get('transcript', 'N/A')}")
            print(f"🌍 Languages: {data.get('languages', 'N/A')}")
            print(f"📊 Status: {data.get('status', 'N/A')}")
            return True
        else:
            print(f"❌ Transcription test failed: {response.status_code}")
            print(f"📄 Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Transcription test error: {e}")
        return False

def main():
    """Run all API tests"""
    print("🧪 Testing Flask API System")
    print("=" * 50)
    
    # Test health endpoint
    health_ok = test_health_endpoint()
    
    # Wait a moment
    time.sleep(1)
    
    # Test transcription endpoint
    transcription_ok = test_transcription_endpoint()
    
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"✅ Health Check: {'PASS' if health_ok else 'FAIL'}")
    print(f"✅ Transcription: {'PASS' if transcription_ok else 'FAIL'}")
    
    if health_ok and transcription_ok:
        print("\n🎉 All tests passed! Your API is working perfectly!")
        print("🚀 Ready for React integration!")
    else:
        print("\n⚠️ Some tests failed. Check the Flask server logs.")
    
    return health_ok and transcription_ok

if __name__ == "__main__":
    main()
