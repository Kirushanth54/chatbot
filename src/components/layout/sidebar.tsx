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
import { PlusCircle, MessageSquare } from 'lucide-react';
import { useChatHistory } from '@/lib/hooks/use-chat-history';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function AppSidebar() {
  const { clearChatHistory } = useChatHistory(); // Get the clear function
  const { toast } = useToast();

  const handleNewChat = () => {
    try {
      clearChatHistory();
      toast({
        title: 'New Chat Started',
        description: 'Your previous chat history has been cleared.',
      });
      // Optional: You might want to redirect or refresh the chat interface state here
      // depending on how ChatInterface handles the history update.
      // Since useChatHistory updates the state, ChatInterface should re-render.
    } catch (error) {
      console.error('Failed to clear chat history:', error);
      toast({
        title: 'Error',
        description: 'Could not start a new chat.',
        variant: 'destructive',
      });
    }
  };

  return (
    // Sidebar component wraps the entire sidebar structure
    <Sidebar collapsible="icon" side="left" variant="sidebar">
      {/* SidebarHeader can contain branding or profile info */}
      <SidebarHeader className="p-2 hidden group-data-[collapsible=icon]:flex justify-center">
        {/* Icon shown when collapsed */}
        <Button variant="ghost" size="icon" asChild>
           <Link href="/chat" aria-label="Current Chat">
              <MessageSquare size={20} />
           </Link>
        </Button>
      </SidebarHeader>
       <SidebarHeader className="p-2 flex justify-between items-center group-data-[collapsible=icon]:hidden">
          {/* Content shown when expanded */}
          <span className="font-semibold text-lg text-sidebar-foreground/90">Chat History</span>
          {/* Placeholder for future history items count or actions */}
       </SidebarHeader>

      {/* SidebarContent holds the main scrollable navigation */}
      <SidebarContent className="flex-1 overflow-y-auto p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleNewChat}
              tooltip={{ children: 'Start New Chat' }}
              aria-label="Start New Chat"
              className="w-full justify-start"
            >
              <PlusCircle />
              <span>New Chat</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {/*
            Placeholder for listing chat history items.
            For now, only "New Chat" is implemented.
            To list history, you'd map over saved chats (requires complex storage).
          */}
          <SidebarMenuItem>
             <SidebarMenuButton
               asChild // Use asChild to make it a Link
               isActive // Assume the current chat is always active for now
               tooltip={{ children: 'Current Chat' }}
               aria-label="Current Chat"
               className="w-full justify-start"
             >
                <Link href="/chat">
                   <MessageSquare />
                   <span>Current Chat</span>
                </Link>
             </SidebarMenuButton>
           </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      {/* SidebarFooter can contain settings, logout, etc. */}
      <SidebarFooter className="p-2 group-data-[collapsible=icon]:hidden">
        {/* Footer content when expanded */}
        {/* Example: <Button variant="ghost" className="w-full justify-start">Settings</Button> */}
      </SidebarFooter>
       <SidebarFooter className="p-2 hidden group-data-[collapsible=icon]:flex justify-center">
         {/* Footer content when collapsed */}
         {/* Example: <Button variant="ghost" size="icon"> <Settings /> </Button> */}
       </SidebarFooter>
    </Sidebar>
  );
}
