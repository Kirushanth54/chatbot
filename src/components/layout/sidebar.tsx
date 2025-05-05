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
import { PlusCircle, MessageSquare, Trash2 } from 'lucide-react'; // Added Trash2 for potential future use
import { useChatHistory } from '@/lib/hooks/use-chat-history';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog'; // Import ConfirmationDialog

export default function AppSidebar() {
  const { clearChatHistory } = useChatHistory();
  const { toast } = useToast();

  const performClearHistory = () => {
    try {
      clearChatHistory();
      toast({
        title: 'Chat Cleared',
        description: 'Your current chat history has been cleared.',
      });
      // Optionally force a refresh or navigate if state update isn't immediate enough
      // window.location.reload(); // Example: simple refresh
    } catch (error) {
      console.error('Failed to clear chat history:', error);
      toast({
        title: 'Error',
        description: 'Could not clear the chat history.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Sidebar collapsible="icon" side="left" variant="sidebar">
      <SidebarHeader className="p-2 hidden group-data-[collapsible=icon]:flex justify-center">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/chat" aria-label="Current Chat">
            <MessageSquare size={20} />
          </Link>
        </Button>
      </SidebarHeader>
      <SidebarHeader className="p-2 flex justify-between items-center group-data-[collapsible=icon]:hidden">
        <span className="font-semibold text-lg text-sidebar-foreground/90">Chat History</span>
        {/* Placeholder */}
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-y-auto p-2">
        <SidebarMenu>
          {/* New Chat Button with Confirmation */}
          <SidebarMenuItem>
             <ConfirmationDialog
               title="Start New Chat?"
               description="This will clear your current chat history. Are you sure?"
               confirmText="Clear History"
               onConfirm={performClearHistory}
               trigger={
                  <SidebarMenuButton
                     tooltip={{ children: 'Start New Chat (Clears History)' }}
                     aria-label="Start New Chat and Clear History"
                     className="w-full justify-start"
                   >
                     <PlusCircle />
                     <span>New Chat</span>
                   </SidebarMenuButton>
               }
             />
          </SidebarMenuItem>

          {/* Current Chat Item (Placeholder for future multi-chat) */}
          {/* In a multi-chat system, you would map over chat sessions here */}
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive // Assume current is always active for now
              tooltip={{ children: 'Current Chat' }}
              aria-label="Current Chat"
              className="w-full justify-start"
            >
              <Link href="/chat">
                <MessageSquare />
                <span>Current Chat</span>
                {/* Potential Delete Button for future multi-chat */}
                {/* <ConfirmationDialog trigger={<Button size="icon" variant="ghost" className="ml-auto h-6 w-6"><Trash2 size={14}/></Button>} ... /> */}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2 group-data-[collapsible=icon]:hidden">
        {/* Footer content expanded */}
      </SidebarFooter>
      <SidebarFooter className="p-2 hidden group-data-[collapsible=icon]:flex justify-center">
        {/* Footer content collapsed */}
      </SidebarFooter>
    </Sidebar>
  );
}
