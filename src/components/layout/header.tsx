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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
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
      </div>
    </header>
  );
}
