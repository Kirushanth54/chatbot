
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatInterface from '@/components/chat/chat-interface';
import { useAuth } from '@/context/auth-provider';
import { useChatHistory } from '@/lib/hooks/use-chat-history'; // Import useChatHistory
import { Loader2 } from 'lucide-react'; // Loading indicator

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth();
  const { activeSessionId, loading: historyLoading, createNewSession, sessions } = useChatHistory(); // Get active session ID and loading state
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Redirect or create session if authenticated but no active session
  useEffect(() => {
      if (!authLoading && user && !historyLoading && !activeSessionId && sessions.length === 0) {
          // If logged in, history not loading, no active session, and no sessions exist, create one
          console.log("No active session found and no sessions exist, creating a new one...");
          createNewSession();
      } else if (!authLoading && user && !historyLoading && !activeSessionId && sessions.length > 0) {
           // If logged in, history not loading, no active session, but sessions exist, set first as active (handled by hook)
           console.log("No active session found, but sessions exist. Hook should handle setting active.");
      }
  }, [user, authLoading, historyLoading, activeSessionId, sessions, createNewSession]);

  // Show loading state while checking auth or loading initial history/session
  if (authLoading || (user && historyLoading && !activeSessionId)) { // More specific loading condition
    return (
      <div className="flex flex-1 items-center justify-center bg-secondary">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading chat...</p>
      </div>
    );
  }

  // Render ChatInterface only if user is logged in and an active session exists
  if (user && activeSessionId) {
    // Pass the activeSessionId to ChatInterface if it needs it (it gets it from the hook now)
    // Or simply rely on the hook's context within ChatInterface
    return (
        <ChatInterface key={activeSessionId} /> // Use key to force re-render on session change
    );
  }

   // Fallback while redirecting or creating session
    return (
       <div className="flex flex-1 items-center justify-center bg-secondary">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-muted-foreground">Initializing chat...</p>
       </div>
    );
}
