'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { supabase, Brief, PortfolioItem } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckboxItem, CheckboxList } from '@/components/portfolio-checkbox';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Calendar, DollarSign, Building } from 'lucide-react';

export default function BriefDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [brief, setBrief] = useState<Brief | null>(null);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [brandProfile, setBrandProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [proposal, setProposal] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchBriefDetails = async () => {
      if (!user || !id) return;
      
      try {
        setLoading(true);
        
        // Fetch brief details
        const { data, error } = await supabase
          .from('briefs')
          .select(`
            *,
            brand_profiles:brand_id(*)
          `)
          .eq('id', id)
          .single();
          
        if (error) {
          throw error;
        }
        
        setBrief(data);
        setBrandProfile(data.brand_profiles);
        
        // Check if user has already applied to this brief
        const { data: applicationData, error: applicationError } = await supabase
          .from('applications')
          .select('*')
          .eq('brief_id', id)
          .eq('creator_id', user.id)
          .maybeSingle();
          
        if (applicationError) {
          console.error('Error checking application status:', applicationError);
        } else if (applicationData) {
          setHasApplied(true);
        }
        
        // Fetch user's portfolio items
        const { data: portfolioData, error: portfolioError } = await supabase
          .from('portfolio_items')
          .select('*')
          .eq('creator_id', user.id)
          .order('created_at', { ascending: false });
          
        if (portfolioError) {
          console.error('Error fetching portfolio items:', portfolioError);
        } else {
          setPortfolioItems(portfolioData);
        }
        
      } catch (error) {
        console.error('Error fetching brief details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load brief details',
          variant: 'destructive',
        });
        router.push('/dashboard/discover');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchBriefDetails();
    }
  }, [id, user, router, toast]);
  
  const handleApply = async () => {
    if (!user || !brief) return;
    
    if (!proposal) {
      toast({
        title: 'Missing proposal',
        description: 'Please write a proposal for this brief',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      const { data, error } = await supabase
        .from('applications')
        .insert({
          brief_id: brief.id,
          creator_id: user.id,
          proposal,
          portfolio_items: selectedItems,
          status: 'pending',
        })
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Application submitted',
        description: 'Your application has been submitted successfully',
      });
      
      setHasApplied(true);
      
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit application',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!brief) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <p className="text-muted-foreground mb-4">Brief not found or has been removed</p>
          <Button variant="outline" onClick={() => router.push('/dashboard/discover')}>
            Back to Discover
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      <div>
        <h1 className="text-3xl font-bold">{brief.title}</h1>
        <div className="flex flex-wrap gap-2 items-center mt-2">
          <div className="flex items-center text-muted-foreground">
            <Building className="h-4 w-4 mr-1" />
            <span>{brandProfile?.company_name}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <DollarSign className="h-4 w-4 mr-1" />
            <span>${brief.budget}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Due: {new Date(brief.deadline).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Brief Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Description</h3>
              <p className="whitespace-pre-line">{brief.description}</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Requirements</h3>
              <p className="whitespace-pre-line">{brief.requirements}</p>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About the Brand</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">{brandProfile?.company_name}</h3>
                  <p className="text-sm text-muted-foreground">Industry: {brandProfile?.industry}</p>
                </div>
                {brandProfile?.description && (
                  <p className="text-sm">{brandProfile.description}</p>
                )}
                {brandProfile?.website && (
                  <a 
                    href={brandProfile.website} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Visit Website
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
          
          {hasApplied ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center text-center p-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Application Submitted</h3>
                  <p className="text-sm text-muted-foreground">
                    Your application has been submitted successfully. The brand will review your proposal and get in touch if interested.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Submit Application</CardTitle>
                <CardDescription>
                  Write a proposal for this brief
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="proposal">Your Proposal</Label>
                  <Textarea
                    id="proposal"
                    value={proposal}
                    onChange={(e) => setProposal(e.target.value)}
                    placeholder="Explain why you're a good fit for this brief and how you would approach it"
                    rows={5}
                    required
                  />
                </div>
                
                {portfolioItems.length > 0 && (
                  <div className="space-y-2">
                    <Label>Select relevant portfolio items</Label>
                    <CheckboxList
                      items={portfolioItems.map((item) => ({
                        id: item.id,
                        label: item.title,
                        checked: selectedItems.includes(item.id),
                      }))}
                      onChange={(id, checked) => {
                        setSelectedItems(prev => 
                          checked 
                            ? [...prev, id] 
                            : prev.filter(itemId => itemId !== id)
                        );
                      }}
                    />
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleApply} 
                  disabled={submitting || !proposal} 
                  className="w-full"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}