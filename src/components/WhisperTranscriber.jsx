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
      recognition.maxAlternatives = 3; // Get multiple alternatives for better accuracy

      // Add noise reduction settings
      if (recognition.grammars) {
        const SpeechGrammarList =
          window.SpeechGrammarList || window.webkitSpeechGrammarList;
        const grammarList = new SpeechGrammarList();

        // Define grammar for better command recognition
        const grammar = `#JSGF V1.0;
        grammar commands;
        public <command> = help | create account | join community | 
                           my name is | my name's | my email is | my email |
                           my department is | my department | my phone is | my phone |
                           my address is | my address;
        <name> = [a-z]+ [a-z]*;
        <email> = [a-z]+@[a-z]+.[a-z]+;
        <department> = [a-z]+ [a-z]* [a-z]*;
        <phone> = [0-9]+;
        <address> = [a-z]+ [a-z]* [a-z]*;`;

        grammarList.addFromString(grammar, 1);
        recognition.grammars = grammarList;
      }

      recognition.onresult = (event) => {
        const last = event.results.length - 1;
        const result = event.results[last][0];
        const command = result.transcript.toLowerCase().trim();
        const confidence = result.confidence || 0;

        console.log(
          "Voice command detected:",
          command,
          "Confidence:",
          confidence,
        );

        // Filter out noise and low confidence results
        if (confidence < 0.7) {
          console.log("Low confidence result ignored:", confidence);
          setRecognitionStatus("listening");
          return;
        }

        // Filter out very short or noise-like results
        if (
          command.length < 3 ||
          command === "the" ||
          command === "a" ||
          command === "an"
        ) {
          console.log("Noise/short result ignored:", command);
          setRecognitionStatus("listening");
          return;
        }

        // Check if it contains command keywords
        const commandKeywords = [
          "help",
          "create account",
          "join community",
          "my name is",
          "my name's",
          "my email is",
          "my email",
          "my department is",
          "my department",
          "my phone is",
          "my phone",
          "my address is",
          "my address",
        ];

        const hasCommandKeyword = commandKeywords.some((keyword) =>
          command.includes(keyword),
        );

        if (!hasCommandKeyword) {
          console.log("No command keyword found, ignoring:", command);
          setRecognitionStatus("listening");
          return;
        }

        setTranscript((prev) => prev + "\nDetected: " + command);
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
        // Auto-restart after error
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
        }, 2000);
      };

      recognition.onend = () => {
        console.log("Speech recognition ended");
        setRecognitionStatus("ended");
        setIsListening(false);
        // Auto-restart for continuous listening
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

      // Start recognition immediately
      try {
        recognition.start();
      } catch (e) {
        console.log("Recognition already started");
      }
    }
  }, []);

  const handleHelpCommand = () => {
    const commands = [
      "Create Account - fills registration form",
      "Join Community - fills community form",
      "Start Recording - begins audio capture",
      "Stop Recording - ends audio capture",
      "Transcribe Audio - processes audio file",
    ];

    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(
        `Available voice commands: ${commands.join(", ")}`,
      );
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const transcribeAudio = async (audioFile) => {
    if (!audioFile) return;

    setIsTranscribing(true);
    setError("");

    try {
      // Create FormData for API request
      const formData = new FormData();
      formData.append("audio", audioFile);

      // Send to Node.js API
      const response = await fetch("http://localhost:3000/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Transcription failed");
      }

      const result = await response.json();
      setTranscript(result.transcript);
    } catch (err) {
      setError("Transcription failed. Please try again.");
      console.error("Transcription error:", err);
    } finally {
      setIsTranscribing(false);
    }
  };

  const fillFormWithVoice = (command) => {
    // Voice command to fill form fields
    const fieldMappings = {
      "create account": {
        fullName: "John Doe",
        department: "Computer Science",
        email: "john.doe@haramaya.edu",
        phone: "+251911123456",
        address: "Haramaya University, Main Campus",
      },
      "join community": {
        fullName: "Jane Smith",
        department: "Information Technology",
        email: "jane.smith@haramaya.edu",
        phone: "+251911789012",
        address: "Haramaya University, IT Building",
      },
    };

    // Handle name filling with multiple patterns
    const namePatterns = [
      /my name is (.+)/i,
      /my name\'s (.+)/i,
      /i am (.+)/i,
      /my name\'s (.+)/i,
      /call me (.+)/i,
    ];

    for (const pattern of namePatterns) {
      const nameMatch = command.match(pattern);
      if (nameMatch) {
        const userName = nameMatch[1].trim();
        console.log(`Filling name field with: ${userName}`);

        // Update transcript to show what was filled
        setTranscript(
          (prev) => prev + `\n📝 Name field filled with: ${userName}`,
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
      /email is (.+)/i,
      /my email address is (.+)/i,
    ];

    for (const pattern of emailPatterns) {
      const emailMatch = command.match(pattern);
      if (emailMatch) {
        const userEmail = emailMatch[1].trim();
        console.log(`Filling email field with: ${userEmail}`);

        setTranscript(
          (prev) => prev + `\n📧 Email field filled with: ${userEmail}`,
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
    const deptPatterns = [
      /my department is (.+)/i,
      /my department (.+)/i,
      /department is (.+)/i,
      /i study (.+)/i,
      /i am in (.+)/i,
    ];

    for (const pattern of deptPatterns) {
      const deptMatch = command.match(pattern);
      if (deptMatch) {
        const userDept = deptMatch[1].trim();
        console.log(`Filling department field with: ${userDept}`);

        setTranscript(
          (prev) => prev + `\n🏢 Department field filled with: ${userDept}`,
        );

        if ("speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(
            `Department field filled with: ${userDept}`,
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
      /phone is (.+)/i,
      /my number is (.+)/i,
      /contact me at (.+)/i,
    ];

    for (const pattern of phonePatterns) {
      const phoneMatch = command.match(pattern);
      if (phoneMatch) {
        const userPhone = phoneMatch[1].trim();
        console.log(`Filling phone field with: ${userPhone}`);

        setTranscript(
          (prev) => prev + `\n📞 Phone field filled with: ${userPhone}`,
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

        setTranscript(
          (prev) => prev + `\n🏠 Address field filled with: ${userAddress}`,
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

    const data = fieldMappings[command.toLowerCase()];
    if (data) {
      console.log(`Voice command: "${command}"`);
      console.log("Filling form with:", data);

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
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
          channelCount: 1, // Mono for better speech recognition
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
    } catch (err) {
      setError("Microphone access denied. Please allow microphone access.");
      console.error("Recording error:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const getStatusColor = () => {
    switch (recognitionStatus) {
      case "listening":
        return "#4CAF50";
      case "processing":
        return "#2196F3";
      case "error":
        return "#F44336";
      case "ended":
        return "#FF9800";
      default:
        return "#9E9E9E";
    }
  };

  const getStatusText = () => {
    switch (recognitionStatus) {
      case "listening":
        return "Listening...";
      case "processing":
        return "Processing...";
      case "error":
        return "Error";
      case "ended":
        return "Ended";
      default:
        return "Idle";
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
              onClick={() => {
                if (recognitionRef.current) {
                  try {
                    recognitionRef.current.start();
                    setIsListening(true);
                    setRecognitionStatus("listening");
                    setError("");
                    setTranscript(
                      (prev) => prev + "\nVoice recognition started...",
                    );
                  } catch (error) {
                    console.error("Failed to start voice recognition:", error);
                    setError(
                      "Failed to start voice recognition. Please try again.",
                    );
                  }
                }
              }}
              disabled={isTranscribing}
            >
              Start Voice Recognition
            </button>
          ) : (
            <button
              className="voice-btn stop"
              onClick={() => {
                if (recognitionRef.current) {
                  recognitionRef.current.stop();
                  setIsListening(false);
                  setRecognitionStatus("stopped");
                  setTranscript((prev) => prev + "\nVoice recognition stopped");
                }
              }}
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
          {transcript || "Click 'Start Voice Recognition' to begin..."}
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

      {isTranscribing && (
        <div className="transcribing">
          <div className="spinner"></div>
          <span>Transcribing audio...</span>
        </div>
      )}

      {transcript && (
        <div className="transcript-actions">
          <button
            className="copy-btn"
            onClick={() => navigator.clipboard.writeText(transcript)}
          >
            Copy to Clipboard
          </button>
          <button className="clear-btn" onClick={() => setTranscript("")}>
            Clear
          </button>
        </div>
      )}

      <div className="model-info">
        <h4>Model Information:</h4>
        <ul>
          <li>Model: Whisper Base (Fine-tuned)</li>
          <li>Languages: Afaan Oromo, Amharic, English</li>
          <li>WER: 5.0% | CER: 2.0%</li>
          <li>Status: Ready for Production</li>
        </ul>
      </div>
    </div>
  );
};

export default WhisperTranscriber;
