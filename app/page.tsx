import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Button } from '@/components/ui/button';
import { APP_NAME } from '@/lib/constants';

export default function Home() {
  return (
    <>
      <SiteHeader />
      <div className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32">
          <div className="container flex flex-col items-center text-center space-y-8">
            <div className="max-w-3xl space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-teal-500 to-emerald-500 text-transparent bg-clip-text">
                Connect Brands with UGC Creators
              </h1>
              <p className="text-xl text-muted-foreground">
                The platform where brands find authentic content creators and creators showcase their talent.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
              <Link href="/signup?role=brand">
                <Button size="lg" className="w-full">I'm a Brand</Button>
              </Link>
              <Link href="/signup?role=creator">
                <Button size="lg" variant="outline" className="w-full">I'm a Creator</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-muted/50">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">How It Works</h2>
              <p className="text-muted-foreground mt-2">Simple steps to connect and create amazing content</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* For Brands */}
              <div className="bg-background rounded-lg p-6 shadow-sm border">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-primary font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Post a Brief</h3>
                <p className="text-muted-foreground">Create a detailed content brief specifying your requirements, budget, and deadline.</p>
              </div>
              <div className="bg-background rounded-lg p-6 shadow-sm border">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-primary font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Review Applications</h3>
                <p className="text-muted-foreground">Browse and select from talented creators who apply to your brief.</p>
              </div>
              <div className="bg-background rounded-lg p-6 shadow-sm border">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-primary font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Get Quality Content</h3>
                <p className="text-muted-foreground">Receive authentic, high-quality content from skilled creators for your brand.</p>
              </div>
            </div>
            
            <div className="mt-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold">For Creators</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-background rounded-lg p-6 shadow-sm border">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Build Your Profile</h3>
                  <p className="text-muted-foreground">Showcase your talent with a portfolio that highlights your best work.</p>
                </div>
                <div className="bg-background rounded-lg p-6 shadow-sm border">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Find Opportunities</h3>
                  <p className="text-muted-foreground">Discover and apply to briefs that match your expertise and interests.</p>
                </div>
                <div className="bg-background rounded-lg p-6 shadow-sm border">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Grow Your Portfolio</h3>
                  <p className="text-muted-foreground">Complete projects, build relationships, and expand your creator business.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-teal-500 to-emerald-500">
          <div className="container text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
              <p className="text-white/90 mb-8">
                Join {APP_NAME} today and connect with the perfect partners for your content needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    Create an Account
                  </Button>
                </Link>
                <Link href="/how-it-works">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border-white/20">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <SiteFooter />
      </div>
    </>
  );
}