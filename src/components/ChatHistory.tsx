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
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [history]);
  
  return (
    <ScrollArea viewportRef={viewportRef} className="h-full w-full">
      <div className="p-4 md:p-6 space-y-8">
        {history.map((qa) => (
          <ChatMessage key={qa.id} {...qa} />
        ))}
      </div>
    </ScrollArea>
  );
}
