'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { FirebaseError } from 'firebase/app'; // Import FirebaseError

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
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

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast({
        title: "Registration Successful",
        description: "Your account has been created. You can now log in.",
      });
      router.push('/login'); // Redirect to login page after successful registration
    } catch (error) {
      console.error('Registration error:', error);
       let errorMessage = "An unknown error occurred during registration.";
        if (error instanceof FirebaseError) { // More specific error handling
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = "This email address is already registered.";
                    break;
                case 'auth/invalid-email':
                    errorMessage = "Invalid email format.";
                    break;
                case 'auth/weak-password':
                    errorMessage = "Password is too weak. Please choose a stronger password.";
                    break;
                default:
                    errorMessage = `Registration failed: ${error.message}`;
            }
        }
      toast({
        title: "Registration Failed",
        description: errorMessage,
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
