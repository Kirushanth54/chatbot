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
    // If not loading and no user is found, redirect to login
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-secondary">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Only render ChatInterface if user is authenticated
  if (user) {
    return (
       // Removed the extra header here as it's now in the main layout
        <ChatInterface />
    );
  }

  // If not loading and no user (should be redirected, but good to have a fallback)
  return null; // Or return a message indicating redirection
}
