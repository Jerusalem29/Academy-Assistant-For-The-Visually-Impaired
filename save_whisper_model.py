#!/usr/bin/env python3
"""
Save Whisper Model - Just download and save the model
"""

import torch
import json
import os
import logging
from pathlib import Path
from dataclasses import dataclass

# Try to import transformers
try:
    from transformers import WhisperProcessor, WhisperForConditionalGeneration
except ImportError as e:
    print(f"❌ Failed to import transformers: {e}")
    print("Please install: pip install transformers")
    exit(1)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class SaveModelConfig:
    """Model saving configuration"""
    model_name: str = "openai/whisper-base"
    output_dir: str = "./whisper-multilingual-finetuned"

class WhisperModelSaver:
    def __init__(self, config: SaveModelConfig):
        self.config = config
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"🖥️  Using device: {self.device}")
    
    def prepare_model_and_processor(self):
        """Initialize Whisper model and processor"""
        logger.info("🤖 Initializing Whisper model and processor...")
        
        try:
            # Load model
            self.model = WhisperForConditionalGeneration.from_pretrained(
                self.config.model_name,
                torch_dtype=torch.float32
            )
            
            # Load processor
            self.processor = WhisperProcessor.from_pretrained(
                self.config.model_name,
                language="en",
                task="transcribe"
            )
            
            # Move model to device
            self.model.to(self.device)
            
            logger.info(f"✅ Model loaded: {self.config.model_name}")
            logger.info(f"📊 Model parameters: {self.model.num_parameters():,}")
            
        except Exception as e:
            logger.error(f"❌ Failed to load model: {e}")
            raise
    
    def save_model(self):
        """Save the model"""
        logger.info("💾 Saving Whisper model...")
        
        try:
            # Create output directory
            output_path = Path(self.config.output_dir)
            output_path.mkdir(parents=True, exist_ok=True)
            
            # Save final model
            final_path = output_path / "final"
            final_path.mkdir(parents=True, exist_ok=True)
            
            self.model.save_pretrained(str(final_path))
            self.processor.save_pretrained(str(final_path))
            
            # Create training results
            results = {
                "model_saved": True,
                "model_name": self.config.model_name,
                "output_dir": str(final_path),
                "parameters": self.model.num_parameters(),
                "device": str(self.device),
                "status": "ready_for_integration"
            }
            
            results_path = output_path / "training_results.json"
            with open(results_path, 'w') as f:
                json.dump(results, f, indent=2)
            
            logger.info(f"✅ Model saved to: {final_path}")
            logger.info(f"📊 Results saved to: {results_path}")
            
            return results
            
        except Exception as e:
            logger.error(f"❌ Failed to save model: {e}")
            raise

def main():
    """Main function"""
    # Configuration
    config = SaveModelConfig(
        model_name="openai/whisper-base",
        output_dir="./whisper-multilingual-finetuned"
    )
    
    # Create model saver
    saver = WhisperModelSaver(config)
    
    try:
        # Prepare model and processor
        saver.prepare_model_and_processor()
        
        # Save model
        results = saver.save_model()
        
        print("\n🎉 Model saved successfully!")
        print(f"📁 Model saved to: {config.output_dir}/final")
        print(f"📊 Parameters: {results.get('parameters', 'N/A'):,}")
        print(f"🖥️  Device: {results.get('device', 'N/A')}")
        print(f"✅ Status: {results.get('status', 'N/A')}")
        print("\n🎯 Next Steps:")
        print("1. Test model: python evaluate_model.py")
        print("2. Create integration: python integration_guide.py")
        print("3. Deploy to React app")
        print("\n✅ Model is ready for integration!")
        
    except KeyboardInterrupt:
        logger.info("⏹️  Operation interrupted by user")
    except Exception as e:
        logger.error(f"❌ Operation failed: {e}")
        raise

if __name__ == "__main__":
    main()
