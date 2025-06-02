'use client';

import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { APP_NAME } from '@/lib/constants';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserCircle } from 'lucide-react';

export function SiteHeader() {
  const { user, profile, signOut } = useAuth();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold bg-gradient-to-r from-teal-500 to-emerald-500 text-transparent bg-clip-text">{APP_NAME}</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/discover" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Discover
          </Link>
          <Link href="/how-it-works" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            How It Works
          </Link>
          {!user ? (
            <>
              <Link href="/login">
                <Button variant="outline" size="sm">Log in</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                Dashboard
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    {profile?.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt={profile.name} 
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <UserCircle className="w-8 h-8" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{profile?.name}</span>
                      <span className="text-xs text-muted-foreground">{profile?.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/dashboard">
                    <DropdownMenuItem>Dashboard</DropdownMenuItem>
                  </Link>
                  <Link href="/profile">
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          <ThemeToggle />
        </nav>
        
        {/* Mobile Menu */}
        <div className="md:hidden flex items-center gap-2">
          {user && (
            <Link href="/dashboard">
              <Button variant="ghost\" size="sm">Dashboard</Button>
            </Link>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                {user ? (
                  profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={profile.name} 
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <UserCircle className="w-6 h-6" />
                  )
                ) : (
                  <UserCircle className="w-6 h-6" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {user ? (
                <>
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{profile?.name}</span>
                      <span className="text-xs text-muted-foreground">{profile?.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/dashboard">
                    <DropdownMenuItem>Dashboard</DropdownMenuItem>
                  </Link>
                  <Link href="/profile">
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                  </Link>
                  <Link href="/discover">
                    <DropdownMenuItem>Discover</DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    Log out
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <DropdownMenuItem>Log in</DropdownMenuItem>
                  </Link>
                  <Link href="/signup">
                    <DropdownMenuItem>Sign up</DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <Link href="/discover">
                    <DropdownMenuItem>Discover</DropdownMenuItem>
                  </Link>
                  <Link href="/how-it-works">
                    <DropdownMenuItem>How It Works</DropdownMenuItem>
                  </Link>
                </>
              )}
              <DropdownMenuSeparator />
              <div className="px-2">
                <ThemeToggle />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}