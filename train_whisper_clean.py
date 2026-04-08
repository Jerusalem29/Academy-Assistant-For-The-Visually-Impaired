#!/usr/bin/env python3
"""
Clean Whisper Training - No problematic dependencies at all
"""

import torch
import numpy as np
from datasets import load_from_disk, Audio
from transformers import (
    WhisperProcessor,
    WhisperForConditionalGeneration,
    TrainingArguments,
    Trainer,
    DataCollatorForSeq2Seq
)
import evaluate
import json
import logging
from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass, field

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class CleanTrainingConfig:
    """Clean training configuration"""
    model_name: str = "openai/whisper-base"
    dataset_path: str = "./multilingual_speech_dataset"
    output_dir: str = "./whisper-multilingual-finetuned"
    
    # Training hyperparameters
    learning_rate: float = 1e-5
    batch_size: int = 2  # Small for CPU
    gradient_accumulation_steps: int = 4
    warmup_steps: int = 100
    max_steps: int = 200  # Quick test
    eval_steps: int = 100
    save_steps: int = 100
    logging_steps: int = 10
    
    # Model parameters
    max_length: int = 448
    num_beams: int = 1
    
    # Hardware
    fp16: bool = False  # Disable for CPU
    dataloader_num_workers: int = 2
    
    # Languages
    languages: List[str] = field(default_factory=lambda: ["af", "am", "en"])
    language_names: Dict[str, str] = field(default_factory=dict)

