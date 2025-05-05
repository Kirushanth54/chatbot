'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';
// Removed Firebase imports: import { onAuthStateChanged, type User } from 'firebase/auth';
// Removed Firebase imports: import { auth } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton'; // Or any loading indicator

// Define a simple user structure for local storage
interface LocalUser {
  email: string;
}

interface AuthContextType {
  user: LocalUser | null;
  loading: boolean;
  login: (email: string) => void; // Add login function
  logout: () => void; // Add logout function
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'neurochat_current_user';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true); // Start loading until local storage is checked

  useEffect(() => {
    // Check local storage for existing user on initial load
    try {
      const storedUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error reading user from local storage:", error);
      // Handle potential JSON parsing errors or storage access issues
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY); // Clear corrupted data
    } finally {
       setLoading(false); // Finished loading attempt
    }

    // Listener for storage changes in other tabs/windows (optional but good practice)
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === LOCAL_STORAGE_USER_KEY) {
            if (event.newValue) {
                try {
                    setUser(JSON.parse(event.newValue));
                } catch (error) {
                     console.error("Error parsing storage change:", error);
                     setUser(null); // Clear user if new data is invalid
                     localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
                }
            } else {
                setUser(null); // User logged out in another tab
            }
        }
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup listener on unmount
    return () => window.removeEventListener('storage', handleStorageChange);

  }, []); // Empty dependency array ensures this runs only once on mount

  const login = useCallback((email: string) => {
    const newUser: LocalUser = { email };
    try {
       localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(newUser));
       setUser(newUser);
    } catch (error) {
        console.error("Error saving user to local storage:", error);
        // Handle potential storage errors (e.g., quota exceeded)
    }
  }, []);

  const logout = useCallback(() => {
    try {
        localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
        setUser(null);
    } catch (error) {
         console.error("Error removing user from local storage:", error);
    }
  }, []);


  const value = { user, loading, login, logout };

  // No need for a loading screen here unless the initial check is visibly slow
  // if (loading) { ... }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
