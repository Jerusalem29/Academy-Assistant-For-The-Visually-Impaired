import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaRobot, 
  FaMicrophone, 
  FaHeadphones, 
  FaShieldAlt, 
  FaArrowRight,
  FaUsers,
  FaBookOpen,
  FaComments,
  FaBell,
  FaChartLine,
  FaGraduationCap,
  FaStar,
  FaPlayCircle,
  FaCheckCircle,
  FaBrain,
  FaClock,
  FaLanguage,
  FaRegSmile,
  FaQuoteLeft,
  FaArrowLeft,
  FaArrowRight as FaArrowRightIcon,
  FaTwitter,
  FaLinkedin,
  FaGithub,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone
} from "react-icons/fa";
import "./LandingPage.css";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isVoiceDemoPlaying, setIsVoiceDemoPlaying] = useState(false);
  const [demoText, setDemoText] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const message = new SpeechSynthesisUtterance(
      "Welcome to the Accessible Academic Assistant. Your voice-controlled learning companion for visually impaired students at Haramaya University."
    );
    message.rate = 0.9;
    window.speechSynthesis.speak(message);
    
    // Scroll listener for navbar
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const testimonials = [
    {
      text: "This platform has completely transformed how I study. The voice commands make it so easy to navigate, and the AI assistant helps me understand complex topics instantly. It's truly life-changing for visually impaired students.",
      author: "Dr. Elias Kemal",
      title: "Head of Department, Computer Science",
      rating: 5,
      avatar: "EK"
    },
    {
      text: "As a visually impaired student, I've never had such an accessible learning experience. The voice guidance is perfect, and the ability to ask questions naturally makes learning so much easier.",
      author: "Meron Tesfaye",
      title: "Computer Science Student",
      rating: 5,
      avatar: "MT"
    },
    {
      text: "The AI assistant understands my needs perfectly. It reads out course materials, reminds me of deadlines, and helps me understand difficult concepts. A game-changer for inclusive education.",
      author: "Abebe Bekele",
      title: "Engineering Student",
      rating: 5,
      avatar: "AB"
    }
  ];

  const playVoiceDemo = () => {
    setIsVoiceDemoPlaying(true);
    const demoMessages = [
      "Hello! I'm your AI assistant. You can ask me anything.",
      "For example, say 'What is photosynthesis?'",
      "Or 'When is my math assignment due?'",
      "I'll read everything aloud for you."
    ];
    
    let index = 0;
    setDemoText(demoMessages[index]);
    
    const speakNext = () => {
      if (index < demoMessages.length) {
        const utterance = new SpeechSynthesisUtterance(demoMessages[index]);
        utterance.rate = 0.9;
        utterance.onend = () => {
          index++;
          if (index < demoMessages.length) {
            setDemoText(demoMessages[index]);
            speakNext();
          } else {
            setIsVoiceDemoPlaying(false);
          }
        };
        window.speechSynthesis.speak(utterance);
      }
    };
    
    speakNext();
  };

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="landing-page">
      {/* Navigation Bar */}
      <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <div className="nav-logo">
            <FaGraduationCap className="logo-icon" />
            <span>Academic Assistant</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#accessibility">Accessibility</a>
          </div>
          <div className="nav-buttons">
            <button className="btn-login" onClick={() => navigate("/login")}>Log in</button>
            <button className="btn-signup" onClick={() => navigate("/register")}>Sign up</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <FaStar className="badge-icon" />
              <span>Haramaya University</span>
            </div>
            <h1 className="hero-title">
              Your Voice-Controlled
              <span className="gradient-text"> Academic Companion</span>
            </h1>
            <p className="hero-description">
              AI-powered learning assistant designed for visually impaired students. 
              Speak naturally, get instant answers, and access your courses with ease.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary-large" onClick={() => navigate("/register")}>
                Get Started <FaArrowRight />
              </button>
              <button className="btn-secondary-large" onClick={playVoiceDemo}>
                <FaPlayCircle /> Try Voice Demo
              </button>
            </div>
            
            {/* Voice Demo Indicator */}
            {isVoiceDemoPlaying && (
              <div className="voice-demo-indicator">
                <div className="demo-voice-wave">
                  <span></span><span></span><span></span><span></span>
                </div>
                <p className="demo-text">"{demoText}"</p>
              </div>
            )}
            
            <div className="hero-stats">
              {[
                { number: "24/7", label: "AI Support", icon: FaRobot },
                { number: "100%", label: "Voice Controlled", icon: FaMicrophone },
                { number: "3+", label: "Languages", icon: FaLanguage },
                { number: "500+", label: "Active Students", icon: FaUsers }
              ].map((stat, index) => (
                <div key={index} className="hero-stat">
                  <stat.icon className="stat-icon" />
                  <span className="stat-number">{stat.number}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-visual">
            <div className="voice-animation">
              <div className="voice-circle"></div>
              <div className="voice-circle-2"></div>
              <div className="voice-waves">
                <span></span><span></span><span></span><span></span><span></span>
              </div>
              <div className="floating-card voice-card">
                <FaMicrophone /> "What is photosynthesis?"
              </div>
              <div className="floating-card response-card">
                <FaRobot /> "Photosynthesis is the process..."
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Features</span>
            <h2>Everything You Need to Succeed</h2>
            <p>Designed specifically for visually impaired students with accessibility at its core</p>
          </div>
          <div className="features-grid">
            {[
              { icon: FaComments, title: "AI Chat Assistant", desc: "Get instant answers to your academic questions", color: "#667eea" },
              { icon: FaMicrophone, title: "Voice Commands", desc: "Control everything with your voice", color: "#10b981" },
              { icon: FaBell, title: "Smart Reminders", desc: "Never miss important deadlines", color: "#f59e0b" },
              { icon: FaBookOpen, title: "Learning Modules", desc: "Access course materials easily", color: "#ef4444" },
              { icon: FaChartLine, title: "Track Progress", desc: "Monitor your learning journey", color: "#8b5cf6" },
              { icon: FaHeadphones, title: "Text-to-Speech", desc: "Listen to content read aloud", color: "#06b6d4" }
            ].map((feature, index) => (
              <div key={index} className="feature-card animate-on-scroll">
                <div className="feature-icon" style={{ backgroundColor: `${feature.color}15`, color: feature.color }}>
                  <feature.icon />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Simple Process</span>
            <h2>How It Works</h2>
            <p>Three simple steps to get started with your learning journey</p>
          </div>
          <div className="steps-grid">
            {[
              { number: "01", title: "Ask a Question", desc: "Speak or type your academic question", icon: FaMicrophone },
              { number: "02", title: "AI Processes", desc: "Our AI understands and analyzes your query", icon: FaBrain },
              { number: "03", title: "Get Response", desc: "Receive voice or text guidance instantly", icon: FaHeadphones }
            ].map((step, index) => (
              <div key={index} className="step-card animate-on-scroll">
                <div className="step-number">{step.number}</div>
                <div className="step-icon">
                  <step.icon />
                </div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="testimonial-section">
        <div className="container">
          <div className="testimonial-carousel">
            <button className="carousel-btn prev" onClick={prevTestimonial}>
              <FaArrowLeft />
            </button>
            <div className="testimonial-card">
              <FaQuoteLeft className="quote-icon" />
              <p className="testimonial-text">{testimonials[activeTestimonial].text}</p>
              <div className="testimonial-author">
                <div className="author-avatar">{testimonials[activeTestimonial].avatar}</div>
                <div>
                  <strong>{testimonials[activeTestimonial].author}</strong>
                  <span>{testimonials[activeTestimonial].title}</span>
                </div>
              </div>
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="star filled" />
                ))}
              </div>
            </div>
            <button className="carousel-btn next" onClick={nextTestimonial}>
              <FaArrowRightIcon />
            </button>
          </div>
          <div className="testimonial-dots">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`dot ${activeTestimonial === index ? 'active' : ''}`}
                onClick={() => setActiveTestimonial(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Accessibility Section */}
      <section id="accessibility" className="accessibility-section">
        <div className="container">
          <div className="accessibility-grid">
            <div className="accessibility-content">
              <span className="column-badge">Built for Accessibility</span>
              <h2>Designed for visually impaired users</h2>
              <p>Every feature is built with accessibility in mind, ensuring a seamless experience for all students.</p>
              <ul className="feature-list">
                <li><FaCheckCircle /> Full voice control navigation</li>
                <li><FaCheckCircle /> Text-to-speech for all content</li>
                <li><FaCheckCircle /> High contrast mode</li>
                <li><FaCheckCircle /> Screen reader compatible</li>
                <li><FaCheckCircle /> Keyboard shortcuts</li>
              </ul>
            </div>
            <div className="accessibility-visual">
              <div className="accessibility-card">
                <FaHeadphones className="access-icon" />
                <div className="voice-bars">
                  <span></span><span></span><span></span><span></span>
                </div>
                <p>Voice guidance active</p>
                <div className="access-badges">
                  <span>Screen Reader</span>
                  <span>High Contrast</span>
                  <span>Keyboard Nav</span>
                  <span>Voice Control</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to transform your learning experience?</h2>
            <p>Join hundreds of students already using our accessible platform</p>
            <div className="cta-buttons">
              <button className="btn-primary-large" onClick={() => navigate("/login")}>
                Login to Your Account
              </button>
              <button className="btn-outline-large" onClick={() => navigate("/register")}>
                Create Free Account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">
                <FaGraduationCap />
                <span>Academic Assistant</span>
              </div>
              <p>AI-Powered Learning Support for Visually Impaired Students</p>
              <p className="footer-university">Haramaya University</p>
              <div className="social-links">
                <a href="#"><FaTwitter /></a>
                <a href="#"><FaLinkedin /></a>
                <a href="#"><FaGithub /></a>
              </div>
            </div>
            <div className="footer-links">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#accessibility">Accessibility</a>
            </div>
            <div className="footer-links">
              <h4>Resources</h4>
              <a href="#">Documentation</a>
              <a href="#">Help Center</a>
              <a href="#">Voice Commands</a>
            </div>
            <div className="footer-links">
              <h4>Company</h4>
              <a href="#">About Us</a>
              <a href="#">Contact</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
            <div className="footer-contact">
              <h4>Contact</h4>
              <p><FaEnvelope /> support@academicassistant.com</p>
              <p><FaPhone /> +251-XXX-XXXX</p>
              <p><FaMapMarkerAlt /> Haramaya University, Ethiopia</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2024 Academic Assistant. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;