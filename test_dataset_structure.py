#!/usr/bin/env python3
"""
Test script to verify dataset structure before running full preparation
"""

import os
from pathlib import Path
import json
import pandas as pd
from typing import Dict, List

def explore_dataset_structure(dataset_path: str, language_name: str) -> Dict:
    """Explore and report dataset structure"""
    print(f"\n{'='*50}")
    print(f"Exploring {language_name} dataset: {dataset_path}")
    print(f"{'='*50}")
    
    if not os.path.exists(dataset_path):
        print(f"❌ Path does not exist: {dataset_path}")
        return {}
    
    path = Path(dataset_path)
    
    # Find audio files
    audio_files = []
    audio_files.extend(list(path.rglob("*.wav")))
    audio_files.extend(list(path.rglob("*.mp3")))
    audio_files.extend(list(path.rglob("*.flac")))
    audio_files.extend(list(path.rglob("*.m4a")))
    
    print(f"🎵 Audio files found: {len(audio_files)}")
    if audio_files:
        print("   Sample audio files:")
        for f in audio_files[:5]:
            print(f"     - {f.relative_to(path)}")
        if len(audio_files) > 5:
            print(f"     ... and {len(audio_files) - 5} more")
    
    # Find transcript files
    transcript_files = []
    transcript_files.extend(list(path.rglob("*.txt")))
    transcript_files.extend(list(path.rglob("*.csv")))
    transcript_files.extend(list(path.rglob("*.json")))
    
    print(f"📝 Transcript files found: {len(transcript_files)}")
    if transcript_files:
        print("   Transcript files:")
        for f in transcript_files:
            print(f"     - {f.relative_to(path)}")
    
    # Analyze transcript structure
    transcript_analysis = {}
    for transcript_file in transcript_files:
        try:
            if transcript_file.suffix == ".txt":
                with open(transcript_file, 'r', encoding='utf-8', errors='ignore') as f:
                    lines = f.readlines()[:10]  # Read first 10 lines
                    
                print(f"\n   📄 Sample content from {transcript_file.name}:")
                for i, line in enumerate(lines[:3]):
                    print(f"     Line {i+1}: {line.strip()}")
                
                # Check for common delimiters
                delimiters = ['|', '\t', ',', ';']
                delimiter_counts = {}
                for delimiter in delimiters:
                    count = sum(line.count(delimiter) for line in lines)
                    delimiter_counts[delimiter] = count
                
                if delimiter_counts:
                    print(f"   📊 Delimiter analysis (first 10 lines):")
                    for delim, count in delimiter_counts.items():
                        if count > 0:
                            print(f"     '{delim}': {count} occurrences")
                
                transcript_analysis[transcript_file.name] = {
                    "type": "txt",
                    "lines": len(lines),
                    "delimiters": delimiter_counts
                }
                
            elif transcript_file.suffix == ".csv":
                try:
                    df = pd.read_csv(transcript_file)
                    print(f"\n   📊 CSV structure for {transcript_file.name}:")
                    print(f"     Columns: {list(df.columns)}")
                    print(f"     Rows: {len(df)}")
                    print(f"     Sample data:")
                    print(df.head(3).to_string(index=False))
                    
                    transcript_analysis[transcript_file.name] = {
                        "type": "csv",
                        "columns": list(df.columns),
                        "rows": len(df)
                    }
                except Exception as e:
                    print(f"     ❌ Error reading CSV: {e}")
                    
            elif transcript_file.suffix == ".json":
                try:
                    with open(transcript_file, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    
                    print(f"\n   📊 JSON structure for {transcript_file.name}:")
                    if isinstance(data, list):
                        print(f"     Type: List with {len(data)} items")
                        if data:
                            print(f"     Sample item keys: {list(data[0].keys()) if isinstance(data[0], dict) else 'Not dict'}")
                    elif isinstance(data, dict):
                        print(f"     Type: Dictionary with {len(data)} keys")
                        print(f"     Keys: {list(data.keys())[:10]}")
                    else:
                        print(f"     Type: {type(data)}")
                    
                    transcript_analysis[transcript_file.name] = {
                        "type": "json",
                        "structure": type(data).__name__
                    }
                except Exception as e:
                    print(f"     ❌ Error reading JSON: {e}")
                    
        except Exception as e:
            print(f"     ❌ Error analyzing {transcript_file}: {e}")
    
    return {
        "audio_files": len(audio_files),
        "transcript_files": len(transcript_files),
        "transcript_analysis": transcript_analysis
    }

def main():
    """Test dataset structures"""
    # Import config
    try:
        from config import DATASET_PATHS, LANGUAGES
    except ImportError:
        print("❌ config.py not found. Please create it first.")
        return
    
    print("🔍 Testing dataset structures...")
    
    results = {}
    for lang_code, path in DATASET_PATHS.items():
        lang_name = LANGUAGES.get(lang_code, lang_code)
        results[lang_code] = explore_dataset_structure(path, lang_name)
    
    # Summary
    print(f"\n{'='*50}")
    print("SUMMARY")
    print(f"{'='*50}")
    
    total_audio = 0
    total_transcripts = 0
    
    for lang_code, result in results.items():
        lang_name = LANGUAGES.get(lang_code, lang_code)
        audio_count = result.get("audio_files", 0)
        transcript_count = result.get("transcript_files", 0)
        
        total_audio += audio_count
        total_transcripts += transcript_count
        
        status = "✅" if audio_count > 0 and transcript_count > 0 else "⚠️"
        print(f"{status} {lang_name}: {audio_count} audio files, {transcript_count} transcript files")
    
    print(f"\n📊 Totals: {total_audio} audio files, {total_transcripts} transcript files")
    
    if total_audio == 0:
        print("\n❌ No audio files found! Please check your dataset paths.")
    elif total_transcripts == 0:
        print("\n❌ No transcript files found! Please check your dataset paths.")
    else:
        print("\n✅ Datasets appear to have content. Ready for preparation!")

if __name__ == "__main__":
    main()
