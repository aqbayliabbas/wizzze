import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';

export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold">{APP_NAME}</h3>
            <p className="text-sm text-muted-foreground">
              Connecting brands with creators for authentic content.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold">Platform</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/discover" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Discover
              </Link>
              <Link href="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </Link>
            </nav>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold">Resources</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/creators" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                For Creators
              </Link>
              <Link href="/brands" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                For Brands
              </Link>
            </nav>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold">Legal</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
            </nav>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Twitter
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Instagram
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              LinkedIn
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}