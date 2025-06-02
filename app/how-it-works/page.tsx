import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';

export default function HowItWorks() {
  return (
    <>
      <SiteHeader />
      
      <div className="container py-12 max-w-4xl mx-auto">
        <div className="space-y-4 text-center mb-12">
          <h1 className="text-4xl font-bold">How {APP_NAME} Works</h1>
          <p className="text-xl text-muted-foreground">
            The simple way to connect brands with UGC creators
          </p>
        </div>
        
        <div className="space-y-16">
          {/* For Brands */}
          <section>
            <h2 className="text-3xl font-bold mb-6">For Brands</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-semibold">Create a Brief</h3>
                <p className="text-muted-foreground">
                  Define your content needs, set a budget, and specify requirements for creators.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-semibold">Review Applications</h3>
                <p className="text-muted-foreground">
                  Browse creator profiles and portfolios to find the perfect match for your brand.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-semibold">Get Authentic Content</h3>
                <p className="text-muted-foreground">
                  Connect with chosen creators to receive high-quality UGC for your brand.
                </p>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <Link href="/signup?role=brand">
                <Button size="lg">Get Started as a Brand</Button>
              </Link>
            </div>
          </section>
          
          <div className="border-t my-12"></div>
          
          {/* For Creators */}
          <section>
            <h2 className="text-3xl font-bold mb-6">For Creators</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-semibold">Create Your Profile</h3>
                <p className="text-muted-foreground">
                  Showcase your skills and build a portfolio that highlights your best work.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-semibold">Apply to Briefs</h3>
                <p className="text-muted-foreground">
                  Browse opportunities from brands and apply to the ones that match your style.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-semibold">Grow Your Career</h3>
                <p className="text-muted-foreground">
                  Complete projects, build your portfolio, and develop relationships with brands.
                </p>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <Link href="/signup?role=creator">
                <Button size="lg">Get Started as a Creator</Button>
              </Link>
            </div>
          </section>
          
          <div className="border-t my-12"></div>
          
          {/* FAQ Section */}
          <section>
            <h2 className="text-3xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">What is UGC content?</h3>
                <p className="text-muted-foreground">
                  User-Generated Content (UGC) is authentic content created by real people rather than brands. It includes photos, videos, testimonials, and more that showcase products or services in a genuine way.
                </p>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">How much does it cost to use {APP_NAME}?</h3>
                <p className="text-muted-foreground">
                  Creating an account and posting briefs is free. Brands only pay the agreed budget to creators once they've accepted an application and received content.
                </p>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">How do creators get paid?</h3>
                <p className="text-muted-foreground">
                  Payment arrangements are made directly between brands and creators after an application is accepted. {APP_NAME} facilitates the connection, but payments are handled outside the platform.
                </p>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">What types of content can I request as a brand?</h3>
                <p className="text-muted-foreground">
                  You can request any type of content including photos, videos, reviews, testimonials, unboxing videos, tutorials, and more. Just be clear about your requirements in the brief.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
      
      {/* CTA Section */}
      <section className="bg-gradient-to-r from-teal-500 to-emerald-500 py-20 mt-12">
        <div className="container text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
            <p className="text-white/90 mb-8">
              Join {APP_NAME} today and revolutionize how you connect with creators or brands.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" variant="secondary">
                  Create an Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <SiteFooter />
    </>
  );
}