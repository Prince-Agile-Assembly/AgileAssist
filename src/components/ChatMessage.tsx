import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Sparkles } from 'lucide-react';

interface ChatMessageProps {
  question: string;
  answer: string;
}

export function ChatMessage({ question, answer }: ChatMessageProps) {
  return (
    <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
      <div className="flex items-start gap-4 justify-end">
        <p className="bg-primary text-primary-foreground p-3 rounded-lg max-w-lg shadow-md">
          {question}
        </p>
        <Avatar>
          <AvatarFallback><User /></AvatarFallback>
        </Avatar>
      </div>
      <div className="flex items-start gap-4">
        <Avatar>
          <AvatarFallback className="bg-accent text-accent-foreground"><Sparkles /></AvatarFallback>
        </Avatar>
        <Card className="max-w-lg bg-card text-card-foreground shadow-md">
          <CardContent className="p-4">
            <p>{answer}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
