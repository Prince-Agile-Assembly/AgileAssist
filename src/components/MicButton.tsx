"use client";

import { Button } from "@/components/ui/button";
import { Mic, MicOff, LoaderCircle } from "lucide-react";

interface MicButtonProps {
  isListening: boolean;
  isLoading: boolean;
  onMicClick: () => void;
  disabled?: boolean;
}

export function MicButton({ isListening, isLoading, onMicClick, disabled }: MicButtonProps) {
  const effectiveDisabled = disabled || isLoading;

  return (
    <Button
      size="icon"
      className={`rounded-full w-20 h-20 shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 pointer-events-auto
        ${isListening ? 'bg-destructive hover:bg-destructive/90 scale-110 animate-pulse' : 'bg-primary hover:bg-primary/90'}
        ${effectiveDisabled && !isListening ? 'bg-muted-foreground cursor-not-allowed' : ''}
      `}
      onClick={onMicClick}
      disabled={effectiveDisabled && !isListening}
      aria-label={isListening ? 'Stop listening' : isLoading ? 'Loading response' : 'Start listening'}
    >
      {isLoading ? (
        <LoaderCircle className="animate-spin h-8 w-8" />
      ) : isListening ? (
        <MicOff className="h-8 w-8" />
      ) : (
        <Mic className="h-8 w-8" />
      )}
    </Button>
  );
}
