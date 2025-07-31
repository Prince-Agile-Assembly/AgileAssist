"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { answerQuestion } from '@/ai/flows/answerQuestion';
import { textToSpeech } from '@/ai/flows/textToSpeech';
import { useToast } from "@/hooks/use-toast";
import { MicButton } from '@/components/MicButton';
import { ChatHistory } from '@/components/ChatHistory';
import { LanguageSelector, languages } from '@/components/LanguageSelector';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BrainCircuit } from 'lucide-react';

interface QAPair {
  id: number;
  question: string;
  answer: string;
  audioDataUri?: string;
}

const SpeechRecognition =
  typeof window !== 'undefined' ? (window.SpeechRecognition || (window as any).webkitSpeechRecognition) : null;

export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<QAPair[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en-US');
  const [liveTranscript, setLiveTranscript] = useState('');
  const { toast } = useToast();
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef<string>('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = useCallback((audioDataUri: string) => {
    if (audioRef.current) {
      audioRef.current.src = audioDataUri;
      audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
    }
  }, []);

  const processTranscript = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setIsLoading(true);
    setLiveTranscript('');
    finalTranscriptRef.current = '';

    try {
      const result = await answerQuestion({ question: text });
      
      const ttsResponse = await textToSpeech({ 
        text: result.answer, 
        languageCode: languages.find(l => l.code === selectedLanguage)?.ttsCode || 'en-US'
      });
      
      const newQaPair: QAPair = {
        id: Date.now(),
        question: text,
        answer: result.answer,
        audioDataUri: ttsResponse.audioDataUri,
      };
      
      setHistory(prev => [newQaPair, ...prev].slice(0, 5));
      if (ttsResponse.audioDataUri) {
        playAudio(ttsResponse.audioDataUri);
      }

    } catch (error) {
      console.error('Error with GenAI API:', error);
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Could not get a response from the assistant.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedLanguage, toast, playAudio]);

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
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = selectedLanguage;

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      finalTranscriptRef.current = finalTranscript;
      setLiveTranscript(interimTranscript);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (finalTranscriptRef.current) {
        processTranscript(finalTranscriptRef.current);
      }
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      toast({
        variant: "destructive",
        title: "Speech Recognition Error",
        description: (event as any).error === 'not-allowed' ? 'Microphone access was denied.' : `An error occurred: ${(event as any).error}`,
      });
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
        recognitionRef.current?.abort();
    }
  }, [selectedLanguage, toast, processTranscript]);

  const startListening = () => {
    if (recognitionRef.current && !isListening && !isLoading) {
      finalTranscriptRef.current = '';
      setLiveTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <audio ref={audioRef} preload="auto" />
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
          <ChatHistory history={history} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="bg-card p-8 rounded-lg shadow-lg max-w-md">
              <BrainCircuit className="text-primary h-16 w-16 mx-auto mb-4" />
              <h2 className="text-2xl font-bold font-headline mb-2">Welcome to Lumina Spark</h2>
              <p className="text-muted-foreground">Your AI academic assistant. Press the microphone button and start speaking to ask a question.</p>
            </div>
          </div>
        )}
        <div className="absolute bottom-0 w-full flex justify-center p-4 pointer-events-none">
            <MicButton 
              isListening={isListening} 
              isLoading={isLoading} 
              startListening={startListening}
              stopListening={stopListening}
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
    </div>
  );
}
