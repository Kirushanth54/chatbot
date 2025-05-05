
import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to the chat page as the main interface
  redirect('/chat');
}
