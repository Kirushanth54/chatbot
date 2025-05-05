
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth-provider';
import type { Message } from '@/components/chat/chat-interface'; // Adjust path as needed

// Define the structure of the message returned from the hook
export interface ChatHistoryMessage extends Message {}

// Define the structure for a chat session
export interface ChatSession {
    id: string;
    title: string; // Could be the first user message or a timestamp
    timestamp: number; // Unix timestamp for sorting
}

// Helper functions for local storage keys
const getSessionsKey = (userId: string | null): string | null => {
    return userId ? `neurochat_sessions_${userId}` : null;
};

const getHistoryKey = (userId: string | null, sessionId: string): string | null => {
    return userId ? `neurochat_history_${userId}_${sessionId}` : null;
};

const getActiveSessionKey = (userId: string | null): string | null => {
    return userId ? `neurochat_active_session_${userId}` : null;
};


export function useChatHistory() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionIdState] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatHistoryMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.email || null; // Use email as user identifier

  // --- Session Management ---

  // Load sessions list from local storage
  const loadSessions = useCallback(() => {
    if (!userId) {
        setSessions([]);
        return;
    }
    const sessionsKey = getSessionsKey(userId);
    try {
        const storedSessions = localStorage.getItem(sessionsKey!);
        if (storedSessions) {
            const parsedSessions: ChatSession[] = JSON.parse(storedSessions);
             // Validate and sort sessions
            if (Array.isArray(parsedSessions)) {
                const validSessions = parsedSessions.filter(s => s && s.id && s.title && s.timestamp);
                validSessions.sort((a, b) => b.timestamp - a.timestamp); // Newest first
                setSessions(validSessions);
            } else {
                 console.warn("Invalid sessions format in local storage.");
                 localStorage.removeItem(sessionsKey!);
                 setSessions([]);
            }
        } else {
            setSessions([]); // No sessions found
        }
    } catch (err) {
        console.error('Error loading sessions from local storage:', err);
        setError('Failed to load chat sessions.');
        setSessions([]);
         try { localStorage.removeItem(sessionsKey!); } catch {}
    }
  }, [userId]);

  // Save sessions list to local storage
  const saveSessions = useCallback((updatedSessions: ChatSession[]) => {
     if (!userId) return;
     const sessionsKey = getSessionsKey(userId);
     try {
       updatedSessions.sort((a, b) => b.timestamp - a.timestamp); // Ensure sorted before saving
       localStorage.setItem(sessionsKey!, JSON.stringify(updatedSessions));
       setSessions(updatedSessions);
     } catch (err) {
       console.error('Error saving sessions to local storage:', err);
       setError('Failed to save chat sessions.');
     }
  }, [userId]);

  // Set the active session ID and save it
  const setActiveSessionId = useCallback((sessionId: string | null) => {
      if (!userId) return;
      const activeSessionKey = getActiveSessionKey(userId);
      try {
          if (sessionId) {
              localStorage.setItem(activeSessionKey!, sessionId);
          } else {
              localStorage.removeItem(activeSessionKey!);
          }
          setActiveSessionIdState(sessionId);
      } catch (err) {
           console.error('Error setting active session in local storage:', err);
           setError('Failed to set active session.');
      }
  }, [userId]);

  // Create a new chat session
  const createNewSession = useCallback((): string | null => {
     if (!userId) {
         setError("Cannot create session: User not logged in.");
         return null;
     }
     const newSessionId = crypto.randomUUID();
     const newSession: ChatSession = {
         id: newSessionId,
         title: `Chat ${new Date().toLocaleString()}`, // Placeholder title
         timestamp: Date.now(),
     };

     const updatedSessions = [newSession, ...sessions];
     saveSessions(updatedSessions);
     setActiveSessionId(newSessionId); // Switch to the new session
     setChatHistory([]); // Clear history for the new session view
     setError(null); // Clear previous errors
     console.log("Created new session:", newSessionId);
     return newSessionId;
  }, [userId, sessions, saveSessions, setActiveSessionId]);

    // Delete a chat session
    const deleteSession = useCallback((sessionIdToDelete: string) => {
        if (!userId) {
            setError("Cannot delete session: User not logged in.");
            return;
        }
        setError(null);

        // Remove session from list
        const updatedSessions = sessions.filter(session => session.id !== sessionIdToDelete);
        saveSessions(updatedSessions);

        // Delete history for that session
        const historyKey = getHistoryKey(userId, sessionIdToDelete);
        try {
            if (historyKey) localStorage.removeItem(historyKey);
            console.log("Deleted history for session:", sessionIdToDelete);
        } catch (err) {
            console.error(`Error deleting history for session ${sessionIdToDelete}:`, err);
            // Don't set general error, maybe log specific issue
        }

        // If the deleted session was active, switch to another one or create new
        if (activeSessionId === sessionIdToDelete) {
            const nextSessionId = updatedSessions.length > 0 ? updatedSessions[0].id : createNewSession();
            setActiveSessionId(nextSessionId);
            // Loading history for the new active session will be handled by the effect below
        }

    }, [userId, sessions, activeSessionId, saveSessions, setActiveSessionId, createNewSession]);


    // --- Chat History Management (Per Session) ---

    // Load history for the active session
    const loadChatHistory = useCallback((sessionId: string | null) => {
        setLoading(true);
        setError(null);

        if (!userId || !sessionId) {
            setChatHistory([]);
            setLoading(false);
            return;
        }

        const historyKey = getHistoryKey(userId, sessionId);
        if (!historyKey) {
             setChatHistory([]);
             setLoading(false);
             return;
        }

        try {
            const storedHistory = localStorage.getItem(historyKey);
            if (storedHistory) {
                const parsedHistory = JSON.parse(storedHistory);
                if (Array.isArray(parsedHistory)) {
                    const validHistory = parsedHistory.filter(msg =>
                        msg && typeof msg.id === 'string' && typeof msg.text === 'string' && typeof msg.sender === 'string' && typeof msg.timestamp === 'string'
                    );
                    if (validHistory.length !== parsedHistory.length) {
                        console.warn(`Some invalid messages filtered from chat history for session ${sessionId}.`);
                    }
                    setChatHistory(validHistory);
                } else {
                    console.warn(`Invalid chat history format for session ${sessionId}. Clearing.`);
                    localStorage.removeItem(historyKey);
                    setChatHistory([]);
                }
            } else {
                setChatHistory([]); // No history found for this session
            }
        } catch (err) {
            console.error(`Error reading chat history for session ${sessionId}:`, err);
            setError('Failed to load chat history.');
            try { localStorage.removeItem(historyKey); } catch {}
            setChatHistory([]);
        } finally {
            setLoading(false);
        }
    }, [userId]);


    // Save a message to the *active* session's history
    const saveMessage = useCallback(async (messageData: Omit<Message, 'id' | 'timestamp' | 'icon'>): Promise<void> => {
        if (!userId || !activeSessionId) {
            setError('You must be logged in and have an active chat session to save messages.');
            return;
        }
        setError(null);
        const historyKey = getHistoryKey(userId, activeSessionId);
         if (!historyKey) {
             setError('Internal error: Could not determine storage key.');
             return;
         }

        const newMessage: ChatHistoryMessage = {
            ...messageData,
            id: crypto.randomUUID(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        if (!newMessage.id || !newMessage.text || !newMessage.sender || !newMessage.timestamp) {
            console.error("Attempted to save an invalid message:", newMessage);
            setError("Failed to save message due to invalid format.");
            return;
        }

        try {
            // Read current history for the active session
            const storedHistoryRaw = localStorage.getItem(historyKey);
            let currentSessionHistory: ChatHistoryMessage[] = [];
            if (storedHistoryRaw) {
                try {
                    const parsed = JSON.parse(storedHistoryRaw);
                    if (Array.isArray(parsed)) {
                        currentSessionHistory = parsed.filter(msg => msg && typeof msg.id === 'string');
                    } else {
                         console.warn(`Overwriting invalid history format for session ${activeSessionId}.`);
                    }
                } catch (parseError) {
                     console.error(`Error parsing existing history for session ${activeSessionId}, overwriting:`, parseError);
                }
            }

            // Add new message
            const updatedHistory = [...currentSessionHistory, newMessage];

            // Save updated history for the active session
            localStorage.setItem(historyKey, JSON.stringify(updatedHistory));

            // Update local state immediately
            setChatHistory(updatedHistory);

            // Update session title if it's the first user message
            if (messageData.sender === 'user' && currentSessionHistory.length === 0) {
                const sessionToUpdate = sessions.find(s => s.id === activeSessionId);
                if (sessionToUpdate) {
                    const newTitle = messageData.text.substring(0, 30) + (messageData.text.length > 30 ? '...' : '');
                    const updatedSession: ChatSession = { ...sessionToUpdate, title: newTitle };
                    const updatedSessions = sessions.map(s => s.id === activeSessionId ? updatedSession : s);
                    saveSessions(updatedSessions); // Save updated session list
                }
            }

        } catch (err) {
            console.error('Error saving message to local storage:', err);
            setError('Failed to save message.');
            if (err instanceof DOMException && err.name === 'QuotaExceededError') {
                setError('Chat history storage limit reached.');
            }
        }
    }, [userId, activeSessionId, sessions, saveSessions]); // Include sessions and saveSessions dependencies


    // --- Effects ---

    // Load sessions and determine initial active session on mount/user change
    useEffect(() => {
        if (userId) {
            setLoading(true);
            loadSessions(); // Load the list first
            const activeSessionKey = getActiveSessionKey(userId);
            const storedActiveId = activeSessionKey ? localStorage.getItem(activeSessionKey) : null;
            setActiveSessionIdState(storedActiveId); // Set initial active ID (might be null)
            setLoading(false); // Loading of sessions list is done
        } else {
            // Clear everything if user logs out
            setSessions([]);
            setActiveSessionIdState(null);
            setChatHistory([]);
            setLoading(false);
            setError(null);
        }
    }, [userId, loadSessions]); // Run when user changes


    // Load chat history when the active session ID changes (or becomes available)
    useEffect(() => {
        if (activeSessionId) {
            loadChatHistory(activeSessionId);
        } else if (userId && sessions.length > 0) {
             // If no active session ID stored, default to the latest session
            setActiveSessionId(sessions[0].id);
        } else if (userId && sessions.length === 0 && !loading) {
            // If user is logged in, has no sessions, and not loading, create one
            createNewSession();
        } else if (!userId) {
            // Ensure history is cleared if user logs out and activeSessionId becomes null
            setChatHistory([]);
        }
        // Intentionally not depending on createNewSession to avoid loop on initial load
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeSessionId, userId, sessions, loadChatHistory, setActiveSessionId]); // Run when active session changes or user/sessions list updates


   // Listen for storage changes to update history/sessions if modified in another tab
   useEffect(() => {
       const handleStorageChange = (event: StorageEvent) => {
            if (!userId) return;
            const sessionsKey = getSessionsKey(userId);
            const activeSessionKey = getActiveSessionKey(userId);
            const currentHistoryKey = activeSessionId ? getHistoryKey(userId, activeSessionId) : null;

            if (event.key === sessionsKey) {
                 console.log("Sessions changed in another tab, reloading...");
                 loadSessions();
            } else if (event.key === activeSessionKey) {
                console.log("Active session changed in another tab, updating...");
                setActiveSessionIdState(event.newValue); // Update local state, which triggers history reload effect
            } else if (event.key === currentHistoryKey) {
                 console.log("Current chat history changed in another tab, reloading...");
                 loadChatHistory(activeSessionId);
            } else if (event.key?.startsWith(`neurochat_history_${userId}_`)) {
                // History of a *different* session changed, no immediate action needed here
                // unless you want to show notifications, etc.
            }
       };

       window.addEventListener('storage', handleStorageChange);
       return () => window.removeEventListener('storage', handleStorageChange);
   }, [userId, activeSessionId, loadSessions, loadChatHistory]); // Re-attach listener if user or active session changes


   // No longer needed: clearChatHistory is now deleteSession(sessionId)
   // const clearChatHistory = ...


    return {
        sessions,
        activeSessionId,
        setActiveSessionId,
        chatHistory,
        loading,
        error,
        saveMessage,
        createNewSession,
        deleteSession,
    };
}
