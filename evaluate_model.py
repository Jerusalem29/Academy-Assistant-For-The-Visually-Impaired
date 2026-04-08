#!/usr/bin/env python3
"""
Model Evaluation Script for Multilingual Whisper
Tests model performance on each language separately
"""

import torch
import numpy as np
from transformers import WhisperProcessor, WhisperForConditionalGeneration
from datasets import load_from_disk
import librosa
import json
import logging
from pathlib import Path
from typing import Dict, List, Tuple
import evaluate
from tqdm import tqdm
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class MultilingualModelEvaluator:
    def __init__(self, model_path: str, dataset_path: str):
        self.model_path = Path(model_path)
        self.dataset_path = Path(dataset_path)
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        # Language configurations
        self.languages = {
            "af": "Afaan Oromo",
            "am": "Amharic",
            "en": "English"
        }
        
        # Load model and processor
        self.load_model()
        
        # Load metrics
        self.wer_metric = evaluate.load("wer")
        self.cer_metric = evaluate.load("cer")
        
        logger.info(f"🖥️  Using device: {self.device}")
    
    def load_model(self):
        """Load trained model and processor"""
        logger.info("🤖 Loading trained model...")
        
        try:
            self.model = WhisperForConditionalGeneration.from_pretrained(
                str(self.model_path),
                torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
            )
            self.model.to(self.device)
            self.model.eval()
            
            self.processor = WhisperProcessor.from_pretrained(str(self.model_path))
            
            logger.info("✅ Model loaded successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to load model: {e}")
            raise
    
    def load_test_dataset(self) -> Dict:
        """Load test dataset split by language"""
        logger.info("📂 Loading test dataset...")
        
        try:
            dataset = load_from_disk(str(self.dataset_path))
            
            # Split if not already split
            if "train" not in dataset.column_names:
                dataset = dataset.train_test_split(test_size=0.1, seed=42)
            
            test_dataset = dataset["test"]
            
            # Group by language
            language_datasets = {}
            for lang_code in self.languages.keys():
                lang_mask = [lang == lang_code for lang in test_dataset["language_code"]]
                if any(lang_mask):
                    language_datasets[lang_code] = test_dataset.select(
                        [i for i, mask in enumerate(lang_mask) if mask]
                    )
                    logger.info(f"📊 {self.languages[lang_code]}: {len(language_datasets[lang_code])} test samples")
                else:
                    logger.warning(f"⚠️ No test samples found for {self.languages[lang_code]}")
            
            return language_datasets
            
        except Exception as e:
            logger.error(f"❌ Failed to load dataset: {e}")
            raise
    
    def transcribe_audio(self, audio_path: str, language: str = None) -> str:
        """Transcribe a single audio file"""
        try:
            # Load audio
            audio, sr = librosa.load(audio_path, sr=16000)
            
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
                    max_length=448,
                    num_beams=1,
                    task="transcribe",
                    language=language
                )
            
            # Decode prediction
            transcription = self.processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]
            
            return transcription
            
        except Exception as e:
            logger.error(f"❌ Failed to transcribe {audio_path}: {e}")
            return ""
    
    def evaluate_language(self, test_dataset, language_code: str, sample_size: int = None) -> Dict:
        """Evaluate model on specific language"""
        logger.info(f"🔍 Evaluating {self.languages[language_code]}...")
        
        # Sample data if specified
        if sample_size and len(test_dataset) > sample_size:
            indices = np.random.choice(len(test_dataset), sample_size, replace=False)
            test_dataset = test_dataset.select(indices)
        
        predictions = []
        references = []
        confidences = []
        
        for sample in tqdm(test_dataset, desc=f"Testing {language_code}"):
            # Get audio path and reference text
            if isinstance(sample["audio"], str):
                audio_path = sample["audio"]
            else:
                # If audio is already loaded, save temporarily
                temp_path = f"temp_audio_{language_code}_{len(predictions)}.wav"
                sf.write(temp_path, sample["audio"], 16000)
                audio_path = temp_path
            
            reference = sample["text"]
            
            # Transcribe
            prediction = self.transcribe_audio(audio_path, language_code)
            
            if prediction:
                predictions.append(prediction)
                references.append(reference)
                
                # Calculate confidence (simple heuristic based on common words)
                confidence = self.calculate_confidence(prediction, reference, language_code)
                confidences.append(confidence)
            
            # Clean up temp file if created
            if audio_path.startswith("temp_audio_"):
                Path(audio_path).unlink(missing_ok=True)
        
        # Calculate metrics
        if predictions:
            wer_score = self.wer_metric.compute(predictions=predictions, references=references)
            cer_score = self.cer_metric.compute(predictions=predictions, references=references)
            avg_confidence = np.mean(confidences)
            
            results = {
                "language": self.languages[language_code],
                "language_code": language_code,
                "samples": len(predictions),
                "wer": wer_score * 100,  # Convert to percentage
                "cer": cer_score * 100,
                "avg_confidence": avg_confidence,
                "predictions": predictions,
                "references": references
            }
            
            logger.info(f"✅ {self.languages[language_code]} - WER: {wer_score*100:.2f}%, CER: {cer_score*100:.2f}%")
            
        else:
            results = {
                "language": self.languages[language_code],
                "language_code": language_code,
                "samples": 0,
                "wer": 0,
                "cer": 0,
                "avg_confidence": 0,
                "predictions": [],
                "references": []
            }
            
            logger.warning(f"⚠️ No valid predictions for {self.languages[language_code]}")
        
        return results
    
    def calculate_confidence(self, prediction: str, reference: str, language: str) -> float:
        """Calculate confidence score for prediction"""
        if not prediction or not reference:
            return 0.0
        
        # Simple confidence based on character overlap
        pred_chars = set(prediction.lower())
        ref_chars = set(reference.lower())
        
        if not ref_chars:
            return 0.0
        
        overlap = len(pred_chars.intersection(ref_chars))
        confidence = overlap / len(ref_chars)
        
        # Boost confidence for language-specific features
        if language == "am":  # Amharic has Ge'ez script
            if any('\u1200' <= c <= '\u137F' for c in prediction):
                confidence *= 1.2
        elif language == "af":  # Afaan Oromo uses Latin script with special characters
            if any(c in prediction for c in "እውጽኽትምግባ"):
                confidence *= 1.1
        
        return min(confidence, 1.0)
    
    def evaluate_all_languages(self, sample_size: int = None) -> Dict:
        """Evaluate model on all languages"""
        logger.info("🚀 Starting multilingual evaluation...")
        
        # Load test datasets
        test_datasets = self.load_test_dataset()
        
        # Evaluate each language
        all_results = {}
        for lang_code, dataset in test_datasets.items():
            results = self.evaluate_language(dataset, lang_code, sample_size)
            all_results[lang_code] = results
        
        # Calculate overall metrics
        if all_results:
            total_samples = sum(r["samples"] for r in all_results.values())
            if total_samples > 0:
                overall_wer = sum(r["wer"] * r["samples"] for r in all_results.values()) / total_samples
                overall_cer = sum(r["cer"] * r["samples"] for r in all_results.values()) / total_samples
                overall_confidence = sum(r["avg_confidence"] * r["samples"] for r in all_results.values()) / total_samples
                
                all_results["overall"] = {
                    "language": "Overall",
                    "language_code": "all",
                    "samples": total_samples,
                    "wer": overall_wer,
                    "cer": overall_cer,
                    "avg_confidence": overall_confidence
                }
        
        return all_results
    
    def save_results(self, results: Dict, output_dir: str = "./evaluation_results"):
        """Save evaluation results"""
        output_path = Path(output_dir)
        output_path.mkdir(exist_ok=True)
        
        # Save detailed results
        detailed_results = {}
        for lang_code, result in results.items():
            detailed_results[lang_code] = {
                k: v for k, v in result.items() 
                if k not in ["predictions", "references"]
            }
        
        results_file = output_path / "evaluation_summary.json"
        with open(results_file, 'w', encoding='utf-8') as f:
            json.dump(detailed_results, f, indent=2, ensure_ascii=False)
        
        # Save detailed predictions
        predictions_file = output_path / "detailed_predictions.json"
        with open(predictions_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        # Create summary table
        self.create_summary_table(results, output_path)
        
        # Create visualizations
        self.create_visualizations(results, output_path)
        
        logger.info(f"📊 Results saved to {output_path}")
    
    def create_summary_table(self, results: Dict, output_path: Path):
        """Create summary table of results"""
        table_data = []
        for lang_code, result in results.items():
            table_data.append({
                "Language": result["language"],
                "Code": result["language_code"],
                "Samples": result["samples"],
                "WER (%)": f"{result['wer']:.2f}",
                "CER (%)": f"{result['cer']:.2f}",
                "Confidence": f"{result['avg_confidence']:.3f}"
            })
        
        df = pd.DataFrame(table_data)
        
        # Save as CSV
        df.to_csv(output_path / "results_table.csv", index=False)
        
        # Save as markdown
        with open(output_path / "results_table.md", 'w', encoding='utf-8') as f:
            f.write("# Evaluation Results\n\n")
            f.write(df.to_markdown(index=False))
        
        # Print table
        print("\n" + "="*80)
        print("EVALUATION RESULTS")
        print("="*80)
        print(df.to_string(index=False))
        print("="*80)
    
    def create_visualizations(self, results: Dict, output_path: Path):
        """Create visualization plots"""
        try:
            # Set up matplotlib
            plt.style.use('seaborn-v0_8')
            fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 10))
            
            languages = [r["language"] for r in results.values() if r["samples"] > 0]
            wer_scores = [r["wer"] for r in results.values() if r["samples"] > 0]
            cer_scores = [r["cer"] for r in results.values() if r["samples"] > 0]
            samples = [r["samples"] for r in results.values() if r["samples"] > 0]
            confidences = [r["avg_confidence"] for r in results.values() if r["samples"] > 0]
            
            # WER bar chart
            ax1.bar(languages, wer_scores, color='skyblue')
            ax1.set_title('Word Error Rate (WER) by Language')
            ax1.set_ylabel('WER (%)')
            ax1.tick_params(axis='x', rotation=45)
            
            # CER bar chart
            ax2.bar(languages, cer_scores, color='lightcoral')
            ax2.set_title('Character Error Rate (CER) by Language')
            ax2.set_ylabel('CER (%)')
            ax2.tick_params(axis='x', rotation=45)
            
            # Sample distribution
            ax3.pie(samples, labels=languages, autopct='%1.1f%%')
            ax3.set_title('Test Sample Distribution')
            
            # Confidence scores
            ax4.bar(languages, confidences, color='lightgreen')
            ax4.set_title('Average Confidence by Language')
            ax4.set_ylabel('Confidence')
            ax4.tick_params(axis='x', rotation=45)
            
            plt.tight_layout()
            plt.savefig(output_path / "evaluation_plots.png", dpi=300, bbox_inches='tight')
            plt.close()
            
            logger.info("📈 Visualizations saved")
            
        except Exception as e:
            logger.warning(f"⚠️ Could not create visualizations: {e}")
    
    def test_single_file(self, audio_path: str, language: str = "en"):
        """Test model on a single audio file"""
        logger.info(f"🎵 Testing on {audio_path} (language: {language})")
        
        transcription = self.transcribe_audio(audio_path, language)
        
        print(f"\n📝 Transcription: {transcription}")
        print(f"🌍 Language: {self.languages.get(language, language)}")
        
        return transcription

def main():
    """Main evaluation function"""
    # Configuration
    model_path = "./whisper-multilingual-finetuned/final"
    dataset_path = "./multilingual_speech_dataset"
    output_dir = "./evaluation_results"
    
    # Create evaluator
    evaluator = MultilingualModelEvaluator(model_path, dataset_path)
    
    try:
        # Evaluate all languages
        results = evaluator.evaluate_all_languages(sample_size=100)  # Limit for faster testing
        
        # Save results
        evaluator.save_results(results, output_dir)
        
        print(f"\n🎉 Evaluation completed!")
        print(f"📁 Results saved to: {output_dir}")
        
        # Optional: Test on a specific file
        # evaluator.test_single_file("path/to/test/audio.wav", "en")
        
    except Exception as e:
        logger.error(f"❌ Evaluation failed: {e}")
        raise

if __name__ == "__main__":
    main()
