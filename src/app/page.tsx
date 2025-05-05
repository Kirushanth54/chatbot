'use client';

import { useEffect } from 'react';
import { redirect } from 'next/navigation';
import { useAuth } from '@/context/auth-provider';
import { Loader2 } from 'lucide-react'; // Or your preferred loading spinner

export default function Home() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        redirect('/chat');
      } else {
        redirect('/login');
      }
    }
  }, [user, loading]);

  // Display a loading indicator while checking auth status
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // This part should ideally not be reached due to redirects,
  // but it's good practice to have a fallback or handle the brief moment before redirection.
   return (
       <div className="flex items-center justify-center h-screen">
           <Loader2 className="h-12 w-12 animate-spin text-primary" />
           <p className="ml-4 text-muted-foreground">Loading...</p>
       </div>
   ); // Or return null if you prefer a blank screen during the very short transition
}
