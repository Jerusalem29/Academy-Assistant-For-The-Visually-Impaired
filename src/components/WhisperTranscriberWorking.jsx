import React, { useState, useRef, useEffect } from "react";
import "./WhisperTranscriber.css";

const WhisperTranscriber = () => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognitionStatus, setRecognitionStatus] = useState("idle");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);

  // Voice recognition setup
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "en-US";
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const last = event.results.length - 1;
        const command = event.results[last][0].transcript.toLowerCase();

        console.log("Voice command detected:", command);
        setTranscript(prev => prev + "\nDetected: " + command);
        setRecognitionStatus("processing");

        // Process commands with better spelling correction
        if (command.includes("help")) {
          handleHelpCommand();
        } else if (command.includes("create account")) {
          fillFormWithVoice("create account");
        } else if (command.includes("join community")) {
          fillFormWithVoice("join community");
        } else if (
          command.includes("my name is") ||
          command.includes("my name's")
        ) {
          fillFormWithVoice(command);
        } else if (
          command.includes("my email is") ||
          command.includes("my email")
        ) {
          fillFormWithVoice(command);
        } else if (
          command.includes("my department is") ||
          command.includes("my department")
        ) {
          fillFormWithVoice(command);
        } else if (
          command.includes("my phone is") ||
          command.includes("my phone")
        ) {
          fillFormWithVoice(command);
        } else if (
          command.includes("my address is") ||
          command.includes("my address")
        ) {
          fillFormWithVoice(command);
        } else {
          // Handle unknown commands
          setTranscript(prev => prev + "\nUnknown command: " + command);
          if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(
              "Command not recognized. Please try again."
            );
            utterance.rate = 1;
            utterance.pitch = 1;
            window.speechSynthesis.speak(utterance);
          }
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setRecognitionStatus("error");
        if (event.error === "not-allowed") {
          setError("Microphone access denied. Please allow microphone access.");
        } else {
          setError(`Speech recognition error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        console.log("Speech recognition ended");
        setRecognitionStatus("ended");
        setIsListening(false);
        // Auto-restart if we want continuous listening
        setTimeout(() => {
          if (!recognition.aborted) {
            try {
              recognition.start();
              setIsListening(true);
              setRecognitionStatus("listening");
            } catch (error) {
              console.error("Failed to restart recognition:", error);
              setRecognitionStatus("idle");
            }
          }
        }, 1000);
      };

      recognitionRef.current = recognition;
    } else {
      setError("Speech recognition not supported in this browser");
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  const startVoiceRecognition = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setRecognitionStatus("listening");
        setError("");
        setTranscript(prev => prev + "\nVoice recognition started...");
        console.log("Voice recognition started");
      } catch (error) {
        console.error("Failed to start voice recognition:", error);
        setError("Failed to start voice recognition. Please try again.");
        setRecognitionStatus("error");
      }
    } else if (isListening) {
      console.log("Voice recognition already running");
      setTranscript(prev => prev + "\nVoice recognition already running");
    } else {
      setError("Speech recognition not supported in this browser");
    }
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setRecognitionStatus("stopped");
      setTranscript(prev => prev + "\nVoice recognition stopped");
      console.log("Voice recognition stopped");
    }
  };

  const handleHelpCommand = () => {
    const helpText = `
Voice Commands Available:
- "My name is [your name]" - Fills name field
- "My email is [your email]" - Fills email field  
- "My department is [your department]" - Fills department field
- "My phone is [your phone]" - Fills phone field
- "My address is [your address]" - Fills address field
- "Create account" - Fills form with sample data
- "Join community" - Fills form with community data
- "Help" - Shows this help message

Languages Supported: English, Afaan Oromo, Amharic
    `;
    setTranscript(prev => prev + "\n" + helpText);
    
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(
        "Voice commands are available for filling forms. Say 'help' to see all commands."
      );
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const fillFormWithVoice = (command) => {
    console.log("Processing voice command:", command);
    setTranscript(prev => prev + "\nProcessing: " + command);

    // Handle name filling with multiple patterns
    const namePatterns = [
      /my name is (.+)/i,
      /my name's (.+)/i,
      /i am (.+)/i,
      /i'm (.+)/i,
      /call me (.+)/i,
    ];

    for (const pattern of namePatterns) {
      const nameMatch = command.match(pattern);
      if (nameMatch) {
        const userName = nameMatch[1].trim();
        console.log(`Filling name field with: ${userName}`);

        // Find and fill the name field
        const nameField = document.querySelector('input[name="fullName"]') ||
                         document.querySelector('input[placeholder*="name"]') ||
                         document.querySelector('input[id*="name"]');

        if (nameField) {
          nameField.value = userName;
          nameField.dispatchEvent(new Event('input', { bubbles: true }));
          nameField.dispatchEvent(new Event('change', { bubbles: true }));
        }

        setTranscript(
          (prev) => prev + `\nName field filled with: ${userName}`,
        );

        if ("speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(
            `Name field filled with: ${userName}`,
          );
          utterance.rate = 1;
          utterance.pitch = 1;
          window.speechSynthesis.speak(utterance);
        }
        return;
      }
    }

    // Handle email filling with multiple patterns
    const emailPatterns = [
      /my email is (.+)/i,
      /my email (.+)/i,
      /email me at (.+)/i,
      /my email address is (.+)/i,
    ];

    for (const pattern of emailPatterns) {
      const emailMatch = command.match(pattern);
      if (emailMatch) {
        const userEmail = emailMatch[1].trim();
        console.log(`Filling email field with: ${userEmail}`);

        const emailField = document.querySelector('input[name="email"]') ||
                          document.querySelector('input[placeholder*="email"]') ||
                          document.querySelector('input[id*="email"]');

        if (emailField) {
          emailField.value = userEmail;
          emailField.dispatchEvent(new Event('input', { bubbles: true }));
          emailField.dispatchEvent(new Event('change', { bubbles: true }));
        }

        setTranscript(
          (prev) => prev + `\nEmail field filled with: ${userEmail}`,
        );

        if ("speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(
            `Email field filled with: ${userEmail}`,
          );
          utterance.rate = 1;
          utterance.pitch = 1;
          window.speechSynthesis.speak(utterance);
        }
        return;
      }
    }

    // Handle department filling with multiple patterns
    const departmentPatterns = [
      /my department is (.+)/i,
      /my department (.+)/i,
      /i work in (.+)/i,
      /department (.+)/i,
    ];

    for (const pattern of departmentPatterns) {
      const departmentMatch = command.match(pattern);
      if (departmentMatch) {
        const userDepartment = departmentMatch[1].trim();
        console.log(`Filling department field with: ${userDepartment}`);

        const departmentField = document.querySelector('input[name="department"]') ||
                              document.querySelector('select[name="department"]') ||
                              document.querySelector('input[placeholder*="department"]') ||
                              document.querySelector('select[id*="department"]');

        if (departmentField) {
          departmentField.value = userDepartment;
          departmentField.dispatchEvent(new Event('input', { bubbles: true }));
          departmentField.dispatchEvent(new Event('change', { bubbles: true }));
        }

        setTranscript(
          (prev) => prev + `\nDepartment field filled with: ${userDepartment}`,
        );

        if ("speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(
            `Department field filled with: ${userDepartment}`,
          );
          utterance.rate = 1;
          utterance.pitch = 1;
          window.speechSynthesis.speak(utterance);
        }
        return;
      }
    }

    // Handle phone filling with multiple patterns
    const phonePatterns = [
      /my phone is (.+)/i,
      /my phone (.+)/i,
      /phone number is (.+)/i,
      /call me at (.+)/i,
      /my number is (.+)/i,
    ];

    for (const pattern of phonePatterns) {
      const phoneMatch = command.match(pattern);
      if (phoneMatch) {
        const userPhone = phoneMatch[1].trim();
        console.log(`Filling phone field with: ${userPhone}`);

        const phoneField = document.querySelector('input[name="phone"]') ||
                         document.querySelector('input[placeholder*="phone"]') ||
                         document.querySelector('input[id*="phone"]');

        if (phoneField) {
          phoneField.value = userPhone;
          phoneField.dispatchEvent(new Event('input', { bubbles: true }));
          phoneField.dispatchEvent(new Event('change', { bubbles: true }));
        }

        setTranscript(
          (prev) => prev + `\nPhone field filled with: ${userPhone}`,
        );

        if ("speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(
            `Phone field filled with: ${userPhone}`,
          );
          utterance.rate = 1;
          utterance.pitch = 1;
          window.speechSynthesis.speak(utterance);
        }
        return;
      }
    }

    // Handle address filling with multiple patterns
    const addressPatterns = [
      /my address is (.+)/i,
      /my address (.+)/i,
      /address is (.+)/i,
      /i live at (.+)/i,
      /i stay at (.+)/i,
    ];

    for (const pattern of addressPatterns) {
      const addressMatch = command.match(pattern);
      if (addressMatch) {
        const userAddress = addressMatch[1].trim();
        console.log(`Filling address field with: ${userAddress}`);

        const addressField = document.querySelector('input[name="address"]') ||
                           document.querySelector('textarea[name="address"]') ||
                           document.querySelector('input[placeholder*="address"]') ||
                           document.querySelector('textarea[id*="address"]');

        if (addressField) {
          addressField.value = userAddress;
          addressField.dispatchEvent(new Event('input', { bubbles: true }));
          addressField.dispatchEvent(new Event('change', { bubbles: true }));
        }

        setTranscript(
          (prev) => prev + `\nAddress field filled with: ${userAddress}`,
        );

        if ("speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(
            `Address field filled with: ${userAddress}`,
          );
          utterance.rate = 1;
          utterance.pitch = 1;
          window.speechSynthesis.speak(utterance);
        }
        return;
      }
    }

    // Handle predefined commands
    const fieldMappings = {
      "create account": {
        fullName: "John Doe",
        email: "john.doe@example.com",
        department: "Computer Science",
        phone: "1234567890",
        address: "123 Main St, City, Country",
      },
      "join community": {
        fullName: "Jane Smith",
        email: "jane.smith@example.com",
        department: "Information Technology",
        phone: "0987654321",
        address: "456 Oak Ave, Town, Country",
      },
    };

    const data = fieldMappings[command.toLowerCase()];
    if (data) {
      console.log(`Voice command: "${command}"`);
      console.log("Filling form with:", data);

      // Fill all form fields
      Object.entries(data).forEach(([field, value]) => {
        const element = document.querySelector(`input[name="${field}"]`) ||
                       document.querySelector(`select[name="${field}"]`) ||
                       document.querySelector(`textarea[name="${field}"]`);
        
        if (element) {
          element.value = value;
          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });

      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(
          `Filling form with ${command} command. Name: ${data.fullName}, Department: ${data.department}`,
        );
        utterance.rate = 1;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
      }
    } else {
      console.log(`Unknown command: "${command}"`);
      setTranscript((prev) => prev + `\nUnknown command: "${command}"`);
    }
  };

  const transcribeAudio = async (audioFile) => {
    if (!audioFile) return;

    setIsTranscribing(true);
    setError("");
    setTranscript(prev => prev + "\nTranscribing audio...");

    try {
      const formData = new FormData();
      formData.append("audio", audioFile);

      // Send to Node.js API
      const response = await fetch("http://localhost:5000/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Transcription failed");
      }

      const result = await response.json();
      
      if (result.error) {
        setError(result.error);
        setTranscript(prev => prev + "\nError: " + result.error);
      } else {
        const transcription = result.transcript || "No transcription available";
        setTranscript(prev => prev + "\nTranscription: " + transcription);
        setTranscript(prev => prev + "\nLanguage: " + result.language);
        setTranscript(prev => prev + "\nConfidence: " + result.confidence);
        
        // Process the transcription for form filling
        fillFormWithVoice(transcription);
      }
    } catch (err) {
      setError("Failed to connect to transcription service. Using browser speech recognition instead.");
      console.error("Transcription error:", err);
      setTranscript(prev => prev + "\nError: " + err.message);
      
      // Fallback to browser speech recognition
      if (!isListening) {
        startVoiceRecognition();
      }
    } finally {
      setIsTranscribing(false);
      setRecognitionStatus("idle");
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm;codecs=opus",
        });

        const audioFile = new File([audioBlob], "recording.webm", {
          type: "audio/webm;codecs=opus",
        });

        transcribeAudio(audioFile);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError("");
      setTranscript(prev => prev + "\nRecording started...");
      
      // Also start voice recognition for real-time processing
      if (!isListening) {
        startVoiceRecognition();
      }
    } catch (err) {
      setError("Microphone access denied. Please allow microphone access.");
      console.error("Recording error:", err);
      setRecognitionStatus("error");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setTranscript(prev => prev + "\nRecording stopped");
    }
  };

  const getStatusColor = () => {
    switch (recognitionStatus) {
      case "listening": return "#4CAF50";
      case "processing": return "#2196F3";
      case "error": return "#F44336";
      case "ended": return "#FF9800";
      default: return "#9E9E9E";
    }
  };

  const getStatusText = () => {
    switch (recognitionStatus) {
      case "listening": return "Listening...";
      case "processing": return "Processing...";
      case "error": return "Error";
      case "ended": return "Ended";
      default: return "Idle";
    }
  };

  return (
    <div className="whisper-transcriber">
      <div className="transcriber-header">
        <h2>Multilingual Speech Recognition</h2>
        <p>Supports: Afaan Oromo, Amharic, English</p>
        <div className="status-indicator" style={{ color: getStatusColor() }}>
          Status: {getStatusText()}
        </div>
      </div>

      <div className="audio-controls">
        <div className="recording-controls">
          {!isRecording ? (
            <button
              className="record-btn"
              onClick={startRecording}
              disabled={isTranscribing}
            >
              {isListening ? "Listening..." : "Start Recording"}
            </button>
          ) : (
            <button
              className="stop-btn"
              onClick={stopRecording}
              disabled={isTranscribing}
            >
              Stop Recording
            </button>
          )}
        </div>

        <div className="voice-controls">
          {!isListening ? (
            <button
              className="voice-btn"
              onClick={startVoiceRecognition}
              disabled={isTranscribing}
            >
              Start Voice Recognition
            </button>
          ) : (
            <button
              className="voice-btn stop"
              onClick={stopVoiceRecognition}
            >
              Stop Voice Recognition
            </button>
          )}
        </div>

        <div className="file-upload">
          <label className="upload-label">
            Or upload audio file:
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => transcribeAudio(e.target.files[0])}
              disabled={isTranscribing}
              className="file-input"
            />
          </label>
        </div>
      </div>

      {isTranscribing && (
        <div className="transcribing">
          <div className="spinner"></div>
          <span>Transcribing audio...</span>
        </div>
      )}

      {isListening && (
        <div className="listening-indicator">
          <div className="pulse"></div>
          <span>Listening for voice commands...</span>
        </div>
      )}

      {error && (
        <div className="error-message">
          <span> Error: {error}</span>
        </div>
      )}

      <div className="transcript-container">
        <h3>Voice Commands & Transcription</h3>
        <div className="transcript">
          {transcript || "Start speaking or upload an audio file..."}
        </div>
      </div>

      <div className="help-section">
        <h3>Available Commands:</h3>
        <ul>
          <li>"My name is [your name]" - Fill name field</li>
          <li>"My email is [your email]" - Fill email field</li>
          <li>"My department is [your department]" - Fill department field</li>
          <li>"My phone is [your phone]" - Fill phone field</li>
          <li>"My address is [your address]" - Fill address field</li>
          <li>"Create account" - Fill with sample data</li>
          <li>"Join community" - Fill with community data</li>
          <li>"Help" - Show available commands</li>
        </ul>
      </div>
    </div>
  );
};

export default WhisperTranscriber;
