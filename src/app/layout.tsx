import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/header'; // Assuming Header component will be created

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
        {/* <Header /> */} {/* Add Header later when auth is implemented */}
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
