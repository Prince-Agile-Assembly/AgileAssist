"use client";

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';

interface AudioPlayerProps {
  audioDataUri: string;
}

export function AudioPlayer({ audioDataUri }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <audio 
        ref={audioRef} 
        src={audioDataUri} 
        onEnded={() => setIsPlaying(false)}
        preload="auto"
      />
      <Button variant="ghost" size="icon" onClick={togglePlayPause} aria-label={isPlaying ? "Pause audio" : "Play audio"}>
        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
      </Button>
    </div>
  );
}
