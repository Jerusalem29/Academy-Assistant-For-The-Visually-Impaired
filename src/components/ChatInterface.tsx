import React, { useState, useEffect, useRef } from "react";
import { 
  FaMicrophone,
  FaVolumeUp,
  FaRobot,
  FaUser,
  FaPlus,
  FaHistory,
  FaPaperPlane,
  FaBars,
  FaTimes,
  FaChevronRight,
  FaChevronLeft
} from "react-icons/fa";
import "./AIChat.css";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatHistory {
  id: number;
  title: string;
  date: string;
  preview: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isTyping?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  isTyping = false
}) => {
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const [chatHistory] = useState<ChatHistory[]>([
    { id: 1, title: "Math help", date: "Today", preview: "Quadratic equations..." },
    { id: 2, title: "Physics", date: "Yesterday", preview: "Newton laws..." }
  ]);

  // 🎤 Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = () => setIsListening(false);

      recognitionRef.current.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setInputText(text);
        setTimeout(() => handleSendMessage(text), 100);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔊 Text-to-Speech
  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(text);
    speech.rate = 0.9;
    window.speechSynthesis.speak(speech);
  };

  const handleSendMessage = (text: string = inputText) => {
    if (!text.trim()) return;
    onSendMessage(text);
    setInputText("");
    
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.log("Speech recognition error:", e);
      }
    }
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const newChat = () => {
    speak("Starting new chat");
  };

  const loadHistoryChat = (chat: ChatHistory) => {
    speak(`Loading ${chat.title}`);
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="chat-interface">
      {/* Sidebar Toggle Button */}
      {!sidebarOpen && (
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <FaChevronRight /> History
        </button>
      )}

      {/* Chat History Sidebar */}
      <div className={`chat-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <div className="sidebar-title">
            <FaHistory />
            <h3>Chat History</h3>
          </div>
          <button className="sidebar-close" onClick={toggleSidebar}>
            <FaChevronLeft />
          </button>
        </div>

        <div className="history-list">
          <button className="new-chat-btn" onClick={newChat}>
            <FaPlus /> New Chat
          </button>

          {chatHistory.map(chat => (
            <div 
              key={chat.id} 
              className="history-item"
              onClick={() => loadHistoryChat(chat)}
            >
              <div className="history-title">{chat.title}</div>
              <div className="history-preview">{chat.preview}</div>
              <div className="history-date">{chat.date}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`chat-main ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        
        {/* Messages Container */}
        <div className="messages-container">
          {messages.map(msg => (
            <div key={msg.id} className={`message ${msg.sender}`}>
              <div className="message-avatar">
                {msg.sender === "assistant" ? <FaRobot /> : <FaUser />}
              </div>
              <div className="message-bubble">
                <div className="message-header">
                  <span className="message-sender">
                    {msg.sender === "assistant" ? "AI Assistant" : "You"}
                  </span>
                  <span className="message-time">{formatTime(msg.timestamp)}</span>
                </div>
                <div className="message-text">{msg.text}</div>
                <button
                  className="message-speak"
                  onClick={() => speak(msg.text)}
                  title="Read aloud"
                >
                  <FaVolumeUp />
                </button>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="input-area">
          <div className="input-wrapper">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything... (Press Enter to send)"
              rows={1}
            />
            <div className="input-actions">
              <button
                className={`voice-btn ${isListening ? "listening" : ""}`}
                onClick={startListening}
                title={isListening ? "Listening..." : "Voice input"}
              >
                <FaMicrophone />
              </button>
              <button
                className="send-btn"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim()}
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
          <div className="input-hint">
            {isListening ? "🎤 Listening... Speak now" : "Click 🎤 to speak or type"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;