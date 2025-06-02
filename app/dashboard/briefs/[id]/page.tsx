'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { supabase, Brief } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Calendar, DollarSign, Edit, Trash2, User } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';

export default function BriefDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [brief, setBrief] = useState<Brief | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  
  useEffect(() => {
    const fetchBriefDetails = async () => {
      if (!user || !id) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('briefs')
          .select('*')
          .eq('id', id)
          .eq('brand_id', user.id)
          .single();
          
        if (error) {
          throw error;
        }
        
        setBrief(data);
        
        // Fetch applications for this brief
        setApplicationsLoading(true);
        const { data: applicationsData, error: applicationsError } = await supabase
          .from('applications')
          .select(`
            *,
            creators:creator_id(*)
          `)
          .eq('brief_id', id)
          .order('created_at', { ascending: false });
          
        if (applicationsError) {
          console.error('Error fetching applications:', applicationsError);
        } else {
          setApplications(applicationsData || []);
        }
        setApplicationsLoading(false);
        
      } catch (error) {
        console.error('Error fetching brief details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load brief details',
          variant: 'destructive',
        });
        router.push('/dashboard/briefs');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchBriefDetails();
    }
  }, [id, user, router, toast]);
  
  const handleUpdateStatus = async (status: 'draft' | 'published' | 'closed') => {
    if (!user || !brief) return;
    
    try {
      const { error } = await supabase
        .from('briefs')
        .update({ status })
        .eq('id', brief.id);
        
      if (error) {
        throw error;
      }
      
      setBrief({
        ...brief,
        status,
      });
      
      toast({
        title: 'Brief updated',
        description: `Brief status changed to ${status}`,
      });
      
    } catch (error: any) {
      console.error('Error updating brief status:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update brief status',
        variant: 'destructive',
      });
    }
  };
  
  const handleDeleteBrief = async () => {
    if (!user || !brief) return;
    
    try {
      const { error } = await supabase
        .from('briefs')
        .delete()
        .eq('id', brief.id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Brief deleted',
        description: 'The brief has been deleted successfully',
      });
      
      router.push('/dashboard/briefs');
      
    } catch (error: any) {
      console.error('Error deleting brief:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete brief',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'published':
        return <Badge variant="default" className="bg-green-600">Published</Badge>;
      case 'closed':
        return <Badge variant="secondary">Closed</Badge>;
      default:
        return null;
    }
  };
  
  const getApplicationStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'accepted':
        return <Badge variant="default" className="bg-green-600">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="secondary">Rejected</Badge>;
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
  
  if (!brief) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <p className="text-muted-foreground mb-4">Brief not found or you don't have permission to view it</p>
          <Button variant="outline" onClick={() => router.push('/dashboard/briefs')}>
            Back to Briefs
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/briefs')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Briefs
        </Button>
        
        <div className="flex gap-2">
          <Link href={`/dashboard/briefs/edit/${brief.id}`}>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm"
            className="text-destructive focus:text-destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
      
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold">{brief.title}</h1>
          {getStatusBadge(brief.status)}
        </div>
        
        <div className="flex flex-wrap gap-6 mt-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span>
              Deadline: {new Date(brief.deadline).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <span>Budget: ${brief.budget}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <span>Applications: {applications.length}</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Brief Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="whitespace-pre-line">{brief.description}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Requirements</h3>
              <p className="whitespace-pre-line">{brief.requirements}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Brief Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Current status: {getStatusBadge(brief.status)}</p>
              
              {brief.status === 'draft' && (
                <Button 
                  className="w-full" 
                  onClick={() => handleUpdateStatus('published')}
                >
                  Publish Brief
                </Button>
              )}
              
              {brief.status === 'published' && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleUpdateStatus('closed')}
                >
                  Close Brief
                </Button>
              )}
              
              {brief.status === 'closed' && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleUpdateStatus('published')}
                >
                  Reopen Brief
                </Button>
              )}
            </div>
            
            <div>
              <p className="text-sm mb-2">
                Created on {new Date(brief.created_at).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Applications ({applications.length})</TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({applications.filter(app => app.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="accepted">
            Accepted ({applications.filter(app => app.status === 'accepted').length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <Card>
            {applicationsLoading ? (
              <div className="flex justify-center p-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : applications.length > 0 ? (
              <div className="divide-y">
                {applications.map((application) => (
                  <div key={application.id} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{application.creators?.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <span>Applied: {new Date(application.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{getApplicationStatusBadge(application.status)}</span>
                      </div>
                    </div>
                    <Link href={`/dashboard/applications/${application.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <p className="text-muted-foreground">No applications received yet</p>
              </div>
            )}
          </Card>
        </TabsContent>
        <TabsContent value="pending">
          <Card>
            {applicationsLoading ? (
              <div className="flex justify-center p-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : applications.filter(app => app.status === 'pending').length > 0 ? (
              <div className="divide-y">
                {applications
                  .filter(app => app.status === 'pending')
                  .map((application) => (
                    <div key={application.id} className="p-4 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{application.creators?.name}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Applied: {new Date(application.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <Link href={`/dashboard/applications/${application.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  ))
                }
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <p className="text-muted-foreground">No pending applications</p>
              </div>
            )}
          </Card>
        </TabsContent>
        <TabsContent value="accepted">
          <Card>
            {applicationsLoading ? (
              <div className="flex justify-center p-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : applications.filter(app => app.status === 'accepted').length > 0 ? (
              <div className="divide-y">
                {applications
                  .filter(app => app.status === 'accepted')
                  .map((application) => (
                    <div key={application.id} className="p-4 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{application.creators?.name}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Applied: {new Date(application.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <Link href={`/dashboard/applications/${application.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  ))
                }
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <p className="text-muted-foreground">No accepted applications</p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this brief and all associated applications. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBrief} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}