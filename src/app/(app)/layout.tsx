import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/sidebar'; // Renamed Sidebar component
import Header from '@/components/layout/header'; // Import Header here

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <AppSidebar />
         {/* Main content area */}
        <div className="flex flex-1 flex-col overflow-hidden">
           <Header /> {/* Header is now inside the main content area */}
          {children} {/* Page content */}
        </div>
      </div>
    </SidebarProvider>
  );
}
