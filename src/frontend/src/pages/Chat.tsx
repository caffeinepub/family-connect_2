import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useGetMessagesWithUser, useSendMessage, useGetCallerUserProfile, type Message } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Principal } from '@dfinity/principal';
import { Loader2, Send, MessageCircle, ShoppingCart, Link as LinkIcon, MessageSquare, X, Plus } from 'lucide-react';
import AIConflictAnalysis from '../components/AIConflictAnalysis';
import { Role, MessageType } from '../backend';
import { toast } from 'sonner';

type MessageTypeOption = 'text' | 'groceryList' | 'socialMediaLink';

export default function Chat() {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [messageText, setMessageText] = useState('');
  const [messageType, setMessageType] = useState<MessageTypeOption>('text');
  
  // Grocery list state
  const [groceryInput, setGroceryInput] = useState('');
  const [groceryItems, setGroceryItems] = useState<string[]>([]);
  
  // Social media link state
  const [socialMediaUrl, setSocialMediaUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  
  const { identity } = useInternetIdentity();
  const { data: messages, isLoading: messagesLoading } = useGetMessagesWithUser();
  const { data: currentUserProfile } = useGetCallerUserProfile();
  const sendMessage = useSendMessage();

  const isParent = currentUserProfile?.role === Role.parent;

  // Get family members from current user profile
  const familyMembers = [
    ...(currentUserProfile?.parents || []),
    ...(currentUserProfile?.children || []),
  ];

  const handleSendTextMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedUser) return;

    await sendMessage.mutateAsync({
      receiver: Principal.fromText(selectedUser),
      text: messageText.trim(),
      messageType: MessageType.text,
    });
    setMessageText('');
  };

  const handleAddGroceryItem = () => {
    if (!groceryInput.trim()) return;
    setGroceryItems([...groceryItems, groceryInput.trim()]);
    setGroceryInput('');
  };

  const handleRemoveGroceryItem = (index: number) => {
    setGroceryItems(groceryItems.filter((_, i) => i !== index));
  };

  const handleSendGroceryList = async () => {
    if (groceryItems.length === 0 || !selectedUser) {
      toast.error('Please add at least one grocery item');
      return;
    }

    try {
      await sendMessage.mutateAsync({
        receiver: Principal.fromText(selectedUser),
        text: 'Grocery List',
        messageType: MessageType.groceryList,
        groceryItems,
      });
      setGroceryItems([]);
      toast.success('Grocery list sent!');
    } catch (error) {
      toast.error('Failed to send grocery list');
    }
  };

  const validateUrl = (url: string): boolean => {
    if (!url) return false;
    const urlPattern = /^https?:\/\/.+/i;
    return urlPattern.test(url);
  };

  const handleSendSocialMediaLink = async () => {
    if (!socialMediaUrl.trim() || !selectedUser) {
      toast.error('Please enter a URL');
      return;
    }

    if (!validateUrl(socialMediaUrl)) {
      setUrlError('Please enter a valid URL starting with http:// or https://');
      return;
    }

    try {
      await sendMessage.mutateAsync({
        receiver: Principal.fromText(selectedUser),
        text: 'Shared a link',
        messageType: MessageType.socialMediaLink,
        socialMediaUrl: socialMediaUrl.trim(),
      });
      setSocialMediaUrl('');
      setUrlError('');
      toast.success('Link sent!');
    } catch (error) {
      toast.error('Failed to send link');
    }
  };

  const filteredMessages = messages?.filter(
    (msg) =>
      (msg.author.toString() === identity?.getPrincipal().toString() &&
        msg.receiver.toString() === selectedUser) ||
      (msg.receiver.toString() === identity?.getPrincipal().toString() &&
        msg.author.toString() === selectedUser)
  ) || [];

  const sortedMessages = [...filteredMessages].sort((a, b) => Number(a.timestamp) - Number(b.timestamp));

  const renderMessage = (msg: Message, isOwn: boolean) => {
    const baseClasses = `max-w-[70%] rounded-lg p-3`;
    const ownClasses = 'bg-warm-500 text-white';
    const otherClasses = 'bg-white dark:bg-warm-900 border border-warm-200';

    // Text message
    if (msg.messageType === MessageType.text) {
      return (
        <div className={`${baseClasses} ${isOwn ? ownClasses : otherClasses}`}>
          <p className="text-sm break-words">{msg.text}</p>
          <p className={`text-xs mt-1 ${isOwn ? 'text-warm-100' : 'text-muted-foreground'}`}>
            {new Date(Number(msg.timestamp) / 1000000).toLocaleTimeString()}
          </p>
        </div>
      );
    }

    // Grocery list message
    if (msg.messageType === MessageType.groceryList && msg.groceryItems) {
      return (
        <div className={`${baseClasses} ${isOwn ? 'bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100 border-green-300' : 'bg-green-50 dark:bg-green-950 border-green-200 text-green-900 dark:text-green-100'}`}>
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="h-4 w-4" />
            <p className="font-semibold text-sm">Grocery List</p>
          </div>
          <ul className="space-y-1 ml-1">
            {msg.groceryItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <span className="mt-1">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className={`text-xs mt-2 ${isOwn ? 'text-green-700 dark:text-green-300' : 'text-muted-foreground'}`}>
            {new Date(Number(msg.timestamp) / 1000000).toLocaleTimeString()}
          </p>
        </div>
      );
    }

    // Social media link message
    if (msg.messageType === MessageType.socialMediaLink && msg.socialMediaUrl) {
      return (
        <div className={`${baseClasses} ${isOwn ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 border-blue-300' : 'bg-blue-50 dark:bg-blue-950 border-blue-200 text-blue-900 dark:text-blue-100'}`}>
          <div className="flex items-center gap-2 mb-2">
            <LinkIcon className="h-4 w-4" />
            <p className="font-semibold text-sm">Shared Link</p>
          </div>
          <a
            href={msg.socialMediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm underline hover:no-underline break-all"
          >
            {msg.socialMediaUrl}
          </a>
          <p className={`text-xs mt-2 ${isOwn ? 'text-blue-700 dark:text-blue-300' : 'text-muted-foreground'}`}>
            {new Date(Number(msg.timestamp) / 1000000).toLocaleTimeString()}
          </p>
        </div>
      );
    }

    return null;
  };

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
                  {familyMembers.map((member) => (
                    <SelectItem key={member.principal.toString()} value={member.principal.toString()}>
                      {member.name}
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
                              {renderMessage(msg, isOwn)}
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

                  {/* Message Type Selector */}
                  <div className="flex gap-2 border-b border-warm-200 pb-3">
                    <Button
                      type="button"
                      variant={messageType === 'text' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMessageType('text')}
                      className="flex items-center gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Text
                    </Button>
                    <Button
                      type="button"
                      variant={messageType === 'groceryList' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMessageType('groceryList')}
                      className="flex items-center gap-2"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Grocery List
                    </Button>
                    <Button
                      type="button"
                      variant={messageType === 'socialMediaLink' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMessageType('socialMediaLink')}
                      className="flex items-center gap-2"
                    >
                      <LinkIcon className="h-4 w-4" />
                      Link
                    </Button>
                  </div>

                  {/* Text Message Input */}
                  {messageType === 'text' && (
                    <form onSubmit={handleSendTextMessage} className="flex gap-2">
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
                  )}

                  {/* Grocery List Composer */}
                  {messageType === 'groceryList' && (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add grocery item..."
                          value={groceryInput}
                          onChange={(e) => setGroceryInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddGroceryItem();
                            }
                          }}
                          className="flex-1 border-warm-200"
                        />
                        <Button
                          type="button"
                          onClick={handleAddGroceryItem}
                          disabled={!groceryInput.trim()}
                          variant="outline"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {groceryItems.length > 0 && (
                        <div className="border border-warm-200 rounded-lg p-3 bg-warm-50 dark:bg-warm-950">
                          <p className="text-sm font-semibold mb-2 text-warm-900 dark:text-warm-100">
                            Items ({groceryItems.length}):
                          </p>
                          <ul className="space-y-2">
                            {groceryItems.map((item, index) => (
                              <li key={index} className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2">
                                  <span className="text-warm-600 dark:text-warm-400">•</span>
                                  {item}
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveGroceryItem(index)}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <Button
                        type="button"
                        onClick={handleSendGroceryList}
                        disabled={groceryItems.length === 0 || sendMessage.isPending}
                        className="w-full"
                      >
                        {sendMessage.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <ShoppingCart className="h-4 w-4 mr-2" />
                        )}
                        Send Grocery List
                      </Button>
                    </div>
                  )}

                  {/* Social Media Link Input */}
                  {messageType === 'socialMediaLink' && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Input
                          placeholder="Enter URL (e.g., https://example.com)"
                          value={socialMediaUrl}
                          onChange={(e) => {
                            setSocialMediaUrl(e.target.value);
                            setUrlError('');
                          }}
                          className={`border-warm-200 ${urlError ? 'border-red-500' : ''}`}
                        />
                        {urlError && (
                          <p className="text-xs text-red-500">{urlError}</p>
                        )}
                      </div>

                      <Button
                        type="button"
                        onClick={handleSendSocialMediaLink}
                        disabled={!socialMediaUrl.trim() || sendMessage.isPending}
                        className="w-full"
                      >
                        {sendMessage.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <LinkIcon className="h-4 w-4 mr-2" />
                        )}
                        Send Link
                      </Button>
                    </div>
                  )}
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
