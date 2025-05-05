'use client';

import { useState, useEffect, useCallback } from 'react';
// Removed Firestore imports
import { useAuth } from '@/context/auth-provider';
import type { Message } from '@/components/chat/chat-interface'; // Adjust path as needed

// Define the structure of the message returned from the hook (no firestoreId needed)
export interface ChatHistoryMessage extends Message {}

// Helper function to get the local storage key for a user's chat
const getChatHistoryKey = (userId: string | null): string | null => {
    return userId ? `neurochat_history_${userId}` : null;
};

export function useChatHistory() {
  const { user } = useAuth();
  const [chatHistory, setChatHistory] = useState<ChatHistoryMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Still useful for initial load
  const [error, setError] = useState<string | null>(null);

  // Function to load history from local storage
  const loadHistory = useCallback(() => {
    setLoading(true);
    setError(null);
    const storageKey = getChatHistoryKey(user?.email || null); // Use email as identifier

    if (!storageKey) {
      setChatHistory([]);
      setLoading(false);
      return;
    }

    try {
      const storedHistory = localStorage.getItem(storageKey);
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory);
        // Basic validation if needed (e.g., check if it's an array)
        if (Array.isArray(parsedHistory)) {
           // Add validation for message structure if necessary
           const validHistory = parsedHistory.filter(msg =>
             msg && typeof msg.id === 'string' && typeof msg.text === 'string' && typeof msg.sender === 'string' && typeof msg.timestamp === 'string'
           );
           if (validHistory.length !== parsedHistory.length) {
               console.warn("Some invalid messages filtered from chat history.");
           }
           setChatHistory(validHistory);
        } else {
            console.warn("Invalid chat history format found in local storage.");
            localStorage.removeItem(storageKey); // Clear invalid data
            setChatHistory([]);
        }

      } else {
        setChatHistory([]); // No history found
      }
    } catch (err) {
      console.error('Error reading chat history from local storage:', err);
      setError('Failed to load chat history.');
       // Optionally clear potentially corrupted data
      try { localStorage.removeItem(storageKey); } catch {}
       setChatHistory([]);
    } finally {
      setLoading(false);
    }
  }, [user]); // Reload when user changes

  // Load history on initial mount and when user changes
  useEffect(() => {
    loadHistory();
  }, [loadHistory]); // Dependency array includes the memoized loadHistory

   // Listen for storage changes to update history if modified in another tab
   useEffect(() => {
       const handleStorageChange = (event: StorageEvent) => {
           const storageKey = getChatHistoryKey(user?.email || null);
           // Reload if the key matches OR if the key becomes null (user logged out)
           if (event.key === storageKey || (event.key === null && !localStorage.getItem(storageKey!))) {
                loadHistory(); // Reload history if the relevant key changed or was removed
           }
       };

       window.addEventListener('storage', handleStorageChange);
       return () => window.removeEventListener('storage', handleStorageChange);
   }, [user, loadHistory]); // Re-attach listener if user or loadHistory changes


  // Save a new message to local storage
  const saveMessage = useCallback(
    async (message: Omit<Message, 'id' | 'timestamp' | 'icon'>): Promise<void> => {
      const storageKey = getChatHistoryKey(user?.email || null);
      if (!storageKey) {
        setError('You must be logged in to save messages.');
        return;
      }
      setError(null); // Clear previous errors

      // Create the full message object for storage
      const newMessage: ChatHistoryMessage = {
          ...message,
          id: crypto.randomUUID(), // Generate unique ID for local message
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          // icon is handled dynamically in the UI, not stored
      };

       // Validate the new message structure before saving (optional but recommended)
       if (!newMessage.id || !newMessage.text || !newMessage.sender || !newMessage.timestamp) {
           console.error("Attempted to save an invalid message:", newMessage);
           setError("Failed to save message due to invalid format.");
           return;
       }


      try {
          // Read current history
          const storedHistoryRaw = localStorage.getItem(storageKey);
          let currentHistory: ChatHistoryMessage[] = [];
          if (storedHistoryRaw) {
              try {
                  const parsed = JSON.parse(storedHistoryRaw);
                   if (Array.isArray(parsed)) {
                       // Further validation can be added here to ensure each item in parsed is a valid ChatHistoryMessage
                       currentHistory = parsed.filter(msg => msg && typeof msg.id === 'string'); // Basic check
                   } else {
                        console.warn("Overwriting invalid chat history format in local storage during save.");
                   }
              } catch (parseError) {
                  console.error("Error parsing existing history during save, overwriting:", parseError);
              }
          }

          // Add new message
          const updatedHistory = [...currentHistory, newMessage];

          // Save updated history
          localStorage.setItem(storageKey, JSON.stringify(updatedHistory));

          // Update local state immediately
          setChatHistory(updatedHistory);

      } catch (err) {
        console.error('Error saving message to local storage:', err);
        setError('Failed to save message.');
        // Handle potential storage quota errors
        if (err instanceof DOMException && err.name === 'QuotaExceededError') {
            setError('Chat history storage limit reached. Cannot save new messages.');
            // Consider notifying the user more prominently
        }
      }
    },
    [user] // Dependency: only re-create function if user changes
  );

   // Function to clear chat history from local storage
   const clearChatHistory = useCallback(() => {
       const storageKey = getChatHistoryKey(user?.email || null);
       if (!storageKey) {
           setError('You must be logged in to clear chat history.');
           throw new Error('User not logged in'); // Throw error to indicate failure
       }
       setError(null); // Clear previous errors

       try {
           localStorage.removeItem(storageKey);
           setChatHistory([]); // Clear the state immediately
           console.log('Chat history cleared for user:', user?.email);
       } catch (err) {
           console.error('Error clearing chat history from local storage:', err);
           setError('Failed to clear chat history.');
           throw err; // Re-throw error to indicate failure
       }
   }, [user]);


  return { chatHistory, loading, error, saveMessage, clearChatHistory }; // Expose clearChatHistory
}
