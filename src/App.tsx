import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ChatBubbleLeftRightIcon, 
  CommandLineIcon, 
  BellIcon, 
  Cog6ToothIcon,
  AcademicCapIcon,
  XMarkIcon,
  BookOpenIcon,
  HomeIcon,
  MicrophoneIcon
} from '@heroicons/react/24/outline';
import ChatInterface from './components/ChatInterface';
import ReminderSystem from './components/ReminderSystem';
import CommandPanel from './components/CommandPanel';
import ModuleManager from './components/ModuleManager';
import VoiceAnnouncer from './components/VoiceAnnouncer';
import WhisperTranscriber from './components/WhisperTranscriber';
import { Message, Reminder, Command, AcademicContext, AccessibilitySettings, Module } from './types';
import { useTextToSpeech } from './hooks/useTextToSpeech';
import { useVoiceNavigation } from './hooks/useVoiceNavigation';
import AdminAccess from './components/AdminAccess';
import './App.css';

// Helper to get tab from URL hash
const getTabFromHash = (hash: string): 'chat' | 'commands' | 'reminders' | 'modules' | 'transcriber' => {
  switch (hash) {
    case '#chat': return 'chat';
    case '#commands': return 'commands';
    case '#reminders': return 'reminders';
    case '#modules': return 'modules';
    case '#transcriber': return 'transcriber';
    default: return 'chat';
  }
};

