'use client';

import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { Send, Bot, User, BrainCircuit, Stethoscope, Pill, HelpCircle, Loader2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-provider';
import { useChatHistory, type ChatHistoryMessage } from '@/lib/hooks/use-chat-history';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // For errors

// Define Message interface locally or import if defined elsewhere
export interface Message {
  id: string; // Can be Firestore ID or crypto.randomUUID() for temporary messages
  text: string;
  sender: 'user' | 'bot';
  timestamp: string; // Keep as string for display consistency
  icon?: React.ReactNode; // Optional icon for bot messages
}

// Dummy function to simulate fetching bot response
async function getBotResponse(message: string): Promise<Omit<Message, 'id' | 'timestamp'>> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

    const lowerCaseMessage = message.toLowerCase();
    let responseText = "I'm sorry, I can only provide information about Cerebral Venous Sinus Thrombosis (CVST). Could you please ask a question related to CVST?";
    let icon = <HelpCircle className="w-5 h-5" />; // Default icon

    // Basic keyword matching for CVST-related topics
    if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi') || lowerCaseMessage.includes('good morning')) {
      responseText = "Hello! How can I assist you with CVST today? Ask me about symptoms, diagnosis, treatment, or risk factors.";
      icon = <BrainCircuit className="w-5 h-5" />;
    } else if (lowerCaseMessage.includes('what is cvst') || lowerCaseMessage.includes('explain cvst') || lowerCaseMessage.includes('define cvst')) {
      responseText = "Cerebral Venous Sinus Thrombosis (CVST) is a rare type of stroke where a blood clot forms in the brain’s venous sinuses, blocking blood drainage and increasing brain pressure.";
      icon = <BrainCircuit className="w-5 h-5" />;
    } else if (lowerCaseMessage.includes('symptom') || lowerCaseMessage.includes('feel like') || lowerCaseMessage.includes('signs')) {
      responseText = "Common symptoms of CVST include severe headache (often worsening), vision problems, seizures, nausea, vomiting, and sometimes weakness or speech difficulties. Seek medical help if you suspect these.";
      icon = <Stethoscope className="w-5 h-5" />;
    } else if (lowerCaseMessage.includes('diagnos') || lowerCaseMessage.includes('scan') || lowerCaseMessage.includes('test')) {
      responseText = "CVST is typically diagnosed using brain imaging like MRI with MR venography (MRV) or CT venography (CTV) to visualize the clots. Blood tests might check for underlying conditions.";
      icon = <Stethoscope className="w-5 h-5" />;
    } else if (lowerCaseMessage.includes('treat') || lowerCaseMessage.includes('medic') || lowerCaseMessage.includes('cure') || lowerCaseMessage.includes('help')) {
      responseText = "Treatment usually involves anticoagulant medications (blood thinners) like heparin or warfarin. Sometimes, clot-dissolving drugs (thrombolysis) or surgical clot removal (thrombectomy) are needed.";
      icon = <Pill className="w-5 h-5" />;
    } else if (lowerCaseMessage.includes('cause') || lowerCaseMessage.includes('risk factor') || lowerCaseMessage.includes('get cvst')) {
      responseText = "Risk factors include pregnancy, hormonal contraceptives, dehydration, infections, head trauma, clotting disorders, and certain autoimmune diseases.";
      icon = <HelpCircle className="w-5 h-5" />;
    } else if (lowerCaseMessage.includes('prevent') || lowerCaseMessage.includes('avoid')) {
        responseText = "Prevention focuses on managing risk factors: careful use of hormones, staying hydrated, treating infections promptly, and managing clotting disorders. Discuss specific risks with your doctor.";
        icon = <HelpCircle className="w-5 h-5" />;
    } else if (lowerCaseMessage.includes('long term') || lowerCaseMessage.includes('outlook') || lowerCaseMessage.includes('prognosis')) {
        responseText = "With prompt treatment, many patients recover well from CVST. Some may need long-term anticoagulation. Recovery depends on the severity and speed of treatment.";
        icon = <BrainCircuit className="w-5 h-5" />;
    } else if (lowerCaseMessage.includes('thank') || lowerCaseMessage.includes('thanks')) {
      responseText = "You're welcome! If you have more questions about CVST, feel free to ask. Remember, this is not medical advice; consult a healthcare professional for personal concerns.";
      icon = <BrainCircuit className="w-5 h-5" />;
    }

    return {
      text: responseText,
      sender: 'bot',
      // Icon is determined here but not saved to Firestore in this setup
      icon: icon, // Pass icon along with the response
    };
}