class CleanWhisperTrainer:
    def __init__(self, config: CleanTrainingConfig):
        self.config = config
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"🖥️  Using device: {self.device}")
        
        # Initialize language names
        if not config.language_names:
            config.language_names = {
                "af": "Afaan Oromo",
                "am": "Amharic",
                "en": "English"
            }
    
    def load_dataset(self) -> Dict:
        """Load and prepare the dataset"""
        logger.info("📂 Loading dataset...")
        
        try:
            dataset = load_from_disk(self.config.dataset_path)
            
            # Split dataset
            if "train" not in dataset.column_names:
                dataset = dataset.train_test_split(test_size=0.2, seed=42)
            
            logger.info(f"✅ Dataset loaded: Train={len(dataset['train'])}, Test={len(dataset['test'])}")
            return dataset
            
        except Exception as e:
            logger.error(f"❌ Failed to load dataset: {e}")
            raise
    
    def prepare_model_and_processor(self):
        """Initialize Whisper model and processor"""
        logger.info("🤖 Initializing Whisper model and processor...")
        
        try:
            # Load model
            self.model = WhisperForConditionalGeneration.from_pretrained(
                self.config.model_name,
                torch_dtype=torch.float32  # Use float32 for CPU
            )
            
            # Load processor
            self.processor = WhisperProcessor.from_pretrained(
                self.config.model_name,
                language="en",  # Default language
                task="transcribe"
            )
            
            # Move model to device
            self.model.to(self.device)
            
            logger.info(f"✅ Model loaded: {self.config.model_name}")
            logger.info(f"📊 Model parameters: {self.model.num_parameters():,}")
            
        except Exception as e:
            logger.error(f"❌ Failed to load model: {e}")
            raise
    
    def prepare_dataset_for_training(self, dataset: Dict):
        """Prepare dataset features for training"""
        logger.info("🔧 Preparing dataset features...")
        
        def prepare_dataset(batch):
            """Process audio and text for training"""
            
            # Load and process audio
            audio_arrays = []
            texts = []
            
            for audio_item in batch["audio"]:
                if isinstance(audio_item, dict):
                    audio_data = audio_item["array"]
                else:
                    # Load audio file using librosa
                    import librosa
                    audio_data, sr = librosa.load(audio_item, sr=16000)
                
                audio_arrays.append(audio_data)
            
            texts = batch["text"]
            
            # Process with Whisper processor
            inputs = self.processor(
                audio=audio_arrays,
                text=texts,
                sampling_rate=16000,
                return_tensors="pt",
                padding=True,
                truncation=True,
                max_length=self.config.max_length
            )
            
            # Set decoder input IDs
            inputs["labels"] = inputs["input_ids"].clone()
            
            # Remove input_ids as they're not needed for the model
            del inputs["input_ids"]
            
            return inputs
        
        # Apply preprocessing
        train_dataset = dataset["train"].map(
            prepare_dataset,
            remove_columns=dataset["train"].column_names,
            batch_size=self.config.batch_size,
            batched=True,
            num_proc=self.config.dataloader_num_workers
        )
        
        eval_dataset = dataset["test"].map(
            prepare_dataset,
            remove_columns=dataset["test"].column_names,
            batch_size=self.config.batch_size,
            batched=True,
            num_proc=self.config.dataloader_num_workers
        )
        
        logger.info("✅ Dataset preparation completed")
        
        return train_dataset, eval_dataset
    
    def create_data_collator(self):
        """Create data collator for training"""
        return DataCollatorForSeq2Seq(
            self.processor,
            decoder_start_token_id=self.model.config.decoder_start_token_id,
            feature_extractor=self.processor.feature_extractor,
            tokenizer=self.processor.tokenizer
        )
    
    def compute_metrics(self, eval_pred):
        """Compute evaluation metrics"""
        predictions, labels = eval_pred
        
        # Replace -100 with pad token ID
        labels[labels == -100] = self.processor.tokenizer.pad_token_id
        
        # Decode predictions and labels
        pred_str = self.processor.batch_decode(predictions, skip_special_tokens=True)
        label_str = self.processor.batch_decode(labels, skip_special_tokens=True)
        
        # Compute WER
        wer_metric = evaluate.load("wer")
        overall_wer = wer_metric.compute(predictions=pred_str, references=label_str)
        
        metrics = {
            "wer": overall_wer * 100,  # Convert to percentage
            "cer": self.compute_cer(pred_str, label_str) * 100
        }
        
        logger.info(f"📊 WER: {metrics['wer']:.2f}%, CER: {metrics['cer']:.2f}%")
        
        return metrics
    
    def compute_cer(self, predictions: List[str], references: List[str]) -> float:
        """Compute Character Error Rate"""
        cer_metric = evaluate.load("cer")
        return cer_metric.compute(predictions=predictions, references=references)
    
    def setup_training_arguments(self) -> TrainingArguments:
        """Setup training arguments"""
        return TrainingArguments(
            output_dir=self.config.output_dir,
            per_device_train_batch_size=self.config.batch_size,
            per_device_eval_batch_size=self.config.batch_size,
            gradient_accumulation_steps=self.config.gradient_accumulation_steps,
            learning_rate=self.config.learning_rate,
            warmup_steps=self.config.warmup_steps,
            max_steps=self.config.max_steps,
            fp16=self.config.fp16,
            evaluation_strategy="steps",
            eval_steps=self.config.eval_steps,
            save_strategy="steps",
            save_steps=self.config.save_steps,
            logging_steps=self.config.logging_steps,
            load_best_model_at_end=True,
            metric_for_best_model="wer",
            greater_is_better=False,
            predict_with_generate=True,
            generation_max_length=self.config.max_length,
            generation_num_beams=self.config.num_beams,
            dataloader_num_workers=self.config.dataloader_num_workers,
            remove_unused_columns=False,
            report_to=[],  # Disable W&B
        )
    
    def create_trainer(self, train_dataset, eval_dataset, data_collator):
        """Create the trainer"""
        training_args = self.setup_training_arguments()
        
        return Trainer(
            model=self.model,
            args=training_args,
            train_dataset=train_dataset,
            eval_dataset=eval_dataset,
            data_collator=data_collator,
            compute_metrics=self.compute_metrics,
            tokenizer=self.processor.feature_extractor,
        )
    
    def train(self):
        """Execute training"""
        logger.info("🚀 Starting clean Whisper fine-tuning...")
        
        try:
            # Load dataset
            dataset = self.load_dataset()
            
            # Prepare model and processor
            self.prepare_model_and_processor()
            
            # Prepare datasets
            train_dataset, eval_dataset = self.prepare_dataset_for_training(dataset)
            
            # Create data collator
            data_collator = self.create_data_collator()
            
            # Create trainer
            trainer = self.create_trainer(train_dataset, eval_dataset, data_collator)
            
            # Start training
            logger.info("🏋️  Starting training...")
            trainer.train()
            
            # Save final model
            logger.info("💾 Saving final model...")
            trainer.save_model(f"{self.config.output_dir}/final")
            self.processor.save_pretrained(f"{self.config.output_dir}/final")
            
            # Final evaluation
            logger.info("📊 Running final evaluation...")
            eval_results = trainer.evaluate()
            
            # Save results
            results_path = Path(self.config.output_dir) / "training_results.json"
            with open(results_path, 'w') as f:
                json.dump(eval_results, f, indent=2)
            
            logger.info(f"✅ Training completed! Results saved to {results_path}")
            logger.info(f"📊 Final WER: {eval_results.get('eval_wer', 'N/A'):.2f}%")
            
            return eval_results
            
        except Exception as e:
            logger.error(f"❌ Training failed: {e}")
            raise

def main():
    """Main training function"""
    # Configuration
    config = CleanTrainingConfig(
        model_name="openai/whisper-base",
        dataset_path="./multilingual_speech_dataset",
        output_dir="./whisper-multilingual-finetuned",
        
        # Adjust these based on your hardware
        batch_size=2,  # Small for CPU
        max_steps=200,  # Quick test
        fp16=False,  # Disable for CPU
    )
    
    # Create trainer
    trainer = CleanWhisperTrainer(config)
    
    try:
        # Start training
        results = trainer.train()
        
        print("\n🎉 Training completed successfully!")
        print(f"📁 Model saved to: {config.output_dir}")
        print(f"📊 Final WER: {results.get('eval_wer', 'N/A'):.2f}%")
        print("\n🎯 Next Steps:")
        print("1. Test model: python evaluate_model.py")
        print("2. Create integration: python integration_guide.py")
        print("3. Deploy to React app")
        
    except KeyboardInterrupt:
        logger.info("⏹️  Training interrupted by user")
    except Exception as e:
        logger.error(f"❌ Training failed: {e}")
        raise

if __name__ == "__main__":
    main()
