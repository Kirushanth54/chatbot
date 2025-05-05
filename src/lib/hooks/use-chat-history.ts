'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  type DocumentData,
  type QuerySnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-provider';
import type { Message } from '@/components/chat/chat-interface'; // Adjust path as needed

// Define a more specific type for Firestore message data
interface FirestoreMessageData extends Omit<Message, 'id' | 'timestamp' | 'icon'> {
  userId: string;
  createdAt: Timestamp;
}

// Define the structure of the message returned from the hook
export interface ChatHistoryMessage extends Message {
  firestoreId: string; // Add Firestore document ID
}

export function useChatHistory() {
  const { user } = useAuth();
  const [chatHistory, setChatHistory] = useState<ChatHistoryMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch chat history
  useEffect(() => {
    if (!user) {
      setChatHistory([]);
      setLoading(false);
      setError(null);
      return; // No user, no history to fetch
    }

    setLoading(true);
    setError(null);

    const messagesCol = collection(db, 'chatMessages');
    const q = query(
      messagesCol,
      where('userId', '==', user.uid),
      orderBy('createdAt', 'asc') // Order messages by time
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot: QuerySnapshot<DocumentData>) => {
        const history: ChatHistoryMessage[] = [];
        querySnapshot.forEach((doc) => {
           const data = doc.data() as FirestoreMessageData;
           // Convert Firestore Timestamp to JS Date, then to locale time string
           const timestamp = data.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          history.push({
            firestoreId: doc.id, // Store Firestore ID
            id: doc.id, // Use Firestore ID as message ID for simplicity
            text: data.text,
            sender: data.sender,
            timestamp: timestamp,
            // Note: Icons are not stored in Firestore in this setup. They are determined dynamically in the UI.
          });
        });
        setChatHistory(history);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching chat history:', err);
        setError('Failed to load chat history.');
        setLoading(false);
      }
    );

    // Cleanup listener on unmount or user change
    return () => unsubscribe();
  }, [user]); // Re-run effect when user changes

  // Save a new message
  const saveMessage = useCallback(
    async (message: Omit<Message, 'id' | 'timestamp' | 'icon'>): Promise<void> => {
      if (!user) {
        console.error('Cannot save message: No user logged in.');
        setError('You must be logged in to save messages.');
        return;
      }
       setError(null); // Clear previous errors

      try {
        const messagesCol = collection(db, 'chatMessages');
        const messageData: FirestoreMessageData = {
          ...message,
          userId: user.uid,
          createdAt: Timestamp.now(), // Use Firestore server timestamp
        };
        await addDoc(messagesCol, messageData);
        // No need to manually update state here, onSnapshot listener will handle it
      } catch (err) {
        console.error('Error saving message:', err);
        setError('Failed to save message.');
        // Optionally re-throw or handle the error further
      }
    },
    [user] // Dependency: only re-create function if user changes
  );

  return { chatHistory, loading, error, saveMessage };
}