const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Initialize tab from URL hash
  const [activeTab, setActiveTab] = useState<'chat' | 'commands' | 'reminders' | 'modules' | 'transcriber'>(() => {
    return getTabFromHash(window.location.hash);
  });
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [modules, setModules] = useState<Module[]>([
    {
      id: '1',
      title: 'Introduction to Computer Science',
      description: 'Basic concepts and fundamentals of computer science',
      content: 'This module covers the basics of computer science including algorithms, data structures, and programming concepts.',
      category: 'Computer Science',
      order: 1,
      isActive: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-11-01'),
      voiceEnabled: true
    },
    {
      id: '2',
      title: 'Mathematics Fundamentals',
      description: 'Essential mathematical concepts for programming',
      content: 'This module provides the mathematical foundation needed for computer science, including discrete mathematics, linear algebra, probability, and statistics. These concepts are crucial for understanding algorithms and data structures.',
      category: 'Mathematics',
      order: 2,
      isActive: true,
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-10-15'),
      voiceEnabled: true
    },
    {
      id: '3',
      title: 'Web Development Basics',
      description: 'Introduction to modern web development',
      content: 'Learn the fundamentals of web development including HTML, CSS, and JavaScript. This module covers responsive design, modern web standards, and best practices for creating user-friendly web applications.',
      category: 'Web Development',
      order: 3,
      isActive: true,
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-11-05'),
      voiceEnabled: true
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [announcements, setAnnouncements] = useState<string[]>([]);

  const { speak, loadVoices } = useTextToSpeech();

  const [academicContext] = useState<AcademicContext>({
    studentId: 'HU2024001',
    courses: [
      { id: '1', name: 'Computer Science Fundamentals', code: 'CS101', instructor: 'Dr. Smith', schedule: 'Mon/Wed 9:00 AM', credits: 3 },
      { id: '2', name: 'Mathematics II', code: 'MATH201', instructor: 'Prof. Johnson', schedule: 'Tue/Thu 10:30 AM', credits: 4 },
      { id: '3', name: 'English Literature', code: 'ENG102', instructor: 'Dr. Brown', schedule: 'Fri 2:00 PM', credits: 3 }
    ],
    currentSemester: 'Fall 2024',
    department: 'Computer Science'
  });

  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 'medium',
    highContrast: false,
    screenReader: false,
    voiceSpeed: 1.0,
    autoSpeak: false,
    voiceNavigation: false
  });

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const tab = getTabFromHash(window.location.hash);
      setActiveTab(tab);
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update URL hash when tab changes
  const updateTab = useCallback((tab: 'chat' | 'commands' | 'reminders' | 'modules' | 'transcriber') => {
    setActiveTab(tab);
    window.location.hash = tab;
  }, []);

  // Navigate to Home Dashboard
  const goToHome = useCallback(() => {
    speak("Returning to Home Dashboard");
    navigate("/home");
  }, [navigate, speak]);

  // Voice navigation setup
  const getCurrentLocation = useCallback(() => activeTab, [activeTab]);
  const availableDestinations = ['chat', 'commands', 'reminders', 'modules', 'transcriber'];
  
  const addAnnouncement = useCallback((message: string) => {
    setAnnouncements(prev => [...prev, message]);
  }, []);
  
  const handleNavigate = useCallback((destination: string) => {
    if (destination === 'chat' || destination === 'commands' || destination === 'reminders' || destination === 'modules' || destination === 'transcriber') {
      updateTab(destination as any);
      addAnnouncement(`Navigated to ${destination} tab`);
    }
  }, [updateTab, addAnnouncement]);
  
  const { handleVoiceNavigation } = useVoiceNavigation({
    onNavigate: handleNavigate,
    getCurrentLocation,
    availableDestinations,
    settings
  });

  // Module management functions
  const handleAddModule = useCallback((module: Omit<Module, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newModule: Module = {
      ...module,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setModules(prev => [...prev, newModule]);
    addAnnouncement(`Module "${module.title}" has been added successfully.`);
    if (settings.autoSpeak) speak(`Module "${module.title}" added`, { rate: settings.voiceSpeed });
  }, [settings.autoSpeak, settings.voiceSpeed, speak, addAnnouncement]);

  const handleUpdateModule = useCallback((id: string, updates: Partial<Module>) => {
    setModules(prev => prev.map(module => 
      module.id === id 
        ? { ...module, ...updates, updatedAt: new Date() }
        : module
    ));
  }, []);

  const handleDeleteModule = useCallback((id: string) => {
    const module = modules.find(m => m.id === id);
    setModules(prev => prev.filter(m => m.id !== id));
    if (module) addAnnouncement(`Module "${module.title}" has been deleted.`);
  }, [modules, addAnnouncement]);

  const [commands] = useState<Command[]>([
    {
      id: '1',
      name: 'Open Chat',
      description: 'Navigate to the AI chat interface',
      voiceTrigger: 'open chat',
      action: () => updateTab('chat'),
      category: 'navigation'
    },
    {
      id: '2',
      name: 'Show Reminders',
      description: 'Display your reminders and tasks',
      voiceTrigger: 'show reminders',
      action: () => updateTab('reminders'),
      category: 'navigation'
    },
    {
      id: '3',
      name: 'View Schedule',
      description: 'Check your class schedule',
      voiceTrigger: 'view schedule',
      action: () => handleViewSchedule(),
      category: 'academic'
    },
    {
      id: '4',
      name: 'Add Assignment',
      description: 'Create a new assignment reminder',
      voiceTrigger: 'add assignment',
      action: () => handleAddAssignment(),
      category: 'academic'
    },
    {
      id: '5',
      name: 'Help',
      description: 'Get help and available commands',
      voiceTrigger: 'help',
      action: () => handleHelpCommand(),
      category: 'accessibility'
    },
    {
      id: '6',
      name: 'Increase Font Size',
      description: 'Make text larger',
      voiceTrigger: 'increase font size',
      action: () => handleFontSizeChange('large'),
      category: 'accessibility'
    },
    {
      id: '7',
      name: 'Read Last Message',
      description: 'Read the last chat message aloud',
      voiceTrigger: 'read last message',
      action: () => handleReadLastMessage(),
      category: 'accessibility'
    },
    {
      id: '8',
      name: 'What Can I Say',
      description: 'List all available voice commands',
      voiceTrigger: 'what can I say',
      action: () => handleListCommands(),
      category: 'accessibility'
    },
    {
      id: '9',
      name: 'Toggle Auto Speak',
      description: 'Turn automatic voice reading on or off',
      voiceTrigger: 'toggle auto speak',
      action: () => handleToggleAutoSpeak(),
      category: 'accessibility'
    },
    {
      id: '10',
      name: 'Where Am I',
      description: 'Announce current screen and options',
      voiceTrigger: 'where am I',
      action: () => handleAnnounceLocation(),
      category: 'navigation'
    },
    {
      id: '11',
      name: 'Open Modules',
      description: 'Navigate to learning modules',
      voiceTrigger: 'open modules',
      action: () => updateTab('modules'),
      category: 'navigation'
    },
    {
      id: '12',
      name: 'Next Tab',
      description: 'Go to the next tab',
      voiceTrigger: 'next tab',
      action: () => {
        const destinations = ['chat', 'commands', 'reminders', 'modules'];
        const currentIndex = destinations.indexOf(activeTab);
        const nextIndex = (currentIndex + 1) % destinations.length;
        updateTab(destinations[nextIndex] as any);
      },
      category: 'navigation'
    },
    {
      id: '13',
      name: 'Previous Tab',
      description: 'Go to the previous tab',
      voiceTrigger: 'previous tab',
      action: () => {
        const destinations = ['chat', 'commands', 'reminders', 'modules'];
        const currentIndex = destinations.indexOf(activeTab);
        const prevIndex = currentIndex === 0 ? destinations.length - 1 : currentIndex - 1;
        updateTab(destinations[prevIndex] as any);
      },
      category: 'navigation'
    }
  ]);

  useEffect(() => {
    loadVoices();
    
    const welcomeMessage: Message = {
      id: '1',
      text: `Welcome to the AI-Powered Academic Assistant for Visually Impaired Students at Haramaya University! I'm your voice-controlled study companion. You can use voice commands for everything - say "help" to hear all available commands, "open chat" to start talking, or "view schedule" for your classes. I'll read everything aloud for you. How can I assist you today?`,
      sender: 'assistant',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [loadVoices]);

  const generateAIResponse = useCallback((userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('schedule') || lowerMessage.includes('class')) {
      return `Here's your schedule for today:\n• 9:00 AM - Computer Science Fundamentals with Dr. Smith\n• 10:30 AM - Mathematics II with Prof. Johnson\n• 2:00 PM - English Literature with Dr. Brown\n\nWould you like more details?`;
    }
    
    if (lowerMessage.includes('assignment') || lowerMessage.includes('homework')) {
      return `I can help manage your assignments! Say "add assignment" to create a reminder, or "show reminders" to see current tasks.`;
    }
    
    if (lowerMessage.includes('help')) {
      return `I can help with: answering questions, managing your schedule, setting reminders, providing study tips, and navigating the app. Try saying "view schedule", "add assignment", or "next tab".`;
    }
    
    if (lowerMessage.includes('module') || lowerMessage.includes('course')) {
      return `You have ${modules.length} learning modules available. Say "open modules" to browse them.`;
    }
    
    return `I understand you're asking about "${userMessage}". I'm here to help with your studies at Haramaya University. What would you like to know?`;
  }, [modules]);

  const handleSendMessage = useCallback(async (message: string, isVoice = false) => {
    if (handleVoiceNavigation(message)) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date(),
      isVoice
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(() => {
      const response = generateAIResponse(message);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);

      if (settings.autoSpeak) speak(response, { rate: settings.voiceSpeed });
    }, 1000);
  }, [handleVoiceNavigation, settings.autoSpeak, settings.voiceSpeed, speak, generateAIResponse]);

  const handleViewSchedule = useCallback(() => {
    const scheduleMessage = academicContext.courses.map(course => 
      `${course.code}: ${course.name} - ${course.schedule} with ${course.instructor}`
    ).join('\n');
    
    const message: Message = {
      id: Date.now().toString(),
      text: `Your current schedule:\n${scheduleMessage}`,
      sender: 'assistant',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, message]);
    updateTab('chat');
    if (settings.autoSpeak) speak(`Your schedule has ${academicContext.courses.length} courses.`, { rate: settings.voiceSpeed });
  }, [academicContext.courses, settings.autoSpeak, settings.voiceSpeed, speak]);

  const handleAddAssignment = useCallback(() => {
    updateTab('reminders');
    setTimeout(() => {
      speak('Assignment reminder form opened. Say "add assignment" followed by the title to create one.', { rate: settings.voiceSpeed });
    }, 500);
  }, [settings.voiceSpeed, speak]);

  const handleHelpCommand = useCallback(() => {
    const helpText = `Available commands: open chat, show reminders, view schedule, add assignment, open modules, next tab, previous tab, increase font size, read last message, what can I say, toggle auto speak, where am I, help.`;
    
    const helpMessage: Message = {
      id: Date.now().toString(),
      text: helpText,
      sender: 'assistant',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, helpMessage]);
    updateTab('chat');
    if (settings.autoSpeak) speak(helpText, { rate: settings.voiceSpeed });
  }, [settings.autoSpeak, settings.voiceSpeed, speak]);

  const handleFontSizeChange = useCallback((size: 'small' | 'medium' | 'large' | 'extra-large') => {
    setSettings(prev => ({ ...prev, fontSize: size }));
    speak(`Font size changed to ${size}`, { rate: settings.voiceSpeed });
  }, [settings.voiceSpeed, speak]);

  const handleReadLastMessage = useCallback(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.sender === 'assistant') {
      speak(lastMessage.text, { rate: settings.voiceSpeed });
    } else if (lastMessage) {
      speak('The last message was from you. Ask me to read the assistant\'s response.', { rate: settings.voiceSpeed });
    }
  }, [messages, settings.voiceSpeed, speak]);

  const handleListCommands = useCallback(() => {
    const commandList = commands.map(cmd => `${cmd.name}`).join(', ');
    speak(`Available commands: ${commandList}`, { rate: settings.voiceSpeed });
  }, [commands, settings.voiceSpeed, speak]);

  const handleToggleAutoSpeak = useCallback(() => {
    setSettings(prev => ({ ...prev, autoSpeak: !prev.autoSpeak }));
    speak(`Auto-speak is now ${!settings.autoSpeak ? 'enabled' : 'disabled'}`, { rate: settings.voiceSpeed });
  }, [settings.autoSpeak, settings.voiceSpeed, speak]);

  const handleAnnounceLocation = useCallback(() => {
    const locationText = `You are on the ${activeTab} tab. ${activeTab === 'chat' ? 'Ask me anything about your studies.' : activeTab === 'reminders' ? `You have ${reminders.filter(r => !r.isCompleted).length} pending tasks.` : 'Say "help" for options.'}`;
    speak(locationText, { rate: settings.voiceSpeed });
  }, [activeTab, reminders, settings.voiceSpeed, speak]);

  const handleExecuteCommand = useCallback((command: Command) => {
    command.action();
    if (settings.autoSpeak) speak(`Executing ${command.name}`, { rate: settings.voiceSpeed });
  }, [settings.autoSpeak, settings.voiceSpeed, speak]);

  const handleAddReminder = useCallback((reminder: Omit<Reminder, 'id'>) => {
    const newReminder: Reminder = {
      ...reminder,
      id: Date.now().toString()
    };
    setReminders(prev => [...prev, newReminder]);
    addAnnouncement(`Reminder added: ${reminder.title}`);
    if (settings.autoSpeak) speak(`Reminder added: ${reminder.title}`, { rate: settings.voiceSpeed });
  }, [settings.autoSpeak, settings.voiceSpeed, speak, addAnnouncement]);

  const handleToggleReminder = useCallback((id: string) => {
    setReminders(prev => prev.map(r => 
      r.id === id ? { ...r, isCompleted: !r.isCompleted } : r
    ));
  }, []);

  const handleDeleteReminder = useCallback((id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  }, []);

  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case 'small': return 'text-sm';
      case 'large': return 'text-lg';
      case 'extra-large': return 'text-xl';
      default: return 'text-base';
    }
  };

  const navItems = [
    { id: 'chat', label: 'AI Chat', icon: ChatBubbleLeftRightIcon },
    { id: 'commands', label: 'Voice Commands', icon: CommandLineIcon },
    { id: 'reminders', label: 'Reminders', icon: BellIcon },
    { id: 'modules', label: 'Modules', icon: BookOpenIcon },
    { id: 'transcriber', label: 'Speech Recognition', icon: MicrophoneIcon }
  ];

  return (
    <VoiceAnnouncer announcements={announcements} settings={settings}>
      <div className={`min-h-screen flex flex-col ${getFontSizeClass()} ${settings.highContrast ? 'contrast-125' : ''}`}>
        {/* Header */}
        <header className="bg-gradient-to-r from-primary-700 via-primary-600 to-primary-700 text-white shadow-lg sticky top-0 z-40">
          <div className="px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center space-x-3">
                <div className="p-1.5 sm:p-2 bg-white/20 backdrop-blur-lg rounded-xl">
                  <AcademicCapIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold">Academic Assistant</h1>
                  <p className="text-primary-100 text-xs sm:text-sm">Haramaya University - {academicContext.studentId}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Home Button */}
                <button
                  onClick={goToHome}
                  className="p-1.5 sm:p-2 bg-white/20 backdrop-blur-lg hover:bg-white/30 rounded-xl transition-all duration-300 hover:scale-105"
                  aria-label="Go to Home Dashboard"
                >
                  <HomeIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                
                {/* Settings Button */}
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-1.5 sm:p-2 bg-white/20 backdrop-blur-lg hover:bg-white/30 rounded-xl transition-all duration-300 hover:scale-105"
                  aria-label="Settings"
                >
                  <Cog6ToothIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="bg-white shadow-md border-b sticky top-[72px] sm:top-[88px] z-30 overflow-x-auto">
          <div className="px-4 sm:px-6">
            <div className="flex space-x-1 sm:space-x-2 min-w-max">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => updateTab(item.id as any)}
                  className={`nav-tab flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-6 py-2.5 sm:py-4 border-b-2 transition-all duration-300 whitespace-nowrap ${
                    activeTab === item.id
                      ? 'border-primary-600 text-primary-600 bg-gradient-to-r from-primary-50 to-transparent'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden bg-gray-50">
          {activeTab === 'chat' && (
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isTyping={isTyping}
            />
          )}
          
          {activeTab === 'commands' && (
            <CommandPanel
              commands={commands}
              onExecuteCommand={handleExecuteCommand}
            />
          )}
          
          {activeTab === 'reminders' && (
            <ReminderSystem
              reminders={reminders}
              onAddReminder={handleAddReminder}
              onToggleReminder={handleToggleReminder}
              onDeleteReminder={handleDeleteReminder}
            />
          )}
          
          {activeTab === 'modules' && (
            <ModuleManager
              modules={modules}
              onAddModule={handleAddModule}
              onUpdateModule={handleUpdateModule}
              onDeleteModule={handleDeleteModule}
              isAdmin={false}
              settings={settings}
            />
          )}
          
          {activeTab === 'transcriber' && (
            <WhisperTranscriber />
          )}
        </main>
      </div>
    </VoiceAnnouncer>
  );

  {/* Settings Modal */}
  {showSettings && (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-5 sm:p-8 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold gradient-text">Accessibility Settings</h2>
          <button
            onClick={() => setShowSettings(false)}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-5 sm:space-y-6">
          <div>
            <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">Font Size</label>
            <select
              value={settings.fontSize}
              onChange={(e) => setSettings(prev => ({ ...prev, fontSize: e.target.value as any }))}
              className="input-field text-base sm:text-lg"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="extra-large">Extra Large</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl">
            <span className="text-base sm:text-lg font-semibold text-gray-800">High Contrast</span>
            <button
              onClick={() => setSettings(prev => ({ ...prev, highContrast: !prev.highContrast }))}
              className={`w-12 h-6 sm:w-14 sm:h-7 rounded-full transition-all duration-300 ${
                settings.highContrast ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full shadow-lg transition-transform duration-300 ${
                settings.highContrast ? 'translate-x-6 sm:translate-x-7' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>
        
        <div className="mt-6 sm:mt-8">
          <button
            onClick={() => setShowSettings(false)}
            className="w-full btn-primary-custom text-base sm:text-lg font-semibold"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )}
};

export default App;