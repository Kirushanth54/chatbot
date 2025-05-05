import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout is minimal, providing just the children content
  // Useful for login/register pages that shouldn't have the main app navigation
  return <>{children}</>;
}
