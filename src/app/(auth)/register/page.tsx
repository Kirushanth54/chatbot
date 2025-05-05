'use client';

import { useState, type FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
// Removed Firebase imports

// Optional: Define a key for storing registered users if needed for basic checks
const LOCAL_STORAGE_REGISTERED_USERS_KEY = 'neurochat_registered_users';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }
     if (password.length < 6) {
       toast({
         title: "Error",
         description: "Password must be at least 6 characters long.",
         variant: "destructive",
       });
       return;
     }
    setIsLoading(true);

    // Simulate registration delay
     await new Promise(resolve => setTimeout(resolve, 300));

    // --- Local Storage Registration Logic ---
    // This is a very basic simulation. A real local-only app might store
    // registered emails (and perhaps hashed passwords) in local storage
    // to prevent duplicate registrations or verify logins later.
    try {
        // Optional: Check if email already "exists" in local storage
        // const registeredUsersRaw = localStorage.getItem(LOCAL_STORAGE_REGISTERED_USERS_KEY);
        // const registeredUsers = registeredUsersRaw ? JSON.parse(registeredUsersRaw) : [];
        // if (registeredUsers.includes(email)) {
        //     toast({ title: "Registration Failed", description: "This email is already registered.", variant: "destructive" });
        //     setIsLoading(false);
        //     return;
        // }

        // Optional: Add the new email to the list
        // registeredUsers.push(email);
        // localStorage.setItem(LOCAL_STORAGE_REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));

        // --- End Optional Check ---

        // Since login doesn't verify password, we just need to show success
        toast({
            title: "Registration Successful",
            description: "Your account has been 'created'. You can now log in.", // Wording adjusted
        });
        router.push('/login'); // Redirect to login page

    } catch (error) {
         console.error('Registration simulation error:', error);
         toast({
            title: "Registration Failed",
            description: "An unexpected error occurred during registration simulation.",
            variant: "destructive",
         });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Register</CardTitle>
          <CardDescription>
            Create your NeuroChat account.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password (min. 6 characters)</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                 disabled={isLoading}
                 autoComplete="new-password"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                required
                 value={confirmPassword}
                 onChange={(e) => setConfirmPassword(e.target.value)}
                 disabled={isLoading}
                 autoComplete="new-password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Registering...' : 'Sign up'}
            </Button>
            <div className="text-center text-sm">
               Already have an account?{" "}
               <Link href="/login" className="underline text-primary hover:text-primary/80">
                 Login
               </Link>
             </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
