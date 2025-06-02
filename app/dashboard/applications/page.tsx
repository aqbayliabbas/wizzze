'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { supabase, Application } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type ExtendedApplication = Application & {
  briefs?: any;
  creators?: any;
};

export default function Applications() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [applications, setApplications] = useState<ExtendedApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    const fetchApplications = async () => {
      if (!user || !profile) return;
      
      try {
        setLoading(true);
        
        let query;
        
        if (profile.role === 'brand') {
          // For brands, fetch applications to their briefs
          query = supabase
            .from('applications')
            .select(`
              *,
              briefs:brief_id(*),
              creators:creator_id(*)
            `)
            .in('brief_id', function(subQuery) {
              return subQuery.from('briefs').select('id').eq('brand_id', user.id);
            });
        } else {
          // For creators, fetch their applications
          query = supabase
            .from('applications')
            .select(`
              *,
              briefs:brief_id(*),
              brands:briefs(
                brand:brand_id(*)
              )
            `)
            .eq('creator_id', user.id);
        }
        
        // Apply status filter if not 'all'
        if (activeTab !== 'all') {
          query = query.eq('status', activeTab);
        }
        
        // Order by created date
        query = query.order('created_at', { ascending: false });
        
        const { data, error } = await query;
          
        if (error) {
          throw error;
        }
        
        setApplications(data || []);
        
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast({
          title: 'Error',
          description: 'Failed to load applications',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (user && profile) {
      fetchApplications();
    }
  }, [user, profile, activeTab, toast]);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline\" className="bg-yellow-50 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">Rejected</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Applications</h1>
        <p className="text-muted-foreground">
          {profile?.role === 'brand'
            ? 'Manage applications from creators for your briefs'
            : 'Track your applications to brand briefs'}
        </p>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <Card>
        {loading ? (
          <div className="flex justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : applications.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                {profile?.role === 'brand' ? (
                  <TableHead>Creator</TableHead>
                ) : (
                  <TableHead>Brief</TableHead>
                )}
                {profile?.role === 'brand' && (
                  <TableHead>Brief</TableHead>
                )}
                <TableHead className="hidden md:table-cell">Date Applied</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id}>
                  {profile?.role === 'brand' ? (
                    <TableCell className="font-medium">
                      {application.creators?.name}
                    </TableCell>
                  ) : (
                    <TableCell className="font-medium">
                      {application.briefs?.title}
                    </TableCell>
                  )}
                  {profile?.role === 'brand' && (
                    <TableCell>
                      <Link href={`/dashboard/briefs/${application.brief_id}`} className="hover:underline">
                        {application.briefs?.title}
                      </Link>
                    </TableCell>
                  )}
                  <TableCell className="hidden md:table-cell">
                    {new Date(application.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(application.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/applications/${application.id}`}>
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <p className="text-muted-foreground mb-4">
              {profile?.role === 'brand'
                ? 'No applications received yet'
                : 'You haven\'t applied to any briefs yet'}
            </p>
            {profile?.role === 'creator' && (
              <Link href="/dashboard/discover">
                <Button>Find Briefs to Apply</Button>
              </Link>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}