// Basic Header placeholder - Will be expanded later for authentication
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BrainCircuit } from 'lucide-react'; // Assuming BrainCircuit for logo

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/chat" className="mr-6 flex items-center space-x-2">
           <BrainCircuit className="h-6 w-6 text-primary" />
          <span className="hidden font-bold sm:inline-block">NeuroChat</span>
        </Link>
        <nav className="flex flex-1 items-center space-x-4">
          {/* Navigation items can go here later */}
        </nav>
        <div className="flex items-center space-x-2">
            {/* Authentication buttons will go here */}
            {/* <Button variant="outline" size="sm">Login</Button> */}
            {/* <Button size="sm">Sign Up</Button> */}
        </div>
      </div>
    </header>
  );
}
