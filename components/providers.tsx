'use client';

import { ThemeProvider } from 'next-themes';
import { PropsWithChildren, useState, useEffect } from 'react';
import { AuthProvider } from '@/context/auth-context';

export function Providers({ children }: PropsWithChildren) {
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by rendering only after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}