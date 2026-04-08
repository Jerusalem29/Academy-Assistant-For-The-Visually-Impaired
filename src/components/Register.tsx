import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaMapMarkerAlt,
  FaBuilding,
  FaCamera,
  FaMicrophone,
  FaVolumeUp,
  FaArrowLeft,
  FaCheckCircle,
  FaGraduationCap,
  FaShieldAlt,
  FaHeadphones,
  FaGraduationCap as FaTraining
} from "react-icons/fa";
import "./Register.css";
import SpeechTraining from "./SpeechTraining";

function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [voiceGuide, setVoiceGuide] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [faceCaptured, setFaceCaptured] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognitionStarted, setRecognitionStarted] = useState(false);
  const [showTraining, setShowTraining] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: ""
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const speak = useCallback((text: string) => {
    if (!voiceGuide) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  }, [voiceGuide]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        speak("Camera activated. Position your face in the center.");
      }
    } catch (err) {
      speak("Camera access failed. You can skip face capture.");
      setError("Camera access failed. Click Skip to continue.");
    }
  }, [speak]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const completeRegistration = useCallback(() => {
    stopCamera();
    speak("Registration in progress...");
    
    setTimeout(() => {
      setSuccess("Registration successful!");
      speak("Registration successful! Redirecting to login.");
      localStorage.setItem('user', JSON.stringify({ name: formData.name, email: formData.email }));
      setTimeout(() => navigate("/login"), 2000);
    }, 2000);
  }, [formData, speak, navigate, stopCamera]);

  const captureFace = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context?.drawImage(videoRef.current, 0, 0);
      
      canvasRef.current.toDataURL('image/jpeg');
      console.log("Face captured");
      
      setFaceCaptured(true);
      speak("Face captured successfully!");
      setTimeout(() => completeRegistration(), 1500);
    }
  }, [speak, completeRegistration]);

  const retakeFace = useCallback(() => {
    setFaceCaptured(false);
    speak("Ready for retake.");
  }, [speak]);

  const skipFace = useCallback(() => {
    speak("Skipping face capture.");
    completeRegistration();
  }, [speak, completeRegistration]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextStep = useCallback(() => {
    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all required fields");
      speak("Please fill in all required fields");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      speak("Passwords do not match");
      return;
    }
    if (!formData.email.includes("@")) {
      setError("Please enter a valid email");
      speak("Please enter a valid email");
      return;
    }
    
    setError("");
    setStep(2);
    startCamera();
  }, [formData, speak, startCamera]);

  const handleVoiceInput = useCallback((command: string) => {
    console.log('Processing command:', command);
    if (step === 1) {
      // Handle form field filling by voice
      const lowerCommand = command.toLowerCase();
      
      // Full Name
      if (lowerCommand.includes("name") || lowerCommand.includes("full name")) {
        console.log('Name command detected, matching patterns...');
        const nameMatch = command.match(/(?:my name is|name is|name:|full name is|full name:|i am|call me)\s*(.+)/i);
        console.log('Name match result:', nameMatch);
        if (nameMatch) {
          setFormData({ ...formData, name: nameMatch[1].trim() });
          console.log('Name set to:', nameMatch[1].trim());
          speak(`Name set to ${nameMatch[1].trim()}`);
        } else {
          console.log('Name pattern not matched, command was:', command);
          speak("Please say your name like: 'My name is John Smith' or 'I am John Smith'");
        }
      }
      
      // Department
      else if (lowerCommand.includes("department")) {
        const deptMatch = command.match(/(?:department is|department:|in the)\s*(.+)/i);
        if (deptMatch) {
          setFormData({ ...formData, department: deptMatch[1].trim() });
          speak(`Department set to ${deptMatch[1].trim()}`);
        } else {
          speak("Please say your department like: 'Department is Computer Science'");
        }
      }
      
      // Email
      else if (lowerCommand.includes("email")) {
        const emailMatch = command.match(/(?:email is|email:|my email is)\s*([^\s]+@[^\s]+\.[^\s]+)/i);
        if (emailMatch) {
          setFormData({ ...formData, email: emailMatch[1].trim() });
          speak(`Email set to ${emailMatch[1].trim()}`);
        } else {
          speak("Please say your email like: 'My email is john@example.com'");
        }
      }
      
      // Phone
      else if (lowerCommand.includes("phone")) {
        const phoneMatch = command.match(/(?:phone is|phone:|my phone is)\s*([\d\s\-+()]+)/i);
        if (phoneMatch) {
          setFormData({ ...formData, phone: phoneMatch[1].trim() });
          speak(`Phone set to ${phoneMatch[1].trim()}`);
        } else {
          speak("Please say your phone number like: 'My phone is 123-456-7890'");
        }
      }
      
      // Password
      else if (lowerCommand.includes("password")) {
        const passMatch = command.match(/(?:password is|password:|my password is)\s*(.+)/i);
        if (passMatch) {
          setFormData({ ...formData, password: passMatch[1].trim() });
          speak("Password set. Please confirm your password");
        } else {
          speak("Please say your password like: 'My password is secret123'");
        }
      }
      
      // Confirm Password
      else if (lowerCommand.includes("confirm")) {
        const confirmMatch = command.match(/(?:confirm password is|confirm:|confirm password)\s*(.+)/i);
        if (confirmMatch) {
          setFormData({ ...formData, confirmPassword: confirmMatch[1].trim() });
          speak("Password confirmation set");
        } else {
          speak("Please confirm your password like: 'Confirm password is secret123'");
        }
      }
      
      // Address
      else if (lowerCommand.includes("address")) {
        const addrMatch = command.match(/(?:address is|address:|my address is)\s*(.+)/i);
        if (addrMatch) {
          setFormData({ ...formData, address: addrMatch[1].trim() });
          speak(`Address set to ${addrMatch[1].trim()}`);
        } else {
          speak("Please say your address like: 'My address is 123 Main Street'");
        }
      }
      
      // Check if form is complete
      else if (lowerCommand.includes("complete") || lowerCommand.includes("done") || lowerCommand.includes("submit")) {
        handleNextStep();
      }
      
      // Read current form status
      else if (lowerCommand.includes("status") || lowerCommand.includes("progress")) {
        const status = `Form status: Name ${formData.name ? 'filled' : 'empty'}, Department ${formData.department ? 'filled' : 'empty'}, Email ${formData.email ? 'filled' : 'empty'}, Phone ${formData.phone ? 'filled' : 'empty'}, Password ${formData.password ? 'filled' : 'empty'}, Confirm password ${formData.confirmPassword ? 'filled' : 'empty'}, Address ${formData.address ? 'filled' : 'empty'}`;
        speak(status);
      }
      
      // Help - moved to last position
      else if (lowerCommand.includes("help")) {
        console.log('Help command detected');
        const helpText = "You can fill the form by saying: My name is [name], Department is [department], My email is [email], My phone is [phone], My password is [password], Confirm password is [password], My address is [address], or say submit when done";
        console.log('Speaking help text:', helpText);
        speak(helpText);
      }
      
      // Unknown command
      else {
        console.log('Unknown command:', command);
        speak("Command not recognized. Say help for instructions.");
      }
    }
    
    if (step === 2) {
      if (command.includes("capture")) captureFace();
      else if (command.includes("retake")) retakeFace();
      else if (command.includes("skip")) skipFace();
    }
  }, [step, formData, speak, captureFace, handleNextStep, retakeFace, skipFace]);

  // Voice recognition
  useEffect(() => {
    if (!voiceGuide) return;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setRecognitionStarted(true);
      };
      recognitionRef.current.onend = () => {
        setIsListening(false);
        setRecognitionStarted(false);
        // Restart listening if voice guide is still on and not already listening
        if (voiceGuide && step === 1) {
          setTimeout(() => {
            if (recognitionRef.current && voiceGuide && !recognitionStarted) {
              try {
                recognitionRef.current.start();
              } catch (error) {
                // Ignore error if already started
                console.log('Speech recognition already running');
              }
            }
          }, 1000);
        }
      };
      recognitionRef.current.onerror = () => setIsListening(false);

      recognitionRef.current.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript.toLowerCase();
        console.log('Voice recognized:', transcript);
        handleVoiceInput(transcript);
      };
    }
  }, [voiceGuide, step, handleVoiceInput, recognitionStarted]);

  useEffect(() => {
    if (step === 1) {
      speak("Welcome to registration. You can fill the form by voice. Say 'help' for instructions or use your keyboard to type.");
      // Start voice recognition after a delay to ensure it's set up
      setTimeout(() => {
        if (voiceGuide && recognitionRef.current && !recognitionStarted) {
          try {
            recognitionRef.current.start();
            console.log('Voice recognition started');
          } catch (error) {
            console.log('Speech recognition already running or failed to start:', error);
          }
        }
      }, 3000);
    } else if (step === 2) {
      speak("Face capture. Please look at the camera. Say capture to take photo, retake to try again, or skip to continue.");
    }
  }, [step, voiceGuide, recognitionStarted, speak]);

  const toggleVoiceGuide = () => {
    setVoiceGuide(!voiceGuide);
    if (!voiceGuide) {
      speak("Voice guidance enabled");
      // Try to start voice recognition manually
      setTimeout(() => {
        if (recognitionRef.current && !recognitionStarted) {
          try {
            recognitionRef.current.start();
            console.log('Voice recognition started manually');
          } catch (error) {
            console.log('Manual start failed:', error);
          }
        }
      }, 1000);
    }
    else {
      window.speechSynthesis.cancel();
    }
  };

  const manualStartVoice = () => {
    if (recognitionRef.current && !recognitionStarted) {
      try {
        recognitionRef.current.start();
        console.log('Voice recognition started manually via button');
        speak("Voice recognition started");
      } catch (error) {
        console.log('Manual start failed:', error);
        speak("Voice recognition failed to start");
      }
    } else if (recognitionStarted) {
      speak("Voice recognition is already running");
    } else {
      speak("Voice recognition not available");
    }
  };

  return (
    <div className="register-split">
      {/* Voice Toggle */}
      <button className="voice-toggle-split" onClick={toggleVoiceGuide}>
        <FaVolumeUp className={voiceGuide ? "active" : ""} />
        <span>Voice {voiceGuide ? "ON" : "OFF"}</span>
      </button>

      {/* Back Button */}
      <button className="back-split" onClick={() => navigate("/")}>
        <FaArrowLeft /> Back
      </button>

      <div className="register-split-container">
        {/* Left Side - Form */}
        <div className="register-split-left">
          <div className="register-card">
            {step === 1 && (
              <>
                <div className="register-header">
                  <h1>Create Account</h1>
                  <p>Join our accessible learning community</p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }}>
                  <div className="form-row">
                    <div className="form-group">
                      <label><FaUser /> Full Name *</label>
                      <input type="text" name="name" placeholder="Enter your full name" value={formData.name} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label><FaBuilding /> Department *</label>
                      <input type="text" name="department" placeholder="Enter your department" value={formData.department} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label><FaEnvelope /> Email *</label>
                      <input type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label><FaPhone /> Phone Number</label>
                      <input type="tel" name="phone" placeholder="Enter your phone" value={formData.phone} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label><FaLock /> Password *</label>
                      <input type="password" name="password" placeholder="Create password" value={formData.password} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label><FaLock /> Confirm Password *</label>
                      <input type="password" name="confirmPassword" placeholder="Confirm password" value={formData.confirmPassword} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <label><FaMapMarkerAlt /> Address</label>
                    <input type="text" name="address" placeholder="Enter your address" value={formData.address} onChange={handleChange} />
                  </div>

                  {error && <div className="error-message">{error}</div>}

                  {isListening && step === 1 && (
                    <div className="listening-form-indicator">
                      <FaMicrophone className="pulse" />
                      <span>🎤 Listening... Say "help" for voice commands</span>
                    </div>
                  )}

                  {!isListening && step === 1 && voiceGuide && (
                    <button type="button" className="manual-voice-start" onClick={manualStartVoice}>
                      <FaMicrophone /> Start Voice Recognition
                    </button>
                  )}

                  <button type="submit" className="next-btn-split">
                    Continue to Face Recognition →
                  </button>
                </form>

                <p className="login-link-split">
                  Already have an account? <a href="/login">Sign in</a>
                </p>
              </>
            )}

            {step === 2 && (
              <div className="face-section">
                <div className="register-header">
                  <h1>Face Recognition</h1>
                  <p>Quick and secure login with your face</p>
                </div>

                <div className={`camera-box ${cameraActive ? 'active' : ''}`}>
                  <video ref={videoRef} autoPlay playsInline className="camera-feed-split" />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                  {!cameraActive && (
                    <div className="camera-placeholder-split">
                      <FaCamera />
                      <p>Initializing camera...</p>
                    </div>
                  )}
                  {faceCaptured && (
                    <div className="capture-success-split">
                      <FaCheckCircle />
                      <p>Face Captured!</p>
                    </div>
                  )}
                </div>

                <div className="camera-buttons">
                  <button className="capture-split" onClick={captureFace} disabled={!cameraActive || faceCaptured}>
                    <FaCamera /> Capture
                  </button>
                  <button className="retake-split" onClick={retakeFace}>Retake</button>
                  <button className="skip-split" onClick={skipFace}>Skip for now</button>
                </div>

                {isListening && <div className="listening-split">🎤 Listening... Say "capture", "retake", or "skip"</div>}
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Info/Illustration */}
        <div className="register-split-right">
          <div className="info-content">
            <div className="info-icon-large">
              <FaGraduationCap />
            </div>
            <h2>Welcome to Academic Assistant</h2>
            <p>Your AI-powered learning companion for visually impaired students at Haramaya University</p>
            
            <div className="info-features">
              <div className="info-feature">
                <FaMicrophone />
                <span>Voice-controlled interface</span>
              </div>
              <div className="info-feature">
                <FaHeadphones />
                <span>Text-to-speech support</span>
              </div>
              <div className="info-feature">
                <FaShieldAlt />
                <span>Secure face recognition</span>
              </div>
            </div>

            <div className="training-section">
              <button className="training-btn" onClick={() => setShowTraining(true)}>
                <FaTraining />
                <span>Train Voice Recognition</span>
              </button>
              <p>Improve speech accuracy with personalized training</p>
            </div>

            <div className="info-steps">
              <div className="step-indicator">
                <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
                <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
                <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
              </div>
              <p>{step === 1 ? "Enter your details" : "Capture your face"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Speech Training Modal */}
      {showTraining && (
        <SpeechTraining 
          context="registration" 
          onTrainingComplete={() => setShowTraining(false)} 
        />
      )}
    </div>
  );
}

export default Register;