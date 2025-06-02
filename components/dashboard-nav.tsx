'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import {
  LayoutDashboard,
  FileText,
  User,
  Mail,
  Settings,
  Plus,
  Image,
} from 'lucide-react';

export function DashboardNav() {
  const pathname = usePathname();
  const { profile } = useAuth();
  
  const isBrand = profile?.role === 'brand';
  
  const navItems = [
    {
      title: 'Overview',
      href: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      forRoles: ['brand', 'creator'],
    },
    {
      title: 'Briefs',
      href: '/dashboard/briefs',
      icon: <FileText className="w-5 h-5" />,
      forRoles: ['brand'],
    },
    {
      title: 'Find Briefs',
      href: '/dashboard/discover',
      icon: <FileText className="w-5 h-5" />,
      forRoles: ['creator'],
    },
    {
      title: 'Applications',
      href: '/dashboard/applications',
      icon: <Mail className="w-5 h-5" />,
      forRoles: ['brand', 'creator'],
    },
    {
      title: 'Portfolio',
      href: '/dashboard/portfolio',
      icon: <Image className="w-5 h-5" />,
      forRoles: ['creator'],
    },
    {
      title: 'Profile',
      href: '/dashboard/profile',
      icon: <User className="w-5 h-5" />,
      forRoles: ['brand', 'creator'],
    },
    {
      title: 'Settings',
      href: '/dashboard/settings',
      icon: <Settings className="w-5 h-5" />,
      forRoles: ['brand', 'creator'],
    },
  ];
  
  const filteredNavItems = navItems.filter(item => 
    profile && item.forRoles.includes(profile.role)
  );
  
  return (
    <div className="flex flex-col h-full">
      <div className="space-y-1 py-4">
        {isBrand && (
          <div className="px-3 py-2">
            <Link href="/dashboard/briefs/create">
              <Button className="w-full justify-start">
                <Plus className="mr-2 h-5 w-5" />
                New Brief
              </Button>
            </Link>
          </div>
        )}
        
        <nav className="grid gap-1 px-2">
          {filteredNavItems.map((item, index) => (
            <Link 
              key={index} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent transition-all",
                pathname === item.href ? "bg-accent" : "transparent"
              )}
            >
              {item.icon}
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}