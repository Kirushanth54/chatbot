'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { FirebaseError } from 'firebase/app'; // Import FirebaseError

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      router.push('/chat'); // Redirect to chat page on successful login
    } catch (error) {
       console.error('Login error:', error);
       let errorMessage = "An unknown error occurred during login.";
        if (error instanceof FirebaseError) { // More specific error handling
            switch (error.code) {
              case 'auth/invalid-email':
                errorMessage = "Invalid email format.";
                break;
              case 'auth/user-not-found':
              case 'auth/wrong-password':
              case 'auth/invalid-credential': // Catch common invalid credential error
                 errorMessage = "Invalid email or password.";
                 break;
              default:
                 errorMessage = `Login failed: ${error.message}`;
            }
        }
       toast({
         title: "Login Failed",
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
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Sign in'}
            </Button>
             <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="underline text-primary hover:text-primary/80">
                  Sign up
                </Link>
              </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
