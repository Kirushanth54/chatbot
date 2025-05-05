'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BrainCircuit, LogOut } from 'lucide-react';
import { useAuth } from '@/context/auth-provider'; // Import useAuth
// Removed Firebase imports: import { auth } from '@/lib/firebase';
// Removed Firebase imports: import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarTrigger } from '@/components/ui/sidebar'; // Import SidebarTrigger

export default function Header() {
  const { user, loading, logout } = useAuth(); // Get user, loading, and logout from context
  const { toast } = useToast();
  const router = useRouter();

  const handleLogout = () => { // No longer async as local storage ops are sync
    try {
      logout(); // Call logout from AuthProvider
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
      router.push('/login'); // Redirect to login after logout
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Logout Failed',
        description: 'An error occurred during logout. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    // Removed sticky and backdrop-blur as it might interfere with flex layout in AppLayout
    <header className="w-full border-b bg-background h-14 flex items-center px-4 shrink-0">
      {/* Sidebar Trigger - Only shown when a user is logged in */}
       {user && !loading && (
            <SidebarTrigger className="mr-2 md:hidden" /> // Show on mobile, hidden on md+
        )}

      <Link href={user ? "/chat" : "/"} className="mr-6 flex items-center space-x-2">
         <BrainCircuit className="h-6 w-6 text-primary" />
        <span className="hidden font-bold sm:inline-block">NeuroChat</span>
      </Link>

      <nav className="flex flex-1 items-center space-x-4">
        {/* Navigation items can go here later */}
      </nav>
      <div className="flex items-center space-x-2">
         {loading ? (
           <>
              {/* Keep loading skeleton */}
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-20" />
           </>
         ) : user ? (
           <>
            <span className="text-sm text-muted-foreground hidden sm:inline-block">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
               <LogOut className="mr-2 h-4 w-4" /> Logout
             </Button>
           </>
         ) : (
           <>
             <Button variant="outline" size="sm" asChild>
                 <Link href="/login">Login</Link>
             </Button>
             <Button size="sm" asChild>
                <Link href="/register">Sign Up</Link>
             </Button>
           </>
         )}
      </div>
    </header>
  );
}
