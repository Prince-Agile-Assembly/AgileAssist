import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Sparkles } from 'lucide-react';
import { AudioPlayer } from './AudioPlayer';
import { type Message } from 'ai';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { role, content } = message;
  const isUser = role === 'user';
  const audioDataUri = message.data?.audioDataUri;

  if (isUser) {
    return (
      <div className="flex items-start gap-4 justify-end">
        <p className="bg-primary text-primary-foreground p-3 rounded-lg max-w-lg shadow-md">
          {content}
        </p>
        <Avatar>
          <AvatarFallback><User /></AvatarFallback>
        </Avatar>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
      <div className="flex items-start gap-4">
        <Avatar>
          <AvatarFallback className="bg-accent text-accent-foreground"><Sparkles /></AvatarFallback>
        </Avatar>
        <Card className="max-w-lg bg-card text-card-foreground shadow-md">
          <CardContent className="p-4 pb-2">
            <p>{content}</p>
          </CardContent>
          {audioDataUri && (
            <CardFooter className="p-2 pt-0">
               <AudioPlayer audioDataUri={audioDataUri} />
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