export default function ChatInterface() {
  const { user } = useAuth(); // Get user from Auth context
  const { chatHistory, loading: historyLoading, error: historyError, saveMessage } = useChatHistory();
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]); // Local state for current session + history
  const [inputValue, setInputValue] = useState('');
  const [isBotResponding, setIsBotResponding] = useState(false); // Renamed from isLoading for clarity
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

   // Effect to merge history with current session messages
   useEffect(() => {
    // Combine history (ChatHistoryMessage[]) and potentially new messages (Message[])
    // Ensure no duplicates if saveMessage updates history immediately via snapshot
    const combined = [...chatHistory];
    setCurrentMessages(combined);
   }, [chatHistory]);

  // Scroll to bottom when messages change or bot starts responding
  useEffect(() => {
    if (viewportRef.current) {
        // Use setTimeout to ensure the DOM has updated before scrolling
        setTimeout(() => {
            if (viewportRef.current) {
                 viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
            }
        }, 100); // Increased delay slightly
    }
  }, [currentMessages, isBotResponding]); // Trigger scroll on message changes and when bot typing indicator appears


  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || !user) {
        if (!user) {
            toast({ title: "Login Required", description: "Please log in to chat.", variant: "destructive" });
        }
        return;
    }

    const userMessageData: Omit<Message, 'id' | 'timestamp' | 'icon'> = {
      text: trimmedInput,
      sender: 'user',
    };

     // Add user message optimistically to UI first
      const optimisticUserMessage: Message = {
          ...userMessageData,
          id: crypto.randomUUID(), // Temporary ID
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setCurrentMessages((prev) => [...prev, optimisticUserMessage]);


    setInputValue('');
    setIsBotResponding(true);

    try {
      // Save user message to Firestore
      await saveMessage(userMessageData);
      // Firestore listener will update chatHistory -> currentMessages

      // Get bot response
      const botResponseData = await getBotResponse(trimmedInput);

      // Save bot response to Firestore
      await saveMessage(botResponseData);
       // Firestore listener will update chatHistory -> currentMessages with bot message

    } catch (error) {
        console.error('Error processing message:', error);
        toast({
            title: 'Error',
            description: 'Failed to send or receive message.',
            variant: 'destructive',
        });
        // Add an error message to the chat UI (optional)
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          text: "Sorry, I encountered an error. Please try again.",
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
           icon: <AlertCircle className="w-5 h-5 text-destructive" />
        };
        setCurrentMessages((prev) => [...prev, errorMessage]);
         // Optionally save the error message to history as well
         // await saveMessage({ text: errorMessage.text, sender: 'bot' });
    } finally {
        setIsBotResponding(false);
    }
  };

  // Function to determine the icon based on message content (remains client-side)
  const getCategoryIcon = (text: string): React.ReactNode => {
    const lowerText = text.toLowerCase();
     if (lowerText.includes('symptom') || lowerText.includes('feel like') || lowerText.includes('signs')) return <Stethoscope className="w-5 h-5 text-accent" />;
     if (lowerText.includes('diagnos') || lowerText.includes('scan') || lowerText.includes('test') || lowerText.includes('mri') || lowerText.includes('ctv')) return <Stethoscope className="w-5 h-5 text-accent" />;
     if (lowerText.includes('treat') || lowerText.includes('medic') || lowerText.includes('heparin') || lowerText.includes('warfarin') || lowerText.includes('pill') || lowerText.includes('help') || lowerText.includes('cure')) return <Pill className="w-5 h-5 text-accent" />;
     if (lowerText.includes('what is cvst') || lowerText.includes('explain cvst') || lowerText.includes('define cvst') || lowerText.includes('outlook') || lowerText.includes('prognosis')) return <BrainCircuit className="w-5 h-5 text-accent" />;
     if (lowerText.includes('cause') || lowerText.includes('risk factor') || lowerText.includes('prevent') || lowerText.includes('avoid') || lowerText.includes('get cvst') || lowerText.includes('sorry') || lowerText.includes('only provide information')) return <HelpCircle className="w-5 h-5 text-muted-foreground" />;
     if (lowerText.includes('error')) return <AlertCircle className="w-5 h-5 text-destructive" />;
     // Add a default icon for greetings or unclear messages
     if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('welcome')) return <BrainCircuit className="w-5 h-5 text-accent" />;
     return <HelpCircle className="w-5 h-5 text-muted-foreground" />; // Default fallback
  }


  return (
    <div className="flex flex-col flex-1 h-[calc(100vh-3.5rem)] bg-secondary"> {/* Adjust height considering header */}
       <div className="flex-1 overflow-hidden p-4 md:p-6 lg:p-8 flex flex-col">
          {historyError && (
             <Alert variant="destructive" className="mb-4">
               <AlertCircle className="h-4 w-4" />
               <AlertTitle>Error Loading History</AlertTitle>
               <AlertDescription>{historyError}</AlertDescription>
             </Alert>
           )}
           {historyLoading ? (
               <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
               </div>
           ) : (
              <ScrollArea className="flex-1 w-full mb-4 pr-4" ref={scrollAreaRef}>
                <div className="space-y-4" ref={viewportRef}>
                  {currentMessages.map((message, index) => (
                    <div
                      key={message.id || `msg-${index}`} // Use message ID or index as fallback key
                      className={`flex items-end gap-2 ${
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.sender === 'bot' && (
                        <Avatar className="w-8 h-8 self-end mb-1"> {/* Align avatar nicely */}
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
                             {message.sender === 'bot' && ( // Display icon only for bot
                               <div className="flex-shrink-0 text-accent mt-0.5"> {/* Adjusted margin */}
                                  {getCategoryIcon(message.text)}
                               </div>
                              )}
                            <p className="text-sm break-words">{message.text}</p> {/* Ensure text wraps */}
                          </div>

                          <div className="text-xs mt-2 opacity-70 text-right">
                            {message.timestamp}
                          </div>
                         </CardContent>
                      </Card>
                       {message.sender === 'user' && (
                         <Avatar className="w-8 h-8 self-end mb-1"> {/* Align avatar nicely */}
                             <AvatarFallback className="bg-accent text-accent-foreground">
                                 <User size={18} />
                             </AvatarFallback>
                         </Avatar>
                       )}
                    </div>
                  ))}
                  {isBotResponding && (
                     <div className="flex items-end gap-2 justify-start">
                         <Avatar className="w-8 h-8 self-end mb-1">
                             <AvatarFallback className="bg-primary text-primary-foreground">
                                 <Bot size={18} />
                             </AvatarFallback>
                         </Avatar>
                        <Card className="max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-xl shadow-md bg-card text-card-foreground rounded-bl-none">
                            <CardContent className="p-0 flex items-center space-x-2 h-5"> {/* Fixed height for loader */}
                                <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"></div>
                            </CardContent>
                        </Card>
                     </div>
                  )}
                </div>
              </ScrollArea>
            )}

           <form onSubmit={handleSendMessage} className="flex items-center gap-2 border-t pt-4 bg-secondary">
             <Input
               type="text"
               placeholder={user ? "Ask about CVST..." : "Please log in to chat"}
               value={inputValue}
               onChange={(e) => setInputValue(e.target.value)}
               className="flex-1 bg-background focus-visible:ring-offset-0 focus-visible:ring-accent"
               disabled={isBotResponding || !user || historyLoading} // Disable if loading history or bot responding or not logged in
               aria-label="Chat input"
             />
             <Button type="submit" size="icon" className="bg-accent hover:bg-accent/90" disabled={isBotResponding || !inputValue.trim() || !user || historyLoading} aria-label="Send message">
               {isBotResponding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={18} />}
             </Button>
           </form>
       </div>
    </div>
  );
}
