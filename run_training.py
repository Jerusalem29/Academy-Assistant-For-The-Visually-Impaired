#!/usr/bin/env python3
"""
Training Launcher Script
Orchestrates the complete training pipeline
"""

import os
import sys
import subprocess
import argparse
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class TrainingPipeline:
    def __init__(self):
        self.project_root = Path.cwd()
        
    def run_command(self, command: str, description: str) -> bool:
        """Run a command and return success status"""
        logger.info(f"🚀 {description}")
        logger.info(f"📝 Command: {command}")
        
        try:
            result = subprocess.run(
                command,
                shell=True,
                check=True,
                capture_output=True,
                text=True,
                cwd=self.project_root
            )
            
            logger.info(f"✅ {description} completed successfully")
            if result.stdout:
                logger.info(f"📄 Output: {result.stdout[:500]}...")
            
            return True
            
        except subprocess.CalledProcessError as e:
            logger.error(f"❌ {description} failed")
            logger.error(f"📄 Error: {e.stderr}")
            return False
    
    def check_requirements(self) -> bool:
        """Check if all requirements are installed"""
        logger.info("🔍 Checking requirements...")
        
        try:
            import torch
            import transformers
            import datasets
            import librosa
            logger.info("✅ All required packages are installed")
            return True
        except ImportError as e:
            logger.error(f"❌ Missing package: {e}")
            logger.info("💡 Run: pip install -r requirements.txt")
            return False
    
    def check_dataset_exists(self) -> bool:
        """Check if prepared dataset exists"""
        dataset_path = Path("./multilingual_speech_dataset")
        
        if dataset_path.exists():
            logger.info("✅ Dataset found")
            return True
        else:
            logger.warning("⚠️ Dataset not found")
            return False
    
    def check_model_exists(self) -> bool:
        """Check if trained model exists"""
        model_path = Path("./whisper-multilingual-finetuned")
        
        if model_path.exists():
            logger.info("✅ Trained model found")
            return True
        else:
            logger.warning("⚠️ Trained model not found")
            return False
    
    def prepare_dataset(self, force: bool = False) -> bool:
        """Prepare the dataset"""
        if not force and self.check_dataset_exists():
            logger.info("📦 Dataset already exists. Use --force to reprepare.")
            return True
        
        return self.run_command(
            "python prepare_dataset.py",
            "Dataset Preparation"
        )
    
    def train_model(self) -> bool:
        """Train the model"""
        return self.run_command(
            "python train_whisper_multilingual.py",
            "Model Training"
        )
    
    def evaluate_model(self) -> bool:
        """Evaluate the trained model"""
        if not self.check_model_exists():
            logger.error("❌ No trained model found. Run training first.")
            return False
        
        return self.run_command(
            "python evaluate_model.py",
            "Model Evaluation"
        )
    
    def test_dataset_structure(self) -> bool:
        """Test dataset structure before preparation"""
        return self.run_command(
            "python test_dataset_structure.py",
            "Dataset Structure Test"
        )
    
    def install_requirements(self) -> bool:
        """Install required packages"""
        return self.run_command(
            "pip install -r requirements.txt",
            "Installing Requirements"
        )
    
    def run_full_pipeline(self, force: bool = False):
        """Run the complete training pipeline"""
        logger.info("🚀 Starting complete training pipeline...")
        
        steps = [
            ("Check Requirements", self.check_requirements),
            ("Test Dataset Structure", self.test_dataset_structure),
            ("Prepare Dataset", lambda: self.prepare_dataset(force)),
            ("Train Model", self.train_model),
            ("Evaluate Model", self.evaluate_model),
        ]
        
        for step_name, step_func in steps:
            logger.info(f"\n{'='*60}")
            logger.info(f"📍 Step: {step_name}")
            logger.info(f"{'='*60}")
            
            if not step_func():
                logger.error(f"❌ Pipeline failed at step: {step_name}")
                return False
        
        logger.info(f"\n🎉 Complete training pipeline finished successfully!")
        return True

def main():
    parser = argparse.ArgumentParser(description="Multilingual Whisper Training Pipeline")
    parser.add_argument("--step", choices=[
        "install", "test", "prepare", "train", "evaluate", "full"
    ], default="full", help="Which step to run")
    parser.add_argument("--force", action="store_true", help="Force reprepare dataset")
    
    args = parser.parse_args()
    
    pipeline = TrainingPipeline()
    
    if args.step == "install":
        success = pipeline.install_requirements()
    elif args.step == "test":
        success = pipeline.test_dataset_structure()
    elif args.step == "prepare":
        success = pipeline.prepare_dataset(args.force)
    elif args.step == "train":
        success = pipeline.train_model()
    elif args.step == "evaluate":
        success = pipeline.evaluate_model()
    elif args.step == "full":
        success = pipeline.run_full_pipeline(args.force)
    else:
        logger.error(f"Unknown step: {args.step}")
        success = False
    
    if success:
        logger.info("✅ Operation completed successfully!")
        sys.exit(0)
    else:
        logger.error("❌ Operation failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()
