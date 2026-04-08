#!/usr/bin/env python3
"""
Multilingual Whisper Training with Real Kaggle Datasets
Supports Afaan Oromo, Amharic, and English languages
"""

import torch
import numpy as np
import json
import os
import logging
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field

# Import our multilingual dataset loader
from multilingual_dataset_loader import MultilingualDatasetLoader

# Try to import transformers
try:
    from transformers import (
        WhisperProcessor,
        WhisperForConditionalGeneration,
        TrainingArguments,
        Trainer,
        DataCollatorForSeq2Seq
    )
except ImportError as e:
    print(f"Failed to import transformers: {e}")
    print("Please install: pip install transformers")
    exit(1)

# Try to import evaluate
try:
    import evaluate
except ImportError as e:
    print(f"Failed to import evaluate: {e}")
    print("Please install: pip install evaluate")
    exit(1)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class MultilingualTrainingConfig:
    """Configuration for multilingual Whisper training"""
    model_name: str = "openai/whisper-base"
    dataset_base_dir: str = "./kaggle_datasets"
    output_dir: str = "./whisper-multilingual-trained"
    
    # Training hyperparameters
    learning_rate: float = 2e-5
    batch_size: int = 2
    max_steps: int = 100
    eval_steps: int = 25
    save_steps: int = 25
    logging_steps: int = 10
    warmup_steps: int = 10
    gradient_accumulation_steps: int = 1
    
    # Model parameters
    max_length: int = 448
    fp16: bool = False
    
    # Hardware
    dataloader_num_workers: int = 1

class MultilingualWhisperTrainer:
    def __init__(self, config: MultilingualTrainingConfig):
        self.config = config
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"Using device: {self.device}")
        
        # Initialize dataset loader
        self.dataset_loader = MultilingualDatasetLoader(config.dataset_base_dir)
        
    def load_and_prepare_datasets(self) -> Tuple[List[Dict], List[Dict]]:
        """Load and prepare multilingual datasets"""
        logger.info("Loading and preparing multilingual datasets...")
        
        try:
            # Load all datasets
            datasets = self.dataset_loader.load_all_datasets()
            
            # Get statistics
            stats = self.dataset_loader.get_dataset_statistics(datasets)
            logger.info(f"Dataset statistics: {stats}")
            
            # Prepare model and processor
            self.prepare_model_and_processor()
            
            # Prepare datasets for training
            train_data, test_data = self.dataset_loader.prepare_dataset_for_training(
                datasets, self.processor
            )
            
            logger.info(f"Datasets prepared: Train={len(train_data)}, Test={len(test_data)}")
            return train_data, test_data
            
        except Exception as e:
            logger.error(f"Failed to load and prepare datasets: {e}")
            raise
    
    def prepare_model_and_processor(self):
        """Initialize Whisper model and processor for multilingual training"""
        logger.info("Initializing multilingual Whisper model and processor...")
        
        try:
            # Load model
            self.model = WhisperForConditionalGeneration.from_pretrained(
                self.config.model_name,
                torch_dtype=torch.float32
            )
            
            # Load processor with multilingual support
            self.processor = WhisperProcessor.from_pretrained(
                self.config.model_name,
                language="en",  # Default language
                task="transcribe"
            )
            
            # Set forced decoder IDs for multilingual
            self.model.config.forced_decoder_ids = self.processor.get_decoder_prompt_ids(
                language="en", task="transcribe"
            )
            
            # Move model to device
            self.model.to(self.device)
            
            logger.info(f"Model loaded: {self.config.model_name}")
            logger.info(f"Model parameters: {self.model.num_parameters():,}")
            
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise
    
    def create_data_collator(self):
        """Create data collator for multilingual training"""
        return DataCollatorForSeq2Seq(
            tokenizer=self.processor.tokenizer,
            model=self.model,
            padding=True
        )
    
    def compute_metrics(self, eval_pred):
        """Compute evaluation metrics for multilingual data"""
        predictions, labels = eval_pred
        
        # Replace -100 with pad token ID
        labels[labels == -100] = self.processor.tokenizer.pad_token_id
        
        # Decode predictions and labels
        pred_str = self.processor.batch_decode(predictions, skip_special_tokens=True)
        label_str = self.processor.batch_decode(labels, skip_special_tokens=True)
        
        # Compute WER
        wer_metric = evaluate.load("wer")
        overall_wer = wer_metric.compute(predictions=pred_str, references=label_str)
        
        # Compute CER
        cer_metric = evaluate.load("cer")
        overall_cer = cer_metric.compute(predictions=pred_str, references=label_str)
        
        metrics = {
            "wer": overall_wer * 100,
            "cer": overall_cer * 100
        }
        
        logger.info(f"WER: {metrics['wer']:.2f}%, CER: {metrics['cer']:.2f}%")
        
        return metrics
    
    def setup_training_arguments(self) -> TrainingArguments:
        """Setup training arguments for multilingual training"""
        return TrainingArguments(
            output_dir=self.config.output_dir,
            per_device_train_batch_size=self.config.batch_size,
            per_device_eval_batch_size=self.config.batch_size,
            gradient_accumulation_steps=self.config.gradient_accumulation_steps,
            learning_rate=self.config.learning_rate,
            warmup_steps=self.config.warmup_steps,
            max_steps=self.config.max_steps,
            fp16=self.config.fp16,
            eval_strategy="steps",
            eval_steps=self.config.eval_steps,
            save_strategy="steps",
            save_steps=self.config.save_steps,
            logging_steps=self.config.logging_steps,
            load_best_model_at_end=True,
            metric_for_best_model="wer",
            greater_is_better=False,
            do_train=True,
            do_eval=True,
            do_predict=True,
            prediction_loss_only=False,
            remove_unused_columns=False,
            report_to=[],  # No external reporting
            dataloader_num_workers=self.config.dataloader_num_workers,
        )
    
    def create_trainer(self, train_dataset, eval_dataset, data_collator):
        """Create the trainer for multilingual training"""
        training_args = self.setup_training_arguments()
        
        return Trainer(
            model=self.model,
            args=training_args,
            train_dataset=train_dataset,
            eval_dataset=eval_dataset,
            data_collator=data_collator,
            compute_metrics=self.compute_metrics
        )
    
    def train(self):
        """Execute multilingual training"""
        logger.info("Starting multilingual Whisper training...")
        
        try:
            # Load and prepare datasets
            train_dataset, eval_dataset = self.load_and_prepare_datasets()
            
            # Create data collator
            data_collator = self.create_data_collator()
            
            # Create trainer
            trainer = self.create_trainer(train_dataset, eval_dataset, data_collator)
            
            # Start training
            logger.info("Starting training loop...")
            trainer.train()
            
            # Save final model
            logger.info("Saving final model...")
            trainer.save_model(f"{self.config.output_dir}/final")
            self.processor.save_pretrained(f"{self.config.output_dir}/final")
            
            # Final evaluation
            logger.info("Running final evaluation...")
            eval_results = trainer.evaluate()
            
            # Save results
            results_path = Path(self.config.output_dir) / "training_results.json"
            with open(results_path, 'w') as f:
                json.dump(eval_results, f, indent=2)
            
            logger.info(f"Training completed! Results saved to {results_path}")
            logger.info(f"Final WER: {eval_results.get('eval_wer', 'N/A'):.2f}%")
            
            return eval_results
            
        except Exception as e:
            logger.error(f"Training failed: {e}")
            raise

