
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
import { useChatHistory, type ChatHistoryMessage } from '@/lib/hooks/use-chat-history'; // Updated import if path changed
import { Skeleton } from '@/components/ui/skeleton'; // For loading state
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // For errors

// Message interface might already be defined in use-chat-history, ensure consistency
export interface Message extends ChatHistoryMessage {} // Can just extend now

// Dummy function to simulate fetching bot response (remains the same)
async function getBotResponse(message: string): Promise<Omit<Message, 'id' | 'timestamp' | 'icon'>> { // Adjusted Omit type
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

    const lowerCaseMessage = message.toLowerCase();
    let responseText = "I'm sorry, I can only provide information about Cerebral Venous Sinus Thrombosis (CVST). Could you please ask a question related to CVST?";
    let icon = <HelpCircle className="w-5 h-5" />; // Default icon

    // Basic keyword matching for CVST-related topics (same logic as before)
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


    // Return data without id/timestamp as they are added by saveMessage
    return {
      text: responseText,
      sender: 'bot',
      // Icon is determined here but not saved to local storage in this setup
      // It will be re-calculated during rendering based on text
    };
}

export default function ChatInterface() {
  const { user } = useAuth(); // Get user from Auth context
  // Use the hook to get history for the *active* session
  const {
      chatHistory, // This is now the history for the active session
      loading: historyLoading,
      error: historyError,
      saveMessage, // Saves message to the active session
      activeSessionId, // Use this to know which chat is displayed
  } = useChatHistory();

  const [inputValue, setInputValue] = useState('');
  const [isBotResponding, setIsBotResponding] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

   // currentMessages state is no longer needed as chatHistory updates directly
   // const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
   // useEffect(() => {
   //     setCurrentMessages(chatHistory);
   // }, [chatHistory]);

  // Scroll to bottom effect - now depends on chatHistory directly
  useEffect(() => {
    if (viewportRef.current) {
        setTimeout(() => {
            if (viewportRef.current) {
                 viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
            }
        }, 100); // Increased delay slightly to ensure DOM update after history load/change
    }
  }, [chatHistory, isBotResponding]); // Rerun when messages change or bot starts/stops responding


  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || !user || !activeSessionId) { // Check for active session
        if (!user) {
            toast({ title: "Login Required", description: "Please log in to chat.", variant: "destructive" });
        } else if (!activeSessionId) {
             toast({ title: "No Active Chat", description: "Please select or create a chat.", variant: "destructive" });
        }
        return;
    }

    const userMessageData: Omit<Message, 'id' | 'timestamp' | 'icon'> = {
      text: trimmedInput,
      sender: 'user',
    };

    setInputValue('');
    setIsBotResponding(true);

    try {
      // Save user message to the active session's history (updates UI via hook)
      await saveMessage(userMessageData);

      // Get bot response
      const botResponseData = await getBotResponse(trimmedInput);

      // Save bot response to the active session's history (updates UI via hook)
      await saveMessage(botResponseData);

    } catch (error) {
        console.error('Error processing message:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        toast({
            title: 'Error',
            description: `Failed to process message: ${errorMessage}`,
            variant: 'destructive',
        });
        // Optionally save an error message to history
         const errorText = `Sorry, I encountered an error: ${errorMessage}. Please try again.`;
         await saveMessage({ text: errorText, sender: 'bot' });

    } finally {
        setIsBotResponding(false);
    }
  };

  // Function to determine the icon based on message content (remains the same)
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
    <div className="flex flex-col flex-1 bg-secondary overflow-hidden h-screen">
       <div className="flex flex-col flex-1 p-4 md:p-6 lg:p-8 overflow-hidden h-full">
          {historyError && (
             <Alert variant="destructive" className="mb-4 shrink-0">
               <AlertCircle className="h-4 w-4" />
               <AlertTitle>Error</AlertTitle>
               <AlertDescription>{historyError}</AlertDescription>
             </Alert>
           )}
           {/* Show loader specifically when history is loading for the active session */}
           {historyLoading ? (
               <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-3 text-muted-foreground">Loading messages...</p>
               </div>
           ) : (
              <ScrollArea className="flex-1 w-full mb-4 pr-4 h-full" ref={scrollAreaRef}>
                <div className="space-y-4" ref={viewportRef}>
                   {chatHistory.length === 0 && !isBotResponding && (
                        <div className="text-center text-muted-foreground mt-10">
                            <p>Start the conversation!</p>
                            <p className="text-sm">Ask about CVST symptoms, diagnosis, or treatment.</p>
                        </div>
                    )}
                  {/* Render messages from chatHistory (which is now for the active session) */}
                  {chatHistory.map((message) => (
                    <div
                      key={message.id} // Use message ID from local storage
                      className={`flex items-end gap-2 ${
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.sender === 'bot' && (
                        <Avatar className="w-8 h-8 self-end mb-1 shrink-0">
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
                             {message.sender === 'bot' && (
                               <div className="flex-shrink-0 text-accent mt-0.5">
                                  {getCategoryIcon(message.text)}
                               </div>
                              )}
                            <p className="text-sm break-words">{message.text}</p>
                          </div>

                          <div className="text-xs mt-2 opacity-70 text-right">
                            {message.timestamp}
                          </div>
                         </CardContent>
                      </Card>
                       {message.sender === 'user' && (
                         <Avatar className="w-8 h-8 self-end mb-1 shrink-0">
                             <AvatarFallback className="bg-accent text-accent-foreground">
                                 <User size={18} />
                             </AvatarFallback>
                         </Avatar>
                       )}
                    </div>
                  ))}
                  {isBotResponding && (
                     <div className="flex items-end gap-2 justify-start">
                         <Avatar className="w-8 h-8 self-end mb-1 shrink-0">
                             <AvatarFallback className="bg-primary text-primary-foreground">
                                 <Bot size={18} />
                             </AvatarFallback>
                         </Avatar>
                        <Card className="max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-xl shadow-md bg-card text-card-foreground rounded-bl-none">
                            <CardContent className="p-0 flex items-center space-x-2 h-5">
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

           {/* Form section remains largely the same */}
           <form onSubmit={handleSendMessage} className="flex items-center gap-2 border-t pt-4 bg-secondary shrink-0">
             <Input
               type="text"
               placeholder={user ? "Ask about CVST..." : "Please log in to chat"}
               value={inputValue}
               onChange={(e) => setInputValue(e.target.value)}
               className="flex-1 bg-background focus-visible:ring-offset-0 focus-visible:ring-accent"
               disabled={isBotResponding || !user || historyLoading || !activeSessionId} // Disable if no active session
               aria-label="Chat input"
             />
             <Button type="submit" size="icon" className="bg-accent hover:bg-accent/90" disabled={isBotResponding || !inputValue.trim() || !user || historyLoading || !activeSessionId} aria-label="Send message">
               {isBotResponding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={18} />}
             </Button>
           </form>
       </div>
    </div>
  );
}
