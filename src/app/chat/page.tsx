import ChatInterface from '@/components/chat/chat-interface';

export default function ChatPage() {
  return (
    <div className="flex flex-col h-screen bg-secondary">
      {/* Header placeholder - can be replaced with actual header component later */}
      <header className="bg-primary text-primary-foreground p-4 shadow-md">
        <h1 className="text-xl font-semibold">NeuroChat CVST Assistant</h1>
      </header>
      <ChatInterface />
    </div>
  );
}
