import { useState, useCallback, useRef } from 'react';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    SpeechGrammarList: any;
  }
}

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US'; // Change to your preferred language
    
    // Add custom grammar for academic terms
    const SpeechGrammarList = window.SpeechGrammarList;
    recognition.grammars = new SpeechGrammarList();
    const grammar = '#JSGF V1.0; grammar commands; public <command> = module | lecture | assignment | exam | student | professor | classroom | schedule | grades | attendance | deadline | submission | project | thesis | research | laboratory | tutorial | seminar | workshop | presentation | dissertation | coursework | assessment | evaluation | feedback | resources | materials | syllabus | curriculum | enrollment | registration | transcript | certificate | degree | major | minor | elective | prerequisite | corequisite | academic | faculty | department | college | university | campus | library | dormitory | cafeteria | student union | athletics | recreation | health services | counseling | career services | financial aid | scholarship | grant | loan | tuition | fees | accommodation | transportation | parking | security | emergency | maintenance | facilities | technology | IT support | help desk | computer lab | wifi | printing | copying | scanning | bookstore | supplies | merchandise | clothing | gifts | graduation | commencement | ceremony | reunion | alumni | donation | fundraising | endowment | foundation | board | trustees | administration | president | dean | director | coordinator | manager | assistant | secretary | clerk | technician | analyst | specialist | consultant | advisor | counselor | tutor | mentor | coach | instructor | lecturer | professor | researcher | scientist | scholar | author | writer | editor | publisher | journalist | reporter | photographer | designer | artist | musician | composer | performer | actor | director | producer | manager | agent | lawyer | doctor | nurse | therapist | pharmacist | dentist | veterinarian | engineer | architect | accountant | banker | consultant | entrepreneur | business owner | executive | manager | supervisor | team leader | project manager | product manager | program manager | operations manager | marketing manager | sales manager | customer service manager | human resources manager | finance manager | IT manager | quality manager | risk manager | compliance manager | training manager | development manager | research manager | innovation manager | strategy manager | planning manager | analytics manager | data manager | security manager | facilities manager | maintenance manager | logistics manager | supply chain manager | procurement manager | vendor manager | contract manager | legal manager | regulatory manager | policy manager | communications manager | public relations manager | social media manager | content manager | brand manager | digital manager | e-commerce manager | retail manager | store manager | restaurant manager | hotel manager | event manager | travel manager | tourism manager | recreation manager | sports manager | fitness manager | wellness manager | health manager | safety manager | environmental manager | sustainability manager | community manager | volunteer manager | nonprofit manager | charity manager | foundation manager | trust manager | estate manager | wealth manager | investment manager | portfolio manager | fund manager | asset manager | property manager | real estate manager | construction manager | infrastructure manager | urban planner | city manager | government manager | public administrator | policy maker | legislator | representative | senator | congressman | mayor | governor | president | prime minister | chancellor | ambassador | diplomat | consul | attaché | trade representative | economic advisor | military advisor | security advisor | intelligence analyst | special agent | investigator | detective | police officer | sheriff | deputy | marshal | ranger | warden | guard | security officer | private investigator | bounty hunter | process server | notary public | court reporter | paralegal | legal assistant | law clerk | judge | magistrate | justice | prosecutor | district attorney | public defender | defense attorney | corporate counsel | general counsel | in-house counsel | outside counsel | expert witness | consultant | mediator | arbitrator | negotiator | facilitator | trainer | educator | teacher | professor | lecturer | instructor | tutor | mentor | coach | advisor | counselor | therapist | psychologist | psychiatrist | social worker | case manager | caregiver | nurse practitioner | physician assistant | medical assistant | dental hygienist | physical therapist | occupational therapist | speech therapist | respiratory therapist | radiation therapist | dietitian | nutritionist | pharmacist | pharmacy technician | medical technologist | laboratory technician;';
    recognition.grammars.addFromString(grammar, 1);

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);
    };

    recognition.onerror = (event: any) => {
      setError(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
  };
};
