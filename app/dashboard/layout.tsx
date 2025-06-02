'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { DashboardNav } from '@/components/dashboard-nav';
import { useAuth } from '@/context/auth-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return null;
  }
  
  return (
    <>
      <SiteHeader />
      <div className="flex min-h-screen flex-col">
        <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr]">
          <aside className="hidden md:block">
            <DashboardNav />
          </aside>
          <main className="flex w-full flex-1 flex-col py-6">
            {children}
          </main>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}