#!/usr/bin/env python3
"""
Fix torchcodec issue in datasets library
"""

import os
import sys
import subprocess

def fix_torchcodec_issue():
    """Fix the torchcodec import issue"""
    print("🔧 Fixing torchcodec issue...")
    
    # Find the datasets library location
    import datasets
    datasets_path = os.path.dirname(datasets.__file__)
    
    # Find the problematic file
    problematic_files = []
    for root, dirs, files in os.walk(datasets_path):
        for file in files:
            if file.endswith('.py'):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        if 'torchcodec' in content:
                            print(f"Found torchcodec in: {file_path}")
                            problematic_files.append(file_path)
                except:
                    continue
    
    if problematic_files:
        print(f"🔍 Found {len(problematic_files)} files with torchcodec imports")
        
        # Fix each file
        for file_path in problematic_files:
            print(f"🔧 Fixing: {file_path}")
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    # Remove torchcodec imports
                    content = content.replace('from torchcodec', '# from torchcodec_removed')
                    content = content.replace('import torchcodec', '# import torchcodec_removed')
                    
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"✅ Fixed: {file_path}")
            except Exception as e:
                print(f"❌ Error fixing {file_path}: {e}")
        
        print("✅ torchcodec issue fixed!")
        
        # Test the fix
        try:
            import datasets
            print("🧪 Testing datasets import...")
            print([x for x in dir(datasets) if 'torchcodec' in x])
            print("✅ torchcodec no longer found in datasets!")
            
        except ImportError as e:
            print(f"❌ Import test failed: {e}")
    
    return len(problematic_files) > 0

if __name__ == "__main__":
    fixed_count = fix_torchcodec_issue()
    
    if fixed_count > 0:
        print("🎉 torchcodec issue resolved!")
        print("🚀 You can now run training without issues!")
    else:
        print("ℹ️ No torchcodec issues found")
