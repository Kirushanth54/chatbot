import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/header';
import { AuthProvider } from '@/context/auth-provider'; // Import AuthProvider

export const metadata: Metadata = {
  title: 'NeuroChat - CVST Assistant',
  description: 'AI Chatbot for Cerebral Venous Sinus Thrombosis information',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <AuthProvider> {/* Wrap with AuthProvider */}
          <Header /> {/* Include Header */}
          <main>{children}</main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
