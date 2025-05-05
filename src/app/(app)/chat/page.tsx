'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatInterface from '@/components/chat/chat-interface';
import { useAuth } from '@/context/auth-provider';
import { Loader2 } from 'lucide-react'; // Loading indicator

export default function ChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and no user is found (from local storage), redirect to login
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Show loading state while checking local storage
  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-secondary">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Only render ChatInterface if user exists in local storage state
  if (user) {
    return (
        <ChatInterface /> // Chat interface takes up the remaining space
    );
  }

  // Fallback while redirecting (should be brief)
  return null; // Or return a message indicating redirection
}
