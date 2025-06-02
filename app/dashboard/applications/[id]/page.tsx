'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { supabase, Application, PortfolioItem } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Calendar, DollarSign, Building, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function ApplicationDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [application, setApplication] = useState<any>(null);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  useEffect(() => {
    const fetchApplicationDetails = async () => {
      if (!user || !id) return;
      
      try {
        setLoading(true);
        
        let query;
        
        if (profile?.role === 'brand') {
          query = supabase
            .from('applications')
            .select(`
              *,
              briefs:brief_id(*),
              creators:creator_id(*)
            `)
            .eq('id', id)
            .single();
        } else {
          query = supabase
            .from('applications')
            .select(`
              *,
              briefs:brief_id(*),
              brands:briefs(
                brand:brand_id(*)
              )
            `)
            .eq('id', id)
            .eq('creator_id', user.id)
            .single();
        }
        
        const { data, error } = await query;
        
        if (error) {
          throw error;
        }
        
        setApplication(data);
        
        // Fetch portfolio items if they're referenced in the application
        if (data.portfolio_items && data.portfolio_items.length > 0) {
          const { data: portfolioData, error: portfolioError } = await supabase
            .from('portfolio_items')
            .select('*')
            .in('id', data.portfolio_items);
            
          if (portfolioError) {
            console.error('Error fetching portfolio items:', portfolioError);
          } else {
            setPortfolioItems(portfolioData);
          }
        }
        
      } catch (error) {
        console.error('Error fetching application details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load application details',
          variant: 'destructive',
        });
        router.push('/dashboard/applications');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchApplicationDetails();
    }
  }, [id, user, profile, router, toast]);
  
  const updateApplicationStatus = async (status: 'accepted' | 'rejected') => {
    if (!user || !application) return;
    
    try {
      setUpdating(true);
      
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', application.id);
        
      if (error) {
        throw error;
      }
      
      setApplication({
        ...application,
        status,
      });
      
      toast({
        title: `Application ${status}`,
        description: `You have ${status} this application`,
      });
      
    } catch (error: any) {
      console.error('Error updating application status:', error);
      toast({
        title: 'Error',
        description: error.message || `Failed to ${status} application`,
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-yellow-500" />
            <span className="text-yellow-500 font-medium">Pending Review</span>
          </div>
        );
      case 'accepted':
        return (
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-green-500 font-medium">Accepted</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-1">
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="text-red-500 font-medium">Rejected</span>
          </div>
        );
      default:
        return null;
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!application) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <p className="text-muted-foreground mb-4">Application not found or you don't have permission to view it</p>
          <Button variant="outline" onClick={() => router.push('/dashboard/applications')}>
            Back to Applications
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  const isBrand = profile?.role === 'brand';
  
  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {isBrand ? 'Application from Creator' : 'Your Application'}
          </h1>
          <div className="mt-2">
            {getStatusBadge(application.status)}
          </div>
        </div>
        
        {isBrand && application.status === 'pending' && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => updateApplicationStatus('rejected')}
              disabled={updating}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Decline
            </Button>
            <Button
              onClick={() => updateApplicationStatus('accepted')}
              disabled={updating}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Accept
            </Button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Brief: {application.briefs?.title}</CardTitle>
            <CardDescription>
              Applied on {new Date(application.created_at).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-muted-foreground" />
                <span>
                  {isBrand 
                    ? 'Your brief' 
                    : `Brand: ${application.brands?.brand?.company_name}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <span>Budget: ${application.briefs?.budget}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span>Deadline: {new Date(application.briefs?.deadline).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {isBrand 
                  ? `${application.creators?.name}'s Proposal` 
                  : 'Your Proposal'}
              </h3>
              <div className="bg-muted/50 p-4 rounded-md whitespace-pre-line">
                {application.proposal}
              </div>
            </div>
            
            {portfolioItems.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Included Portfolio Items</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {portfolioItems.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                      <div className="aspect-video bg-muted relative overflow-hidden">
                        {item.media_type === 'image' ? (
                          <img
                            src={item.media_url}
                            alt={item.title}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <a 
                              href={item.media_url} 
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute inset-0 flex items-center justify-center"
                            >
                              <span className="text-white bg-black/50 px-3 py-1 rounded">Play Video</span>
                            </a>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <h4 className="font-medium">{item.title}</h4>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {isBrand ? 'Creator Information' : 'Brief Details'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isBrand ? (
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium">{application.creators?.name}</h3>
                    <p className="text-sm text-muted-foreground">{application.creators?.email}</p>
                  </div>
                  
                  {/* Display creator profile info if available */}
                  {application.creators && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => router.push(`/creators/${application.creator_id}`)}
                    >
                      View Creator Profile
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Description</h3>
                    <p className="text-sm mt-1">{application.briefs?.description}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Requirements</h3>
                    <p className="text-sm mt-1">{application.briefs?.requirements}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {application.status === 'accepted' && (
            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-800 dark:text-green-400">Application Accepted</h3>
                    <p className="text-sm text-green-700 dark:text-green-500 mt-1">
                      {isBrand
                        ? `You've accepted this creator for your brief. Reach out to them at ${application.creators?.email} to discuss next steps.`
                        : `Congratulations! The brand has accepted your application. They may reach out to you directly to discuss next steps.`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {application.status === 'rejected' && (
            <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-800 dark:text-red-400">Application Rejected</h3>
                    <p className="text-sm text-red-700 dark:text-red-500 mt-1">
                      {isBrand
                        ? `You've declined this creator's application.`
                        : `Unfortunately, the brand has declined your application for this brief.`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}