def main():
    """Main training function"""
    print("MULTILINGUAL WHISPER TRAINING")
    print("=" * 50)
    print("Languages: Afaan Oromo, Amharic, English")
    print("Datasets: Real Kaggle multilingual datasets")
    print("=" * 50)
    
    # Configuration
    config = MultilingualTrainingConfig(
        model_name="openai/whisper-base",
        dataset_base_dir="./kaggle_datasets",
        output_dir="./whisper-multilingual-trained",
        
        # Training parameters
        batch_size=2,
        max_steps=100,
        learning_rate=2e-5,
        fp16=False,
        dataloader_num_workers=1,
    )
    
    # Create trainer
    trainer = MultilingualWhisperTrainer(config)
    
    try:
        # Start training
        results = trainer.train()
        
        print("\n" + "=" * 50)
        print("TRAINING COMPLETED SUCCESSFULLY!")
        print("=" * 50)
        print(f"Model saved to: {config.output_dir}")
        print(f"Final WER: {results.get('eval_wer', 'N/A'):.2f}%")
        print(f"Final CER: {results.get('eval_cer', 'N/A'):.2f}%")
        print("=" * 50)
        print("Next Steps:")
        print("1. Test model: python test_multilingual_model.py")
        print("2. Update Flask API to use new model")
        print("3. Test multilingual transcription")
        
        return results
        
    except KeyboardInterrupt:
        logger.info("Training interrupted by user")
    except Exception as e:
        logger.error(f"Training failed: {e}")
        raise

