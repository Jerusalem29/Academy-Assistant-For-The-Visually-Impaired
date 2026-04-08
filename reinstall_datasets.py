#!/usr/bin/env python3
"""
Reinstall datasets package
"""

import subprocess
import sys

def reinstall_datasets():
    """Reinstall datasets package"""
    print("🔄 Reinstalling datasets package...")
    
    try:
        # Uninstall datasets
        print("📦 Uninstalling datasets...")
        result = subprocess.run([
            sys.executable, "-m", "pip", "uninstall", "datasets", "-y"
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Datasets uninstalled")
        else:
            print(f"⚠️  Uninstall warning: {result.stderr}")
        
        # Install datasets
        print("📦 Installing datasets...")
        result = subprocess.run([
            sys.executable, "-m", "pip", "install", "datasets"
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Datasets reinstalled successfully!")
            print("🎉 torchcodec issue should be resolved!")
            return True
        else:
            print(f"❌ Install failed: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Error during reinstall: {e}")
        return False

if __name__ == "__main__":
    success = reinstall_datasets()
    if success:
        print("\n🚀 You can now run training:")
        print("C:/users/hp/appdata/local/programs/python/python310/python.exe train_whisper_final.py")
    else:
        print("\n❌ Reinstall failed. Try manually:")
        print("C:/users/hp/appdata/local/programs/python/python310/python.exe -m pip uninstall datasets -y")
        print("C:/users/hp/appdata/local/programs/python/python310/python.exe -m pip install datasets")
