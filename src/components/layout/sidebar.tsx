
'use client';

import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { PlusCircle, MessageSquare, Trash2, Loader2 } from 'lucide-react'; // Added Trash2 and Loader2
import { useChatHistory, type ChatSession } from '@/lib/hooks/use-chat-history'; // Import ChatSession type
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link'; // Keep Link for header icon
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import { ScrollArea } from '@/components/ui/scroll-area'; // For long list of chats
import { Skeleton } from '@/components/ui/skeleton'; // For loading state
import { cn } from '@/lib/utils'; // Import cn for conditional classes

export default function AppSidebar() {
  const {
      sessions,
      activeSessionId,
      setActiveSessionId,
      createNewSession,
      deleteSession,
      loading: historyLoading // Use loading state from hook
  } = useChatHistory();
  const { toast } = useToast();

  const handleCreateNewChat = () => {
    try {
      const newId = createNewSession();
      if (newId) {
        toast({
          title: 'New Chat Started',
        });
        // Navigation/UI update is handled by activeSessionId change
      } else {
         toast({
            title: 'Error',
            description: 'Could not start a new chat.',
            variant: 'destructive',
         });
      }
    } catch (error) {
      console.error('Failed to create new chat session:', error);
      toast({
        title: 'Error',
        description: 'Could not start a new chat.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteChat = (sessionId: string, sessionTitle: string) => {
      try {
          deleteSession(sessionId);
          toast({
             title: 'Chat Deleted',
             description: `"${sessionTitle}" has been deleted.`,
          });
          // UI update is handled by sessions state change
      } catch (error) {
          console.error('Failed to delete chat session:', error);
          toast({
              title: 'Error',
              description: `Could not delete chat "${sessionTitle}".`,
              variant: 'destructive',
          });
      }
  };

  return (
    <Sidebar collapsible="icon" side="left" variant="sidebar">
      <SidebarHeader className="p-2 hidden group-data-[collapsible=icon]:flex justify-center">
        <Button variant="ghost" size="icon" asChild>
          {/* Link might not be needed if switching is handled by buttons */}
          <Link href="#" aria-label="Current Chat" onClick={(e) => { e.preventDefault(); if (activeSessionId) setActiveSessionId(activeSessionId);}}>
            <MessageSquare size={20} />
          </Link>
        </Button>
      </SidebarHeader>
      <SidebarHeader className="p-2 flex justify-between items-center group-data-[collapsible=icon]:hidden">
        <span className="font-semibold text-lg text-sidebar-foreground/90">Chat History</span>
        {/* New Chat Button - Top Right (only when expanded) */}
         <ConfirmationDialog
           title="Start New Chat?"
           description="This will create a new empty chat session." // Updated description
           confirmText="Create New Chat"
           onConfirm={handleCreateNewChat}
           trigger={
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent h-7 w-7"
                    aria-label="Start New Chat"
                >
                    <PlusCircle size={18} />
                </Button>
           }
         />
      </SidebarHeader>

       {/* Scrollable Content Area */}
       <SidebarContent className="flex-1 p-0"> {/* Remove default padding */}
          <ScrollArea className="h-full p-2"> {/* Add padding inside ScrollArea */}
            <SidebarMenu>
                {historyLoading && sessions.length === 0 ? (
                    // Show skeletons while loading initial sessions
                    <>
                        <SidebarMenuItem><Skeleton className="h-8 w-full" /></SidebarMenuItem>
                        <SidebarMenuItem><Skeleton className="h-8 w-full" /></SidebarMenuItem>
                        <SidebarMenuItem><Skeleton className="h-8 w-full" /></SidebarMenuItem>
                    </>
                ) : sessions.length === 0 && !historyLoading ? (
                     <SidebarMenuItem>
                         <p className="text-xs text-sidebar-foreground/60 px-2 text-center group-data-[collapsible=icon]:hidden">
                            No chats yet. Click '+' to start.
                         </p>
                          <SidebarMenuButton
                             onClick={handleCreateNewChat}
                             tooltip={{ children: 'Start New Chat' }}
                             aria-label="Start New Chat"
                             className="w-full justify-center group-data-[collapsible=icon]:justify-center hidden group-data-[collapsible=icon]:flex"
                           >
                             <PlusCircle />
                             <span className="sr-only">New Chat</span>
                           </SidebarMenuButton>
                     </SidebarMenuItem>
                 ) : (
                    // Map over existing chat sessions
                    sessions.map((session) => (
                        <SidebarMenuItem key={session.id} className="flex items-center gap-1"> {/* Use flex container */}
                            <SidebarMenuButton
                                isActive={session.id === activeSessionId}
                                tooltip={{ children: session.title }}
                                aria-label={`Chat: ${session.title}`}
                                className="flex-1 justify-start group-data-[collapsible=icon]:justify-center overflow-hidden" // Allow button to take available space
                                onClick={() => setActiveSessionId(session.id)}
                            >
                                <MessageSquare />
                                <span>{session.title}</span>
                                {/* Delete button moved outside */}
                            </SidebarMenuButton>

                            {/* Delete Button - placed next to the menu button */}
                            <ConfirmationDialog
                                title="Delete Chat?"
                                description={`Are you sure you want to delete the chat "${session.title}"? This cannot be undone.`}
                                confirmText="Delete"
                                onConfirm={() => handleDeleteChat(session.id, session.title)}
                                trigger={
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className={cn(
                                            "h-6 w-6 text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 shrink-0", // Added shrink-0
                                            "group-data-[collapsible=icon]:hidden" // Hide when collapsed
                                        )}
                                        onClick={(e) => e.stopPropagation()} // Prevent triggering session switch
                                        aria-label={`Delete chat ${session.title}`}
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                }
                            />
                        </SidebarMenuItem>
                    ))
                )}
            </SidebarMenu>
         </ScrollArea>
      </SidebarContent>


      <SidebarFooter className="p-2 group-data-[collapsible=icon]:hidden">
        {/* Footer content expanded */}
      </SidebarFooter>
      <SidebarFooter className="p-2 hidden group-data-[collapsible=icon]:flex justify-center">
        {/* Footer content collapsed */}
        {/* Maybe add a New Chat icon button here as well for collapsed view */}
         <ConfirmationDialog
           title="Start New Chat?"
           description="This will create a new empty chat session."
           confirmText="Create New Chat"
           onConfirm={handleCreateNewChat}
           trigger={
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                    aria-label="Start New Chat"
                >
                    <PlusCircle size={20} />
                </Button>
           }
         />
      </SidebarFooter>
    </Sidebar>
  );
}
