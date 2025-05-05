'use client';

import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { Send, Bot, User, BrainCircuit, Stethoscope, Pill, HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
  icon?: React.ReactNode; // Optional icon for bot messages
}

// Dummy function to simulate fetching bot response
// In a real app, this would call the backend API
async function getBotResponse(message: string): Promise<Message> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const lowerCaseMessage = message.toLowerCase();
    let responseText = "I'm sorry, I can only provide information about Cerebral Venous Sinus Thrombosis (CVST). Could you please ask a question related to CVST?";
    let icon = <HelpCircle className="w-5 h-5" />;

    if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi') || lowerCaseMessage.includes('good morning')) {
      responseText = "Hello! How can I assist you with CVST today?";
      icon = <BrainCircuit className="w-5 h-5" />;
    } else if (lowerCaseMessage.includes('what is cvst') || lowerCaseMessage.includes('explain cvst')) {
      responseText = "Cerebral Venous Sinus Thrombosis (CVST) is a rare type of stroke that occurs when a blood clot forms in the brain’s venous sinuses, preventing blood from draining out of the brain and leading to increased intracranial pressure.";
       icon = <BrainCircuit className="w-5 h-5" />;
    } else if (lowerCaseMessage.includes('symptoms') || lowerCaseMessage.includes('feel like')) {
      responseText = "Common symptoms of CVST include severe headache, vision problems, seizures, nausea, and sometimes altered consciousness.";
      icon = <Stethoscope className="w-5 h-5" />;
    } else if (lowerCaseMessage.includes('diagnosed') || lowerCaseMessage.includes('diagnosis')) {
      responseText = "CVST is typically diagnosed using MRI with venography (MRV) or CT venography (CTV), which can visualize the clots.";
      icon = <Stethoscope className="w-5 h-5" />;
    } else if (lowerCaseMessage.includes('treat') || lowerCaseMessage.includes('medications') || lowerCaseMessage.includes('treatment')) {
      responseText = "Treatment usually involves anticoagulant medications such as heparin or warfarin. In more severe cases, thrombolysis or surgical intervention may be necessary.";
      icon = <Pill className="w-5 h-5" />;
    } else if (lowerCaseMessage.includes('causes') || lowerCaseMessage.includes('risk factors')) {
      responseText = "Risk factors include pregnancy, oral contraceptive use, infections, head trauma, and certain genetic or autoimmune conditions.";
      icon = <HelpCircle className="w-5 h-5" />;
    } else if (lowerCaseMessage.includes('thank') || lowerCaseMessage.includes('thanks')) {
      responseText = "You're welcome! If you have more questions about CVST, feel free to ask.";
      icon = <BrainCircuit className="w-5 h-5" />;
    }


    return {
      id: crypto.randomUUID(),
      text: responseText,
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      icon: icon,
    };
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Scroll to bottom when messages change
  useEffect(() => {
    if (viewportRef.current) {
        // Use setTimeout to ensure the DOM has updated before scrolling
        setTimeout(() => {
            if (viewportRef.current) {
                 viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
            }
        }, 0);
    }
  }, [messages]);


  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: trimmedInput,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
        // Replace with actual API call to backend/Python chatbot
        const botMessage = await getBotResponse(trimmedInput);
        setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
        console.error('Error fetching bot response:', error);
        toast({
            title: 'Error',
            description: 'Failed to get response from the chatbot.',
            variant: 'destructive',
        });
        // Optionally add an error message to the chat
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          text: "Sorry, I encountered an error. Please try again.",
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
           icon: <HelpCircle className="w-5 h-5" />
        };
        setMessages((prev) => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };

  const getCategoryIcon = (text: string): React.ReactNode => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('symptom') || lowerText.includes('feel like')) return <Stethoscope className="w-5 h-5 text-accent" />;
    if (lowerText.includes('diagnos') || lowerText.includes('mri') || lowerText.includes('ctv')) return <Stethoscope className="w-5 h-5 text-accent" />; // Using Stethoscope for diagnosis too
    if (lowerText.includes('treat') || lowerText.includes('medicati') || lowerText.includes('heparin') || lowerText.includes('warfarin')) return <Pill className="w-5 h-5 text-accent" />;
    if (lowerText.includes('what is cvst') || lowerText.includes('explain cvst')) return <BrainCircuit className="w-5 h-5 text-accent" />;
    return <HelpCircle className="w-5 h-5 text-muted-foreground" />; // Default
  }


  return (
    <div className="flex flex-col flex-1 h-full p-4 md:p-6 lg:p-8 bg-secondary">
      <ScrollArea className="flex-1 w-full mb-4 pr-4" ref={scrollAreaRef}>
        <div className="space-y-4" ref={viewportRef}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-end gap-2 ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.sender === 'bot' && (
                <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot size={18} />
                    </AvatarFallback>
                </Avatar>
              )}
              <Card
                className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-xl shadow-md ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-card text-card-foreground rounded-bl-none'
                }`}
              >
                 <CardContent className="p-0">
                  <div className="flex items-start gap-2">
                    {message.sender === 'bot' && message.icon && (
                      <div className="flex-shrink-0 text-accent mt-1">
                         {getCategoryIcon(message.text)}
                      </div>
                     )}
                    <p className="text-sm">{message.text}</p>
                  </div>

                  <div className="text-xs mt-2 opacity-70 text-right">
                    {message.timestamp}
                  </div>
                 </CardContent>
              </Card>
               {message.sender === 'user' && (
                 <Avatar className="w-8 h-8">
                     <AvatarFallback className="bg-accent text-accent-foreground">
                         <User size={18} />
                     </AvatarFallback>
                 </Avatar>
               )}
            </div>
          ))}
          {isLoading && (
             <div className="flex items-end gap-2 justify-start">
                 <Avatar className="w-8 h-8">
                     <AvatarFallback className="bg-primary text-primary-foreground">
                         <Bot size={18} />
                     </AvatarFallback>
                 </Avatar>
                <Card className="max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-xl shadow-md bg-card text-card-foreground rounded-bl-none">
                    <CardContent className="p-0 flex items-center space-x-2">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-75"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-150"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-300"></div>
                    </CardContent>
                </Card>
             </div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSendMessage} className="flex items-center gap-2 border-t pt-4 bg-secondary">
        <Input
          type="text"
          placeholder="Ask about CVST..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-1 bg-background focus-visible:ring-offset-0 focus-visible:ring-accent"
          disabled={isLoading}
          aria-label="Chat input"
        />
        <Button type="submit" size="icon" className="bg-accent hover:bg-accent/90" disabled={isLoading || !inputValue.trim()} aria-label="Send message">
          <Send size={18} />
        </Button>
      </form>
    </div>
  );
}
