'use client';

import { useState, type FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-provider'; // Import useAuth

// Removed Firebase imports

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Password check is now dummy
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { login } = useAuth(); // Get login function from context

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login delay (optional)
    await new Promise(resolve => setTimeout(resolve, 300));

    // Basic validation (can be expanded)
    if (!email || !password) {
       toast({
         title: "Login Failed",
         description: "Please enter both email and password.",
         variant: "destructive",
       });
       setIsLoading(false);
       return;
    }

    // --- Local Storage Login Logic ---
    // In a real local-storage-only scenario without a backend,
    // you might just check if the email "exists" in some local user list
    // or simply proceed if the format is valid.
    // For this example, we'll just assume any valid email format logs in.
    // A more robust local setup might involve checking against data stored during registration.

    try {
      // Call the login function from AuthProvider
      login(email);

      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      router.push('/chat'); // Redirect to chat page (now in app group)
    } catch (error) {
       // Catch potential errors from the login function (e.g., storage issues)
       console.error('Login error:', error);
       toast({
         title: "Login Failed",
         description: "An unexpected error occurred during login.",
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
                // Note: Password is not actually verified against anything in this local example
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
