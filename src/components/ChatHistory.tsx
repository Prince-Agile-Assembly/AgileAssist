"use client";

import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './ChatMessage';
import { useEffect, useRef } from 'react';

interface QAPair {
  id: number;
  question: string;
  answer: string;
}

interface ChatHistoryProps {
  history: QAPair[];
}

export function ChatHistory({ history }: ChatHistoryProps) {
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [history]);
  
  return (
    <ScrollArea className="h-full w-full" viewportRef={scrollViewportRef}>
      <div className="p-4 md:p-6 space-y-8">
        {history.map((qa) => (
          <ChatMessage key={qa.id} question={qa.question} answer={qa.answer} />
        ))}
      </div>
    </ScrollArea>
  );
}
