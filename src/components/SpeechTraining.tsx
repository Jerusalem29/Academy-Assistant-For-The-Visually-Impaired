import React, { useState, useEffect } from 'react';
import { FaMicrophone, FaVolumeUp, FaGraduationCap, FaCheckCircle, FaRedo, FaPlay } from 'react-icons/fa';
import { SpeechRecognitionEnhancer, TrainingUtils, TRAINING_EXAMPLES } from '../utils/speechRecognitionTraining';
import './SpeechTraining.css';

interface SpeechTrainingProps {
  onTrainingComplete?: () => void;
  context?: 'registration' | 'navigation' | 'academic' | 'accessibility';
}

const SpeechTraining: React.FC<SpeechTrainingProps> = ({ 
  onTrainingComplete, 
  context = 'registration' 
}) => {
  const [isTraining, setIsTraining] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState('');
  const [userTranscript, setUserTranscript] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [trainingPhase, setTrainingPhase] = useState<'intro' | 'practice' | 'test' | 'complete'>('intro');
  const [recognition, setRecognition] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const enhancer = new SpeechRecognitionEnhancer();
    const recognitionInstance = enhancer.getRecognition();
    
    if (recognitionInstance) {
      enhancer.trainForContext(context);
      
      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        const confidence = event.results[event.results.length - 1][0].confidence;
        
        setUserTranscript(transcript);
        
        // Check if it matches expected phrase
        if (currentPhrase && transcript.toLowerCase().includes(currentPhrase.toLowerCase().substring(0, 20))) {
          setSuccessCount(prev => prev + 1);
          setTimeout(() => {
            nextPhrase();
          }, 1500);
        }
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }

    return () => {
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
    };
  }, [context]);

  const startTraining = () => {
    setIsTraining(true);
    setTrainingPhase('practice');
    setAttempts(0);
    setSuccessCount(0);
    nextPhrase();
  };

  const nextPhrase = () => {
    const examples = TRAINING_EXAMPLES[context] || [];
    const randomIndex = Math.floor(Math.random() * examples.length);
    setCurrentPhrase(examples[randomIndex]);
    setUserTranscript('');
    setAttempts(prev => prev + 1);
  };

  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const calculateAccuracy = () => {
    return attempts > 0 ? Math.round((successCount / attempts) * 100) : 0;
  };

  const renderIntro = () => (
    <div className="training-intro">
      <div className="training-header">
        <FaGraduationCap className="training-icon" />
        <h2>Speech Recognition Training</h2>
        <p>Train your voice to work better with our accessibility features</p>
      </div>

      <div className="training-tips">
        <h3>Tips for Best Results:</h3>
        <ul>
          {TrainingUtils.getTrainingTips().map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      </div>

      <div className="training-context">
        <h3>You'll be training for: <span className="context-name">{context}</span></h3>
        <div className="example-phrases">
          <h4>Example phrases you'll practice:</h4>
          {TRAINING_EXAMPLES[context]?.slice(0, 3).map((phrase, index) => (
            <div key={index} className="example-phrase">"{phrase}"</div>
          ))}
        </div>
      </div>

      <button className="start-training-btn" onClick={startTraining}>
        <FaPlay /> Start Training
      </button>
    </div>
  );

  const renderPractice = () => (
    <div className="training-practice">
      <div className="training-progress">
        <div className="progress-info">
          <span>Attempts: {attempts}</span>
          <span>Success Rate: {calculateAccuracy()}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${calculateAccuracy()}%` }}
          />
        </div>
      </div>

      <div className="practice-area">
        <div className="target-phrase">
          <h3>Say this phrase:</h3>
          <div className="phrase-display">{currentPhrase}</div>
        </div>

        <div className="user-input">
          <button 
            className={`listen-btn ${isListening ? 'listening' : ''}`}
            onClick={toggleListening}
          >
            <FaMicrophone className={isListening ? 'pulse' : ''} />
            {isListening ? 'Listening...' : 'Tap to Speak'}
          </button>

          {userTranscript && (
            <div className="transcript-display">
              <h4>You said:</h4>
              <div className={`transcript-text ${
                userTranscript.toLowerCase().includes(currentPhrase.toLowerCase().substring(0, 20)) 
                  ? 'success' : 'error'
              }`}>
                {userTranscript}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="practice-controls">
        <button className="skip-btn" onClick={nextPhrase}>
          Skip Phrase
        </button>
        <button className="complete-btn" onClick={() => setTrainingPhase('test')}>
          Complete Practice
        </button>
      </div>
    </div>
  );

  const renderTest = () => (
    <div className="training-test">
      <div className="test-header">
        <h3>Final Test</h3>
        <p>Let's test your training with random phrases</p>
      </div>

      <div className="test-results">
        <div className="accuracy-display">
          <FaCheckCircle className="accuracy-icon" />
          <div className="accuracy-text">
            <h4>Your Accuracy</h4>
            <div className="accuracy-percentage">{calculateAccuracy()}%</div>
          </div>
        </div>

        <div className="test-summary">
          <p>Total Attempts: {attempts}</p>
          <p>Successful: {successCount}</p>
          <p>Failed: {attempts - successCount}</p>
        </div>
      </div>

      <div className="test-actions">
        <button className="retry-btn" onClick={() => setTrainingPhase('practice')}>
          <FaRedo /> Practice More
        </button>
        <button className="finish-btn" onClick={() => {
          setTrainingPhase('complete');
          onTrainingComplete?.();
        }}>
          <FaCheckCircle /> Finish Training
        </button>
      </div>
    </div>
  );

  const renderComplete = () => (
    <div className="training-complete">
      <div className="complete-header">
        <FaCheckCircle className="complete-icon" />
        <h2>Training Complete!</h2>
        <p>Your speech recognition is now optimized for {context}</p>
      </div>

      <div className="complete-stats">
        <h3>Your Results:</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{calculateAccuracy()}%</span>
            <span className="stat-label">Accuracy</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{attempts}</span>
            <span className="stat-label">Total Attempts</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{successCount}</span>
            <span className="stat-label">Successful</span>
          </div>
        </div>
      </div>

      <div className="complete-tips">
        <h3>Next Steps:</h3>
        <ul>
          <li>Use clear, consistent speech when giving commands</li>
          <li>Practice regularly to maintain accuracy</li>
          <li>Retrain if you notice decreased performance</li>
          <li>Ensure quiet environment for best results</li>
        </ul>
      </div>

      <button className="close-btn" onClick={onTrainingComplete}>
        Close Training
      </button>
    </div>
  );

  return (
    <div className="speech-training">
      <div className="training-container">
        {trainingPhase === 'intro' && renderIntro()}
        {trainingPhase === 'practice' && renderPractice()}
        {trainingPhase === 'test' && renderTest()}
        {trainingPhase === 'complete' && renderComplete()}
      </div>
    </div>
  );
};

export default SpeechTraining;
