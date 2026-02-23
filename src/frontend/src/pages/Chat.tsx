import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useGetMessagesWithUser, useSendMessage, useGetAllProfiles, useGetCallerUserProfile, type Message } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Principal } from '@dfinity/principal';
import { Loader2, Send, MessageCircle } from 'lucide-react';
import AIConflictAnalysis from '../components/AIConflictAnalysis';
import { Role } from '../backend';

export default function Chat() {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [messageText, setMessageText] = useState('');
  const { identity } = useInternetIdentity();
  const { data: messages, isLoading: messagesLoading } = useGetMessagesWithUser();
  const { data: profiles } = useGetAllProfiles();
  const { data: currentUserProfile } = useGetCallerUserProfile();
  const sendMessage = useSendMessage();

  const isParent = currentUserProfile?.role === Role.parent;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedUser) return;

    await sendMessage.mutateAsync({
      receiver: Principal.fromText(selectedUser),
      text: messageText.trim(),
    });
    setMessageText('');
  };

  const filteredMessages = messages?.filter(
    (msg) =>
      (msg.author.toString() === identity?.getPrincipal().toString() &&
        msg.receiver.toString() === selectedUser) ||
      (msg.receiver.toString() === identity?.getPrincipal().toString() &&
        msg.author.toString() === selectedUser)
  ) || [];

  const sortedMessages = [...filteredMessages].sort((a, b) => Number(a.timestamp) - Number(b.timestamp));

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="border-warm-200 shadow-md">
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">Please log in to access chat</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-warm-900 dark:text-warm-100 mb-2">Family Chat</h1>
        <p className="text-muted-foreground">Stay connected with your family members</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-warm-200 shadow-md">
            <CardHeader>
              <CardTitle className="text-warm-900 dark:text-warm-100 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-warm-500" />
                Messages
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="border-warm-200">
                  <SelectValue placeholder="Select a family member" />
                </SelectTrigger>
                <SelectContent>
                  {profiles?.map((profile) => (
                    <SelectItem key={profile.displayName} value={profile.displayName}>
                      {profile.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedUser && (
                <>
                  <ScrollArea className="h-[400px] border border-warm-200 rounded-lg p-4 bg-warm-50 dark:bg-warm-950">
                    {messagesLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-warm-500" />
                      </div>
                    ) : sortedMessages.length > 0 ? (
                      <div className="space-y-4">
                        {sortedMessages.map((msg, index) => {
                          const isOwn = msg.author.toString() === identity.getPrincipal().toString();
                          return (
                            <div
                              key={index}
                              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[70%] rounded-lg p-3 ${
                                  isOwn
                                    ? 'bg-warm-500 text-white'
                                    : 'bg-white dark:bg-warm-900 border border-warm-200'
                                }`}
                              >
                                <p className="text-sm break-words">{msg.text}</p>
                                <p className={`text-xs mt-1 ${isOwn ? 'text-warm-100' : 'text-muted-foreground'}`}>
                                  {new Date(Number(msg.timestamp) / 1000000).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">
                        No messages yet. Start the conversation!
                      </p>
                    )}
                  </ScrollArea>

                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="flex-1 border-warm-200"
                    />
                    <Button type="submit" disabled={!messageText.trim() || sendMessage.isPending}>
                      {sendMessage.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {isParent && (
          <div className="lg:col-span-1">
            <AIConflictAnalysis />
          </div>
        )}
      </div>
    </div>
  );
}
