/**
 * Comprehensive Speech Recognition Training System
 * This file contains custom grammars and training data for all website features
 */

// 1. CUSTOM GRAMMAR DEFINITIONS
export const CUSTOM_GRAMMARS = {
  // Registration Form Grammar
  registration: {
    name: '#JSGF V1.0; grammar registration; public <command> = my name is | name is | i am | call me | full name is | my full name is',
    patterns: [
      'my name is [name]',
      'name is [name]', 
      'i am [name]',
      'call me [name]',
      'full name is [name]'
    ]
  },

  // Navigation Grammar
  navigation: {
    name: '#JSGF V1.0; grammar navigation; public <command> = go to | navigate to | open | show me | take me to | i want to see',
    destinations: [
      'dashboard', 'home', 'profile', 'settings', 'courses', 'assignments', 
      'grades', 'schedule', 'calendar', 'messages', 'notifications', 
      'library', 'help', 'support', 'login', 'register', 'logout'
    ]
  },

  // Academic Actions Grammar
  academic: {
    name: '#JSGF V1.0; grammar academic; public <command> = submit | upload | download | view | edit | delete | create | start | complete | mark | grade',
    actions: [
      'submit assignment', 'upload file', 'download document', 'view grades',
      'edit profile', 'delete account', 'create assignment', 'start course',
      'complete lesson', 'mark as read', 'grade assignment'
    ]
  },

  // Form Controls Grammar
  forms: {
    name: '#JSGF V1.0; grammar forms; public <command> = fill | type | enter | select | choose | check | uncheck | click | press',
    fields: [
      'name', 'email', 'phone', 'address', 'password', 'confirm password',
      'department', 'major', 'year', 'semester', 'subject', 'description'
    ]
  },

  // Accessibility Commands Grammar
  accessibility: {
    name: '#JSGF V1.0; grammar accessibility; public <command> = increase | decrease | zoom | magnify | read | speak | stop | pause | continue',
    commands: [
      'increase font size', 'decrease font size', 'zoom in', 'zoom out',
      'read page', 'speak text', 'stop reading', 'pause speech', 'continue reading',
      'high contrast', 'dark mode', 'light mode'
    ]
  }
};

