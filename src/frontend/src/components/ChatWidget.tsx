import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useGetMessages, useSendMessage, useGetCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useChatWidget } from '../hooks/useChatWidget';
import { Principal } from '@dfinity/principal';
import { 
  MessageCircle, 
  Send, 
  X, 
  Minus, 
  ShoppingCart, 
  Link as LinkIcon, 
  MessageSquare, 
  Plus,
  Users,
  GripVertical
} from 'lucide-react';
import { MessageType, ChatType } from '../backend';
import { toast } from 'sonner';
import type { Message } from '../hooks/useQueries';

type MessageTypeOption = 'text' | 'groceryList' | 'socialMediaLink';
type ChatTypeOption = 'group' | 'private';

export default function ChatWidget() {
  const { isOpen, position, setPosition, toggle, close } = useChatWidget();
  const { identity } = useInternetIdentity();
  const { data: currentUserProfile } = useGetCallerUserProfile();

  const [chatType, setChatType] = useState<ChatTypeOption>('group');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [messageText, setMessageText] = useState('');
  const [messageType, setMessageType] = useState<MessageTypeOption>('text');
  const [groceryInput, setGroceryInput] = useState('');
  const [groceryItems, setGroceryItems] = useState<string[]>([]);
  const [socialMediaUrl, setSocialMediaUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartPosition = useRef(0);

  const recipientPrincipal = selectedUser && chatType === 'private' ? Principal.fromText(selectedUser) : undefined;
  const backendChatType = chatType === 'group' ? ChatType.group : ChatType.privateChat;
  const { data: messages } = useGetMessages(backendChatType, recipientPrincipal);
  const sendMessage = useSendMessage();

  const familyMembers = [
    ...(currentUserProfile?.parents || []),
    ...(currentUserProfile?.children || []),
  ];

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartPosition.current = position;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - dragStartX.current;
      const windowWidth = window.innerWidth;
      const deltaPercent = (deltaX / windowWidth) * 100;
      const newPosition = Math.max(0, Math.min(100, dragStartPosition.current + deltaPercent));
      
      setPosition(newPosition);
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
  }, [isDragging, position, setPosition]);

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    
    if (chatType === 'private' && !selectedUser) {
      toast.error('Please select a family member');
      return;
    }

    try {
      await sendMessage.mutateAsync({
        text: messageText.trim(),
        messageType: MessageType.text,
        chatType: backendChatType,
        recipientId: recipientPrincipal,
      });
      setMessageText('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleSendGroceryList = async () => {
    if (groceryItems.length === 0) {
      toast.error('Please add at least one grocery item');
      return;
    }
    
    if (chatType === 'private' && !selectedUser) {
      toast.error('Please select a family member');
      return;
    }

    try {
      await sendMessage.mutateAsync({
        text: 'Grocery List',
        messageType: MessageType.groceryList,
        groceryItems,
        chatType: backendChatType,
        recipientId: recipientPrincipal,
      });
      setGroceryItems([]);
      setMessageType('text');
      toast.success('Grocery list sent!');
    } catch (error) {
      toast.error('Failed to send grocery list');
    }
  };

  const handleSendSocialMediaLink = async () => {
    if (!socialMediaUrl.trim()) {
      toast.error('Please enter a URL');
      return;
    }
    
    if (chatType === 'private' && !selectedUser) {
      toast.error('Please select a family member');
      return;
    }

    try {
      await sendMessage.mutateAsync({
        text: 'Shared a link',
        messageType: MessageType.socialMediaLink,
        socialMediaUrl: socialMediaUrl.trim(),
        chatType: backendChatType,
        recipientId: recipientPrincipal,
      });
      setSocialMediaUrl('');
      setMessageType('text');
      toast.success('Link sent!');
    } catch (error) {
      toast.error('Failed to send link');
    }
  };

  const sortedMessages = [...(messages || [])].sort((a, b) => Number(a.timestamp) - Number(b.timestamp));

  const getAuthorName = (authorPrincipal: Principal): string => {
    if (identity && authorPrincipal.toString() === identity.getPrincipal().toString()) {
      return 'You';
    }
    
    const member = familyMembers.find(m => m.principal.toString() === authorPrincipal.toString());
    return member?.name || authorPrincipal.toString().slice(0, 8) + '...';
  };

  const renderMessage = (msg: Message, isOwn: boolean) => {
    const baseClasses = 'rounded-lg p-2 text-xs';
    const ownClasses = 'bg-warm-500 text-white ml-auto';
    const otherClasses = 'bg-white dark:bg-warm-900 border border-warm-200';

    const authorName = getAuthorName(msg.author);

    if (msg.messageType === MessageType.text) {
      return (
        <div className="flex flex-col gap-1">
          {!isOwn && <span className="text-xs text-muted-foreground">{authorName}</span>}
          <div className={`${baseClasses} ${isOwn ? ownClasses : otherClasses} max-w-[80%]`}>
            <p className="break-words">{msg.text}</p>
          </div>
        </div>
      );
    }

    if (msg.messageType === MessageType.groceryList && msg.groceryItems) {
      return (
        <div className="flex flex-col gap-1">
          {!isOwn && <span className="text-xs text-muted-foreground">{authorName}</span>}
          <div className={`${baseClasses} bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100 max-w-[80%]`}>
            <div className="flex items-center gap-1 mb-1">
              <ShoppingCart className="h-3 w-3" />
              <span className="font-semibold">Grocery List</span>
            </div>
            <ul className="space-y-0.5">
              {msg.groceryItems.slice(0, 3).map((item, idx) => (
                <li key={idx}>• {item}</li>
              ))}
              {msg.groceryItems.length > 3 && <li>+ {msg.groceryItems.length - 3} more</li>}
            </ul>
          </div>
        </div>
      );
    }

    if (msg.messageType === MessageType.socialMediaLink && msg.socialMediaUrl) {
      return (
        <div className="flex flex-col gap-1">
          {!isOwn && <span className="text-xs text-muted-foreground">{authorName}</span>}
          <div className={`${baseClasses} bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 max-w-[80%]`}>
            <div className="flex items-center gap-1 mb-1">
              <LinkIcon className="h-3 w-3" />
              <span className="font-semibold">Link</span>
            </div>
            <a href={msg.socialMediaUrl} target="_blank" rel="noopener noreferrer" className="underline text-xs break-all">
              {msg.socialMediaUrl.substring(0, 40)}...
            </a>
          </div>
        </div>
      );
    }

    return null;
  };

  if (!identity) return null;

  return (
    <div
      className="fixed bottom-0 z-50"
      style={{
        left: `${position}%`,
        transform: 'translateX(-50%)',
        width: '380px',
        maxWidth: '90vw',
      }}
    >
      {!isOpen && (
        <Button
          onClick={toggle}
          className="mb-2 bg-warm-500 hover:bg-warm-600 shadow-lg"
          size="lg"
        >
          <MessageCircle className="h-5 w-5 mr-2" />
          Chat
        </Button>
      )}

      {isOpen && (
        <Card className="shadow-2xl border-warm-200">
          <CardHeader className="pb-3 cursor-move" onMouseDown={handleMouseDown}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                Family Chat
              </CardTitle>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={close}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 space-y-3">
            <Tabs value={chatType} onValueChange={(v) => setChatType(v as ChatTypeOption)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="group">
                  <Users className="h-3 w-3 mr-1" />
                  Group
                </TabsTrigger>
                <TabsTrigger value="private">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Private
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {chatType === 'private' && (
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select family member" />
                </SelectTrigger>
                <SelectContent>
                  {familyMembers.map((member) => (
                    <SelectItem key={member.principal.toString()} value={member.principal.toString()}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <ScrollArea className="h-[250px] border border-warm-200 rounded-md p-2 bg-warm-50 dark:bg-warm-950">
              <div className="space-y-2">
                {sortedMessages.map((msg, idx) => {
                  const isOwn = identity && msg.author.toString() === identity.getPrincipal().toString();
                  return (
                    <div key={idx} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      {renderMessage(msg, isOwn)}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <Tabs value={messageType} onValueChange={(v) => setMessageType(v as MessageTypeOption)}>
              <TabsList className="grid w-full grid-cols-3 h-8">
                <TabsTrigger value="text" className="text-xs">Text</TabsTrigger>
                <TabsTrigger value="groceryList" className="text-xs">Grocery</TabsTrigger>
                <TabsTrigger value="socialMediaLink" className="text-xs">Link</TabsTrigger>
              </TabsList>
            </Tabs>

            {messageType === 'text' && (
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="text-xs h-8"
                />
                <Button onClick={handleSendMessage} size="sm" className="bg-warm-500 hover:bg-warm-600">
                  <Send className="h-3 w-3" />
                </Button>
              </div>
            )}

            {messageType === 'groceryList' && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add item..."
                    value={groceryInput}
                    onChange={(e) => setGroceryInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && groceryInput.trim()) {
                        setGroceryItems([...groceryItems, groceryInput.trim()]);
                        setGroceryInput('');
                      }
                    }}
                    className="text-xs h-8"
                  />
                  <Button
                    onClick={() => {
                      if (groceryInput.trim()) {
                        setGroceryItems([...groceryItems, groceryInput.trim()]);
                        setGroceryInput('');
                      }
                    }}
                    size="sm"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                {groceryItems.length > 0 && (
                  <div className="text-xs space-y-1">
                    {groceryItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span>• {item}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setGroceryItems(groceryItems.filter((_, i) => i !== idx))}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <Button onClick={handleSendGroceryList} size="sm" className="w-full bg-warm-500 hover:bg-warm-600">
                  <Send className="h-3 w-3 mr-1" />
                  Send List
                </Button>
              </div>
            )}

            {messageType === 'socialMediaLink' && (
              <div className="space-y-2">
                <Input
                  placeholder="Enter URL..."
                  value={socialMediaUrl}
                  onChange={(e) => setSocialMediaUrl(e.target.value)}
                  className="text-xs h-8"
                />
                <Button onClick={handleSendSocialMediaLink} size="sm" className="w-full bg-warm-500 hover:bg-warm-600">
                  <Send className="h-3 w-3 mr-1" />
                  Send Link
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
