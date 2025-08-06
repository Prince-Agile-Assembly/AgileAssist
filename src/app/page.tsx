"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { MicButton } from '@/components/MicButton';
import { ChatHistory } from '@/components/ChatHistory';
import { LanguageSelector, languages } from '@/components/LanguageSelector';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BrainCircuit } from 'lucide-react';
import { Message } from 'ai';

const SpeechRecognition =
  typeof window !== 'undefined' ? (window.SpeechRecognition || (window as any).webkitSpeechRecognition) : null;

const wakePhrases = ['hey agile'];

async function callTextToSpeechApi(text: string, languageCode: string) {
  const response = await fetch('/api/gen-ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      action: 'textToSpeech', 
      payload: { text, languageCode } 
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(errorBody.details || errorBody.error || 'TTS API call failed');
  }

  return response.json();
}

export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en-US');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [history, setHistory] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isApiConfigured, setIsApiConfigured] = useState(true);
  const [isWaitingForWakeWord, setIsWaitingForWakeWord] = useState(false);
  const { toast } = useToast();
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // This ref will hold the latest transcript without causing re-renders on every change.
  const transcriptRef = useRef('');
  
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const response = await fetch('/api/health');
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error);
        }
        setIsApiConfigured(true);
      } catch (error) {
        setIsApiConfigured(false);
        console.error("API health check failed:", error);
        toast({
          variant: "destructive",
          title: "Configuration Error",
          description: "The backend is not configured correctly. Please ensure the GEMINI_API_KEY is set in your environment.",
          duration: 10000,
        });
      }
    };
    checkApiHealth();
  }, [toast]);
  
  const playAudio = useCallback((audioDataUri: string) => {
    if (audioRef.current) {
        const audio = new Audio(audioDataUri);
        audio.play().catch(e => console.error("Audio playback failed:", e));
        audioRef.current = audio;
    }
  }, []);

  const processTranscript = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    setIsLoading(true);
    setLiveTranscript('');
    transcriptRef.current = '';

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: text };
    setHistory(prev => [...prev, userMessage]);

    try {
      const response = await fetch('/api/gen-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'answerQuestion', payload: { question: text } }),
      });
      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.details || 'Failed to get a response from the assistant.');
      }
      const { answer } = await response.json();
      
      const assistantMessage: Message = { id: Date.now().toString() + 'a', role: 'assistant', content: answer };
      setHistory(prev => [...prev, assistantMessage]);

      // Call TTS API
      try {
        const ttsResponse = await callTextToSpeechApi(answer, languages.find(l => l.code === selectedLanguage)?.ttsCode || 'en-US');
        
        if (ttsResponse.audioDataUri) {
          // Find the assistant message and add audio data to it
          setHistory(prev => prev.map(msg => 
            msg.id === assistantMessage.id 
              ? { ...msg, data: { audioDataUri: ttsResponse.audioDataUri } } 
              : msg
          ));
          playAudio(ttsResponse.audioDataUri);
        }
      } catch (ttsError) {
         console.error('Error with TTS API:', ttsError);
         toast({
          variant: "destructive",
          title: "Audio Error",
          description: ttsError instanceof Error ? ttsError.message : "Could not generate audio for the response.",
        });
      }

    } catch (error) {
      console.error('Error processing transcript:', error);
      toast({
        variant: "destructive",
        title: "AI Error",
        description: error instanceof Error ? error.message : "Could not get a response from the assistant.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, toast, playAudio, selectedLanguage]);

  useEffect(() => {
    if (!SpeechRecognition) {
      toast({
        variant: "destructive",
        title: "Browser Not Supported",
        description: "Your browser does not support speech recognition.",
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = selectedLanguage;

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      
      const combinedTranscript = (transcriptRef.current + finalTranscript).trim().toLowerCase();
      
      if (isWaitingForWakeWord) {
        const wakeWordDetected = wakePhrases.some(phrase => combinedTranscript.includes(phrase));
        if (wakeWordDetected) {
            console.log("Wake word detected!");
            setIsWaitingForWakeWord(false);
            setLiveTranscript("I'm listening...");
            // Stop and restart recognition to clear the buffer
            recognitionRef.current?.stop();
            setTimeout(() => recognitionRef.current?.start(), 100);
        } else {
             setLiveTranscript('Say "Hey Agile" to start...');
        }
      } else {
          transcriptRef.current = finalTranscript;
          setLiveTranscript(interimTranscript);
      }
    };

    recognition.onend = () => {
      if (isListening) {
        // If we are still supposed to be listening (not manually stopped), restart it.
        // This handles cases where recognition times out.
        if (!isWaitingForWakeWord) {
             processTranscript(transcriptRef.current);
        }
        // If waiting for wake word, just restart
        else if (recognitionRef.current) {
           recognitionRef.current.start();
        }
      }
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
       if ((event as any).error !== 'no-speech') {
          toast({
            variant: "destructive",
            title: "Speech Recognition Error",
            description: (event as any).error === 'not-allowed' ? 'Microphone access was denied.' : `An error occurred: ${(event as any).error}`,
          });
      }
      setIsListening(false);
      setIsWaitingForWakeWord(false);
    };

    recognitionRef.current = recognition;
    audioRef.current = new Audio();

    return () => {
        recognitionRef.current?.abort();
    }
  }, [selectedLanguage, toast, processTranscript, isWaitingForWakeWord, isListening]);

  const startListening = () => {
    if (!isApiConfigured) {
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: "Cannot start listening, the backend is not configured correctly. Please check your API key.",
      });
      return;
    }
    if (recognitionRef.current && !isListening && !isLoading) {
      transcriptRef.current = '';
      setLiveTranscript('Say "Hey Agile" to start...');
      setIsWaitingForWakeWord(true);
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setIsWaitingForWakeWord(false);
      setLiveTranscript('');
      if (transcriptRef.current && !isWaitingForWakeWord) {
          processTranscript(transcriptRef.current);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex items-center justify-between p-4 border-b shrink-0">
        <div className="flex items-center gap-2">
            <BrainCircuit className="text-primary h-8 w-8" />
            <h1 className="text-xl font-bold font-headline">Lumina Spark</h1>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSelector selectedLanguage={selectedLanguage} onSelectLanguage={setSelectedLanguage} />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden">
        {history.length > 0 ? (
          <ChatHistory messages={history} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="bg-card p-8 rounded-lg shadow-lg max-w-md">
              <BrainCircuit className="text-primary h-16 w-16 mx-auto mb-4" />
              <h2 className="text-2xl font-bold font-headline mb-2">Welcome to Lumina Spark</h2>
              <p className="text-muted-foreground">
                {isApiConfigured 
                  ? "Your AI academic assistant. Press the microphone button and start speaking to ask a question."
                  : "Backend not configured. Please set your GEMINI_API_KEY."
                }
              </p>
            </div>
          </div>
        )}
        <div className="absolute bottom-0 w-full flex justify-center p-4 pointer-events-none">
            <MicButton 
              isListening={isListening} 
              isLoading={isLoading} 
              startListening={startListening}
              stopListening={stopListening}
              disabled={!isApiConfigured || isLoading}
            />
        </div>
      </main>

       {(isListening || liveTranscript) && (
        <div className="fixed bottom-28 w-full text-center px-4 pointer-events-none">
          <p className="text-muted-foreground bg-card/90 backdrop-blur-sm p-3 rounded-lg inline-block shadow-lg animate-pulse">
            {liveTranscript || 'Listening...'}
          </p>
        </div>
      )}

      {/* Debug Info Panel */}
      <div className="fixed bottom-4 left-4 bg-gray-800 text-white text-xs p-2 rounded-lg shadow-lg opacity-70 pointer-events-none">
        <h4 className="font-bold mb-1">Debug Info</h4>
        <p>isListening: {isListening.toString()}</p>
        <p>isWaiting: {isWaitingForWakeWord.toString()}</p>
        <p>isLoading: {isLoading.toString()}</p>
        <p>Transcript: "{liveTranscript}"</p>
      </div>
    </div>
  );
}
