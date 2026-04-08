#!/usr/bin/env python3
"""
Restore original audio.py file
"""

import os
import shutil

def restore_audio_py():
    """Restore the original audio.py file"""
    print("🔄 Restoring original audio.py file...")
    
    backup_path = "C:/users/hp/appdata/local/programs/python/python310/lib/site-packages/datasets/features/audio.py.bak"
    target_path = "C:/users/hp/appdata/local/programs/python/python310/lib/site-packages/datasets/features/audio.py"
    
    if os.path.exists(backup_path):
        try:
            shutil.copy2(backup_path, target_path)
            print(f"✅ Restored: {target_path}")
            print("🎉 datasets library should work now!")
            return True
        except Exception as e:
            print(f"❌ Error restoring: {e}")
            return False
    else:
        print(f"❌ Backup not found: {backup_path}")
        return False

if __name__ == "__main__":
    success = restore_audio_py()
    if success:
        print("\n🚀 You can now run training:")
        print("C:/users/hp/appdata/local/programs/python/python310/python.exe train_whisper_final.py")
    else:
        print("\n❌ Restore failed. You may need to reinstall datasets package.")
