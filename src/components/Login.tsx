import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaEnvelope,
  FaLock,
  FaCamera,
  FaMicrophone,
  FaVolumeUp,
  FaArrowLeft,
  FaUser,
  FaSmile,
  FaKey,
  FaSpinner,
  FaCheckCircle,
  FaFingerprint
} from "react-icons/fa";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [voiceGuide, setVoiceGuide] = useState(true);
  const [loginMethod, setLoginMethod] = useState<'email' | 'face'>('face'); // Changed default to 'face'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [faceCaptured, setFaceCaptured] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start camera automatically when component mounts (face is default)
  useEffect(() => {
    startCamera();
    speak("Welcome to face recognition login. Look at the camera. Say capture to login, or switch to email.");
  }, []);

  // Voice recognition setup
  useEffect(() => {
    if (!voiceGuide) return;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = () => setIsListening(false);

      recognitionRef.current.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript.toLowerCase();
        handleVoiceCommand(transcript);
      };
    }
  }, [voiceGuide]);

  useEffect(() => {
    if (loginMethod === 'face') {
      speak("Face recognition mode. Look at the camera. Say capture to login.");
    } else {
      speak("Email login mode. Enter your email and password.");
    }
  }, [loginMethod]);

  const speak = (text: string) => {
    if (!voiceGuide) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  const handleVoiceCommand = (command: string) => {
    if (command.includes("email") || command.includes("password")) {
      switchToEmailLogin();
    } else if (command.includes("capture") && loginMethod === 'face') {
      captureFace();
    } else if (command.includes("help")) {
      speak("Say capture to login with face, or say email to switch to email login.");
    }
  };

  const switchToEmailLogin = () => {
    if (cameraActive) stopCamera();
    setLoginMethod('email');
    setFaceDetected(false);
    setFaceCaptured(false);
    speak("Email login mode. Enter your email and password.");
  };

  const switchToFaceLogin = () => {
    if (loginMethod === 'email') {
      setLoginMethod('face');
      setError("");
      startCamera();
      speak("Face recognition mode activated. Look at the camera and say capture.");
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        speak("Camera activated. Position your face in the center.");
        
        // Simulate face detection after 2 seconds
        setTimeout(() => {
          setFaceDetected(true);
          speak("Face detected. Say capture to login.");
        }, 2000);
      }
    } catch (err) {
      speak("Camera access failed. Switching to email login.");
      setError("Camera access failed. Switching to email login.");
      setTimeout(() => switchToEmailLogin(), 2000);
    }
  };

  const captureFace = () => {
    if (!faceDetected) {
      speak("Please position your face in the camera first.");
      return;
    }
    
    setFaceCaptured(true);
    setIsLoading(true);
    speak("Verifying face...");
    
    setTimeout(() => {
      setIsLoading(false);
      setSuccess("Face recognized! Welcome back!");
      speak("Login successful! Redirecting to dashboard.");
      localStorage.setItem('user', JSON.stringify({ name: "Student", email: "student@example.com" }));
      setTimeout(() => navigate("/home"), 2000);
    }, 2000);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setFaceDetected(false);
    setFaceCaptured(false);
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Please enter both email and password");
      speak("Please enter both email and password");
      return;
    }
    
    setIsLoading(true);
    speak("Verifying credentials...");
    
    setTimeout(() => {
      setIsLoading(false);
      setSuccess("Login successful! Welcome back!");
      speak("Login successful! Redirecting to dashboard.");
      localStorage.setItem('user', JSON.stringify({ name: "Student", email: email }));
      setTimeout(() => navigate("/home"), 2000);
    }, 1500);
  };

  const toggleVoiceGuide = () => {
    setVoiceGuide(!voiceGuide);
    if (!voiceGuide) speak("Voice guidance enabled");
    else window.speechSynthesis.cancel();
  };

  return (
    <div className="login-split">
      {/* Voice Toggle */}
      <button className="voice-toggle-login" onClick={toggleVoiceGuide}>
        <FaVolumeUp className={voiceGuide ? "active" : ""} />
        <span>Voice {voiceGuide ? "ON" : "OFF"}</span>
      </button>

      {/* Back Button */}
      <button className="back-login" onClick={() => navigate("/")}>
        <FaArrowLeft /> Back
      </button>

      <div className="login-split-container">
        {/* Left Side - Login Form */}
        <div className="login-split-left">
          <div className="login-card">
            <div className="login-header">
              <h1>Welcome Back</h1>
              <p>Sign in to your account</p>
            </div>

            {/* Method Switcher - Face is default active */}
            <div className="method-switcher">
              <button 
                className={`method-btn ${loginMethod === 'face' ? 'active' : ''}`}
                onClick={switchToFaceLogin}
              >
                <FaCamera /> Face Login
              </button>
              <button 
                className={`method-btn ${loginMethod === 'email' ? 'active' : ''}`}
                onClick={switchToEmailLogin}
              >
                <FaEnvelope /> Email Login
              </button>
            </div>

            {/* Face Login Section - Shown First */}
            {loginMethod === 'face' && (
              <div className="face-login-section">
                <div className={`camera-box-login ${cameraActive ? 'active' : ''}`}>
                  <video ref={videoRef} autoPlay playsInline className="camera-feed-login" />
                  {!cameraActive && (
                    <div className="camera-placeholder-login">
                      <FaCamera />
                      <p>Initializing camera...</p>
                    </div>
                  )}
                  {faceDetected && !faceCaptured && (
                    <div className="face-detected-overlay">
                      <FaSmile />
                      <p>Face Detected! Say "capture"</p>
                    </div>
                  )}
                  {faceCaptured && (
                    <div className="face-captured-overlay">
                      <FaCheckCircle />
                      <p>Face Captured!</p>
                    </div>
                  )}
                </div>

                <button 
                  className="capture-login-btn" 
                  onClick={captureFace}
                  disabled={!cameraActive || !faceDetected || isLoading || faceCaptured}
                >
                  {isLoading ? <FaSpinner className="spinner" /> : <FaCamera />}
                  {isLoading ? " Verifying..." : faceCaptured ? " Verified!" : " Capture & Login"}
                </button>

                <p className="face-hint">
                  <FaMicrophone /> Say "capture" to take photo and login
                </p>
              </div>
            )}

            {/* Email Login Form - Secondary */}
            {loginMethod === 'email' && (
              <form onSubmit={handleEmailLogin}>
                <div className="form-group">
                  <label><FaEnvelope /> Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => speak("Enter your email address")}
                  />
                </div>

                <div className="form-group">
                  <label><FaLock /> Password</label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => speak("Enter your password")}
                  />
                </div>

                <div className="form-options">
                  <label className="checkbox-label">
                    <input type="checkbox" /> Remember me
                  </label>
                  <a href="#" className="forgot-link">Forgot password?</a>
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <button type="submit" className="login-btn" disabled={isLoading}>
                  {isLoading ? <FaSpinner className="spinner" /> : <FaKey />}
                  {isLoading ? " Logging in..." : " Sign In"}
                </button>
              </form>
            )}

            <p className="signup-link">
              Don't have an account? <a href="/register">Sign up</a>
            </p>

            {isListening && (
              <div className="listening-login">
                <FaMicrophone /> Listening... Say "capture" or "email"
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Info/Illustration */}
        <div className="login-split-right">
          <div className="info-content-login">
            <div className="info-icon-large">
              <FaUser />
            </div>
            <h2>Secure Login</h2>
            <p>Choose your preferred login method</p>
            
            <div className="login-methods-info">
              <div className="method-info">
                <FaCamera />
                <div>
                  <strong>Face Recognition</strong>
                  <span>Fast and secure with camera</span>
                </div>
              </div>
              <div className="method-info">
                <FaEnvelope />
                <div>
                  <strong>Email Login</strong>
                  <span>Traditional email and password</span>
                </div>
              </div>
            </div>

            <div className="voice-tip">
              <FaMicrophone />
              <p>Voice commands: "capture" to login with face, "email" to switch</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;