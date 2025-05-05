'use client';

import { useEffect } from 'react';
import { redirect } from 'next/navigation';
import { useAuth } from '@/context/auth-provider';
import { Loader2 } from 'lucide-react'; // Or your preferred loading spinner

export default function Home() {
  const { user, loading } = useAuth(); // Now uses local storage check

  useEffect(() => {
    if (!loading) {
      if (user) {
        redirect('/chat'); // User found in local storage, go to chat
      } else {
        redirect('/login'); // No user found, go to login
      }
    }
  }, [user, loading]);

  // Display a loading indicator while checking local storage
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Fallback during redirection
   return (
       <div className="flex items-center justify-center h-screen">
           <Loader2 className="h-12 w-12 animate-spin text-primary" />
           <p className="ml-4 text-muted-foreground">Loading...</p>
       </div>
   );
}
