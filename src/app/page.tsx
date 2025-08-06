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

// The wake phrase is more reliable with multiple words.
const WAKE_PHRASE = 'hey agile';

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
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [history, setHistory] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isApiConfigured, setIsApiConfigured] = useState(true);
  const [isWaitingForWakeWord, setIsWaitingForWakeWord] = useState(false);
  const { toast } = useToast();
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const finalTranscriptRef = useRef('');
  const wakeWordTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Health check effect
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
        audioRef.current.src = audioDataUri;
        audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
    }
  }, []);

  const processTranscript = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    setIsLoading(true);
    setCurrentTranscript('');
    finalTranscriptRef.current = '';

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: text };
    setHistory(prev => [...prev.slice(-10), userMessage]); // Keep history trimmed

    try {
        const response = await fetch('/api/gen-ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: [...history, userMessage] }),
        });

        if (!response.body) {
            throw new Error('The response does not contain a readable stream.');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';
        const assistantMessageId = Date.now().toString() + 'a';
        setHistory(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: '' }]);

        // Stream the response
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            fullResponse += chunk;
            setHistory(prev => prev.map(msg => 
                msg.id === assistantMessageId 
                ? { ...msg, content: fullResponse } 
                : msg
            ));
        }

        // Call TTS API once the full response is received
        if (fullResponse) {
            try {
                const ttsResponse = await callTextToSpeechApi(fullResponse, languages.find(l => l.code === selectedLanguage)?.ttsCode || 'en-US');
                if (ttsResponse.audioDataUri) {
                    setHistory(prev => prev.map(msg => 
                        msg.id === assistantMessageId 
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
                    description: ttsError instanceof Error ? ttsError.message : "Could not generate audio.",
                });
            }
        }
    } catch (error) {
      console.error('Error processing transcript:', error);
      toast({
        variant: "destructive",
        title: "AI Error",
        description: error instanceof Error ? error.message : "Could not get a response from the assistant.",
      });
       setHistory(prev => prev.filter(msg => msg.role !== 'assistant' || msg.content !== ''));

    } finally {
      setIsLoading(false);
    }
  }, [isLoading, toast, playAudio, selectedLanguage, history]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  // Effect for initializing and managing speech recognition
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

    recognitionRef.current = recognition;
    audioRef.current = new Audio();

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
      // If we were not waiting for a wake word, it means the user finished their question.
      if (!isWaitingForWakeWord && finalTranscriptRef.current) {
        processTranscript(finalTranscriptRef.current);
      }
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
       if (event.error !== 'no-speech' && event.error !== 'aborted') {
          toast({
            variant: "destructive",
            title: "Speech Recognition Error",
            description: event.error === 'not-allowed' ? 'Microphone access was denied.' : `An error occurred: ${event.error}`,
          });
      }
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscriptChunk = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptChunk += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const finalLower = finalTranscriptChunk.toLowerCase().trim();

      if (isWaitingForWakeWord) {
        setCurrentTranscript(interimTranscript || 'Say "Hey Agile" to start...');
        // Check if the final transcript chunk contains the wake phrase
        if (finalLower.includes(WAKE_PHRASE)) {
            console.log("Wake word detected!");
            
            // Clear any timeout that would have turned off listening
            if (wakeWordTimeoutRef.current) {
                clearTimeout(wakeWordTimeoutRef.current);
                wakeWordTimeoutRef.current = null;
            }

            // Immediately switch to question-listening mode
            setIsWaitingForWakeWord(false);
            finalTranscriptRef.current = ''; // Clear transcript buffer
            setCurrentTranscript("I'm listening...");
        }
      } else {
        // We are now listening for the question
        finalTranscriptRef.current += finalTranscriptChunk;
        setCurrentTranscript(interimTranscript || finalTranscriptRef.current || 'Listening...');
      }
    };

    return () => {
        recognitionRef.current?.abort();
    };
  }, [selectedLanguage, toast, processTranscript, isWaitingForWakeWord]);


  const startListening = () => {
    if (!isApiConfigured || isListening || isLoading) {
        if (!isApiConfigured) {
             toast({
                variant: "destructive",
                title: "Configuration Error",
                description: "Cannot start listening, the backend is not configured correctly.",
             });
        }
      return;
    }
    
    finalTranscriptRef.current = '';
    setCurrentTranscript('Say "Hey Agile" to start...');
    setIsWaitingForWakeWord(true);
    recognitionRef.current?.start();

    // Add a timeout to stop listening for the wake word after 15 seconds to save resources
    if (wakeWordTimeoutRef.current) clearTimeout(wakeWordTimeoutRef.current);
    wakeWordTimeoutRef.current = setTimeout(() => {
        if(isWaitingForWakeWord) {
            console.log("Wake word timeout.");
            stopListening();
        }
    }, 15000);
  };

  const handleMicButtonClick = () => {
      if(isListening) {
          stopListening();
      } else {
          startListening();
      }
  }

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
              onMicClick={handleMicButtonClick}
              disabled={!isApiConfigured}
            />
        </div>
      </main>

       {(isListening || currentTranscript) && (
        <div className="fixed bottom-28 w-full text-center px-4 pointer-events-none">
          <p className="text-muted-foreground bg-card/90 backdrop-blur-sm p-3 rounded-lg inline-block shadow-lg animate-pulse">
            {currentTranscript || 'Listening...'}
          </p>
        </div>
      )}

      {/* Debug Info Panel */}
      <div className="fixed bottom-4 left-4 bg-gray-800 text-white text-xs p-2 rounded-lg shadow-lg opacity-70 pointer-events-none">
        <h4 className="font-bold mb-1">Debug Info</h4>
        <p>isListening: {isListening.toString()}</p>
        <p>isWaiting: {isWaitingForWakeWord.toString()}</p>
        <p>isLoading: {isLoading.toString()}</p>
        <p>Transcript: "{currentTranscript}"</p>
      </div>
    </div>
  );
}