// 2. COMMAND PATTERNS FOR ALL FEATURES
export const COMMAND_PATTERNS = {
  // Registration Commands
  registration: {
    name: [
      /(?:my name is|name is|name:|full name is|full name:|i am|call me)\s*(.+)/i,
      /(?:set name to|enter name|fill name)\s*(.+)/i
    ],
    email: [
      /(?:my email is|email is|email:|my email:)\s*([^\s]+@[^\s]+\.[^\s]+)/i,
      /(?:set email to|enter email)\s*([^\s]+@[^\s]+\.[^\s]+)/i
    ],
    phone: [
      /(?:my phone is|phone is|phone:|my phone:)\s*([\d\s\-\+\(\)]+)/i,
      /(?:set phone to|enter phone)\s*([\d\s\-\+\(\)]+)/i
    ],
    department: [
      /(?:department is|department:|my department is|in the)\s*(.+)/i,
      /(?:set department to|enter department)\s*(.+)/i
    ],
    password: [
      /(?:my password is|password is|password:|set password to)\s*(.+)/i
    ],
    address: [
      /(?:my address is|address is|address:|live at)\s*(.+)/i
    ]
  },

  // Navigation Commands
  navigation: {
    goTo: [
      /(?:go to|navigate to|open|show|take me to|i want to see)\s+(.+)/i,
      /(?:show me|display|load)\s+(.+)/i
    ],
    back: [
      /(?:go back|back|previous|return)/i,
      /(?:go to previous|navigate back)/i
    ],
    home: [
      /(?:home|main page|dashboard|start page)/i
    ]
  },

  // Academic Commands
  academic: {
    submit: [
      /(?:submit|turn in|hand in)\s+(.+)/i,
      /(?:upload|send)\s+(.+)/i
    ],
    view: [
      /(?:view|see|show|open|display)\s+(.+)/i,
      /(?:look at|check|review)\s+(.+)/i
    ],
    create: [
      /(?:create|make|new|add|start)\s+(.+)/i,
      /(?:generate|build|compose)\s+(.+)/i
    ],
    edit: [
      /(?:edit|modify|change|update)\s+(.+)/i,
      /(?:alter|adjust|revise)\s+(.+)/i
    ]
  },

  // Accessibility Commands
  accessibility: {
    fontSize: [
      /(?:increase|decrease|make|change)\s+(?:font|text)\s+size/i,
      /(?:zoom|scale)\s+(in|out)/i
    ],
    reading: [
      /(?:read|speak|say)\s+(?:page|text|content|all)/i,
      /(?:start|begin)\s+reading/i,
      /(?:stop|pause|halt)\s+reading/i
    ],
    contrast: [
      /(?:high|low|increase|decrease)\s+contrast/i,
      /(?:dark|light)\s+mode/i,
      /(?:change|switch)\s+(?:theme|mode)/i
    ]
  },

  // General Commands
  general: {
    help: [
      /(?:help|instructions|what can i say|commands)/i,
      /(?:how to|guide|tutorial)/i
    ],
    status: [
      /(?:status|progress|where am i|current)/i,
      /(?:what page|current page|location)/i
    ],
    confirm: [
      /(?:yes|ok|okay|confirm|sure|continue|proceed)/i,
      /(?:correct|right|that's right|affirmative)/i
    ],
    cancel: [
      /(?:no|cancel|stop|exit|close|back out)/i,
      /(?:never mind|forget it|disagree)/i
    ]
  }
};

// 3. TRAINING DATA EXAMPLES
export const TRAINING_EXAMPLES = {
  registration: [
    "My name is John Smith",
    "Name is Sarah Johnson", 
    "I am Michael Brown",
    "Call me David Wilson",
    "Full name is Emily Davis",
    "My email is john@example.com",
    "Email is sarah@university.edu",
    "My phone is 123-456-7890",
    "Department is Computer Science",
    "My password is secret123",
    "My address is 123 Main Street"
  ],
  
  navigation: [
    "Go to dashboard",
    "Navigate to courses", 
    "Show me my grades",
    "Take me to profile",
    "Open settings",
    "Go back",
    "Return home"
  ],
  
  academic: [
    "Submit assignment",
    "View my grades",
    "Create new assignment",
    "Edit profile",
    "Download lecture notes",
    "Upload project file"
  ],
  
  accessibility: [
    "Increase font size",
    "Read the page",
    "Stop reading",
    "High contrast mode",
    "Zoom in",
    "Dark mode"
  ]
};

// 4. SPEECH RECOGNITION ENHANCER
export class SpeechRecognitionEnhancer {
  private recognition: any;
  private currentGrammar: string = '';
  
  constructor() {
    this.initializeRecognition();
  }

  private initializeRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.setupRecognition();
  }

  private setupRecognition() {
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    
    // Add custom grammars
    this.addCustomGrammars();
  }

  private addCustomGrammars() {
    const SpeechGrammarList = (window as any).SpeechGrammarList;
    if (SpeechGrammarList) {
      this.recognition.grammars = new SpeechGrammarList();
      
      // Add registration grammar
      this.recognition.grammars.addFromString(CUSTOM_GRAMMARS.registration.name, 1);
      
      // Add navigation grammar
      this.recognition.grammars.addFromString(CUSTOM_GRAMMARS.navigation.name, 1);
      
      // Add academic grammar
      this.recognition.grammars.addFromString(CUSTOM_GRAMMARS.academic.name, 1);
    }
  }

  // Train for specific context
  trainForContext(context: 'registration' | 'navigation' | 'academic' | 'accessibility') {
    const grammar = CUSTOM_GRAMMARS[context];
    if (grammar && this.recognition.grammars) {
      this.currentGrammar = grammar.name;
      console.log(`Training for context: ${context}`);
    }
  }

  // Enhanced command matching
  matchCommand(transcript: string, context: string): { action: string; params: any } | null {
    const patterns = COMMAND_PATTERNS[context as keyof typeof COMMAND_PATTERNS];
    if (!patterns) return null;

    for (const [action, patternList] of Object.entries(patterns)) {
      for (const pattern of patternList) {
        const match = transcript.match(pattern);
        if (match) {
          return {
            action,
            params: match.slice(1) // Extract captured groups
          };
        }
      }
    }

    return null;
  }

  // Get recognition instance
  getRecognition() {
    return this.recognition;
  }
}

// 5. TRAINING UTILITY FUNCTIONS
export const TrainingUtils = {
  // Practice specific commands
  practiceCommands: (context: string, onResult: (transcript: string, confidence: number) => void) => {
    const examples = TRAINING_EXAMPLES[context as keyof typeof TRAINING_EXAMPLES] || [];
    console.log(`Practice these ${context} commands:`);
    examples.forEach((example, index) => {
      console.log(`${index + 1}. "${example}"`);
    });
  },

  // Test recognition accuracy
  testAccuracy: (testPhrases: string[], expectedResults: any[]) => {
    console.log('Testing speech recognition accuracy...');
    testPhrases.forEach((phrase, index) => {
      console.log(`Test ${index + 1}: "${phrase}"`);
      console.log(`Expected:`, expectedResults[index]);
    });
  },

  // Get training tips
  getTrainingTips: () => {
    return [
      "Speak clearly and at a moderate pace",
      "Use consistent phrasing for commands",
      "Minimize background noise",
      "Position microphone close to mouth",
      "Practice commands in quiet environment",
      "Use the exact command patterns shown",
      "Wait for listening indicator before speaking"
    ];
  }
};

export default SpeechRecognitionEnhancer;
