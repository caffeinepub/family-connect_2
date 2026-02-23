import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { X, Send, MessageCircle, Loader2, GripVertical } from 'lucide-react';
import { useGetMessages, useSendMessage, useGetCallerUserProfile, type Message } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useChatWidget } from '../hooks/useChatWidget';
import { MessageType, ChatType } from '../backend';
import { Principal } from '@dfinity/principal';

export default function ChatWidget() {
  const { identity } = useInternetIdentity();
  const { data: currentUserProfile } = useGetCallerUserProfile();
  const { data: messages, isLoading: messagesLoading } = useGetMessages();
  const sendMessage = useSendMessage();
  const { isOpen, position, open, close, setPosition } = useChatWidget();

  const [messageText, setMessageText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);

  const isAuthenticated = !!identity;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newPosition = Math.max(0, Math.min(window.innerWidth - 384, e.clientX - dragStart));
        setPosition(newPosition);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, setPosition]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragStart(e.clientX - rect.left);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    try {
      await sendMessage.mutateAsync({
        text: messageText.trim(),
        messageType: MessageType.text,
        chatType: ChatType.group,
        recipientId: null,
        groceryItems: null,
        socialMediaUrl: null,
      });
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const sortedMessages = [...(messages || [])].sort((a, b) => Number(a.timestamp) - Number(b.timestamp));

  if (!isAuthenticated) return null;

  if (!isOpen) {
    return (
      <Button
        onClick={open}
        className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg bg-warm-500 hover:bg-warm-600 z-50"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card
      className="fixed bottom-6 w-96 shadow-2xl border-warm-200 z-50"
      style={{ left: `${position}px` }}
    >
      <CardHeader className="pb-3 cursor-move" onMouseDown={handleMouseDown}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-lg">Family Chat</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={close}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <ScrollArea className="h-64 border border-warm-200 rounded-lg p-3 bg-warm-50 dark:bg-warm-950">
          {messagesLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-warm-500" />
            </div>
          ) : sortedMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground text-center">
                No messages yet
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedMessages.map((msg, idx) => {
                const isOwn = msg.author.toString() === identity?.getPrincipal().toString();
                const authorName = isOwn
                  ? 'You'
                  : currentUserProfile?.parents.find((p) => p.principal.toString() === msg.author.toString())?.name ||
                    currentUserProfile?.children.find((c) => c.principal.toString() === msg.author.toString())?.name ||
                    'Unknown';

                return (
                  <div key={idx} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] rounded-lg p-2 ${
                        isOwn
                          ? 'bg-warm-500 text-white'
                          : 'bg-white dark:bg-warm-900 border border-warm-200'
                      }`}
                    >
                      {!isOwn && (
                        <p className="text-xs font-semibold mb-1 text-warm-700 dark:text-warm-300">
                          {authorName}
                        </p>
                      )}
                      <p className="text-sm break-words">{msg.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwn ? 'text-warm-100' : 'text-muted-foreground'
                        }`}
                      >
                        {new Date(Number(msg.timestamp) / 1000000).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="flex-1 border-warm-200"
          />
          <Button type="submit" disabled={sendMessage.isPending} className="bg-warm-500 hover:bg-warm-600">
            {sendMessage.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