if __name__ == "__main__":
    main()
        except Exception as e:
            logger.error(f"❌ Failed to load dataset: {e}")
            raise
    
    def prepare_model_and_processor(self):
        """Initialize Whisper model and processor"""
        logger.info("🤖 Initializing Whisper model and processor...")
        
        # Load model
        self.model = WhisperForConditionalGeneration.from_pretrained(
            self.config.model_name,
            torch_dtype=torch.float16 if self.config.fp16 else torch.float32
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
    
    def prepare_dataset_for_training(self, dataset: Dict):
        """Prepare dataset features for training"""
        logger.info("🔧 Preparing dataset features...")
        
        def prepare_dataset(batch):
            """Process audio and text for training"""
            
            # Load and process audio
            audio_arrays = []
            for audio_path in batch["audio"]:
                if isinstance(audio_path, str):
                    # Load audio file
                    audio, sr = librosa.load(audio_path, sr=16000)
                    audio_arrays.append(audio)
                else:
                    # Already loaded audio array
                    audio_arrays.append(audio_path)
            
            # Process with Whisper processor
            inputs = self.processor(
                audio=audio_arrays,
                text=batch["text"],
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
        
        # Compute WER for each language
        wer_metric = evaluate.load("wer")
        
        # Overall WER
        overall_wer = wer_metric.compute(predictions=pred_str, references=label_str)
        
        # Language-specific WER (if we have language info)
        language_wers = {}
        # Note: This would require language info in the dataset
        
        metrics = {
            "wer": overall_wer,
            "cer": self.compute_cer(pred_str, label_str)
        }
        
        # Log to wandb
        wandb.log(metrics)
        
        return metrics
    
    def compute_cer(self, predictions: List[str], references: List[str]) -> float:
        """Compute Character Error Rate"""
        cer_metric = evaluate.load("cer")
        return cer_metric.compute(predictions=predictions, references=references)
    
    def setup_training_arguments(self) -> Seq2SeqTrainingArguments:
        """Setup training arguments"""
        return Seq2SeqTrainingArguments(
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
            report_to=["wandb"],
            load_best_model_at_end=True,
            metric_for_best_model=self.config.metric_for_best_model,
            greater_is_better=self.config.greater_is_better,
            predict_with_generate=True,
            generation_max_length=self.config.max_length,
            generation_num_beams=self.config.num_beams,
            dataloader_num_workers=self.config.dataloader_num_workers,
            remove_unused_columns=False,
            label_smoothing_factor=0.1,
            group_by_length=True,
        )
    
    def create_trainer(self, train_dataset, eval_dataset, data_collator):
        """Create the trainer"""
        training_args = self.setup_training_arguments()
        
        return Seq2SeqTrainer(
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
        logger.info("🚀 Starting multilingual Whisper fine-tuning...")
        
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
        logger.info(f"📊 Final WER: {eval_results.get('eval_wer', 'N/A')}")
        
        return eval_results
    
    def test_model(self, test_audio_path: str, language: str = "en"):
        """Test the trained model on a single audio file"""
        logger.info(f"🎵 Testing model on {test_audio_path}...")
        
        # Load audio
        audio, sr = librosa.load(test_audio_path, sr=16000)
        
        # Process audio
        inputs = self.processor(
            audio=audio,
            sampling_rate=16000,
            return_tensors="pt"
        ).to(self.device)
        
        # Generate transcription
        with torch.no_grad():
            predicted_ids = self.model.generate(
                inputs.input_features,
                max_length=self.config.max_length,
                num_beams=self.config.num_beams,
                task="transcribe",
                language=language
            )
        
        # Decode prediction
        transcription = self.processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]
        
        logger.info(f"📝 Transcription: {transcription}")
        
        return transcription
    
    def export_model(self, export_dir: str):
        """Export model for deployment"""
        logger.info(f"📦 Exporting model to {export_dir}...")
        
        export_path = Path(export_dir)
        export_path.mkdir(exist_ok=True)
        
        # Save model
        self.model.save_pretrained(str(export_path))
        
        # Save processor
        self.processor.save_pretrained(str(export_path))
        
        # Save config
        config_path = export_path / "training_config.json"
        with open(config_path, 'w') as f:
            json.dump(self.config.__dict__, f, indent=2)
        
        logger.info(f"✅ Model exported to {export_path}")

def main():
    """Main training function"""
    # Configuration
    config = TrainingConfig(
        model_name="openai/whisper-base",
        dataset_path="./multilingual_speech_dataset",
        output_dir="./whisper-multilingual-finetuned",
        
        # Adjust these based on your GPU memory
        batch_size=4,  # Reduce if you get OOM errors
        gradient_accumulation_steps=4,  # Increase to maintain effective batch size
        max_steps=5000,  # Reduce for faster testing
        
        # Learning rate
        learning_rate=1e-5,
        warmup_steps=500,
        
        # Hardware
        fp16=torch.cuda.is_available(),
    )
    
    # Create trainer
    trainer = MultilingualWhisperTrainer(config)
    
    try:
        # Start training
        results = trainer.train()
        
        # Export model
        trainer.export_model("./whisper-multilingual-final")
        
        print("\n🎉 Training completed successfully!")
        print(f"📁 Model saved to: {config.output_dir}")
        print(f"📊 Final WER: {results.get('eval_wer', 'N/A')}")
        
    except KeyboardInterrupt:
        logger.info("⏹️  Training interrupted by user")
    except Exception as e:
        logger.error(f"❌ Training failed: {e}")
        raise
    finally:
        wandb.finish()

if __name__ == "__main__":
    main()
