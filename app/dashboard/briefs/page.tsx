'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { supabase, Brief } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Plus, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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

export default function Briefs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [briefStats, setBriefStats] = useState<Record<string, { applications: number }>>({});
  const [loading, setLoading] = useState(true);
  const [deletingBriefId, setDeletingBriefId] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchBriefs = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('briefs')
          .select('*')
          .eq('brand_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        setBriefs(data || []);
        
        // Fetch application counts for each brief
        if (data && data.length > 0) {
          const briefIds = data.map((brief) => brief.id);
          
          const { data: applicationStats, error: statsError } = await supabase
            .from('applications')
            .select('brief_id, count(*)')
            .in('brief_id', briefIds)
            .group('brief_id');
            
          if (statsError) {
            console.error('Error fetching brief stats:', statsError);
            return;
          }
          
          const statsMap: Record<string, { applications: number }> = {};
          
          applicationStats?.forEach((stat: any) => {
            statsMap[stat.brief_id] = { applications: parseInt(stat.count) };
          });
          
          setBriefStats(statsMap);
        }
        
      } catch (error) {
        console.error('Error fetching briefs:', error);
        toast({
          title: 'Error',
          description: 'Failed to load briefs',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchBriefs();
    }
  }, [user, toast]);
  
  const handleDeleteBrief = async () => {
    if (!deletingBriefId) return;
    
    try {
      const { error } = await supabase
        .from('briefs')
        .delete()
        .eq('id', deletingBriefId);
        
      if (error) {
        throw error;
      }
      
      setBriefs((prev) => prev.filter((brief) => brief.id !== deletingBriefId));
      
      toast({
        title: 'Brief deleted',
        description: 'The brief has been deleted successfully',
      });
      
    } catch (error: any) {
      console.error('Error deleting brief:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete brief',
        variant: 'destructive',
      });
    } finally {
      setDeletingBriefId(null);
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
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Content Briefs</h1>
        <Link href="/dashboard/briefs/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Brief
          </Button>
        </Link>
      </div>
      
      <Card>
        {loading ? (
          <div className="flex justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : briefs.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Deadline</TableHead>
                <TableHead>Applications</TableHead>
                <TableHead className="hidden md:table-cell">Budget</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {briefs.map((brief) => (
                <TableRow key={brief.id}>
                  <TableCell className="font-medium">
                    <Link href={`/dashboard/briefs/${brief.id}`} className="hover:underline">
                      {brief.title}
                    </Link>
                  </TableCell>
                  <TableCell>{getStatusBadge(brief.status)}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Date(brief.deadline).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {briefStats[brief.id]?.applications || 0}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    ${brief.budget}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link href={`/dashboard/briefs/${brief.id}`}>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                        </Link>
                        <Link href={`/dashboard/briefs/edit/${brief.id}`}>
                          <DropdownMenuItem>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeletingBriefId(brief.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <p className="text-muted-foreground mb-4">You haven&apos;t created any briefs yet</p>
            <Link href="/dashboard/briefs/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Brief
              </Button>
            </Link>
          </div>
        )}
      </Card>
      
      <AlertDialog open={!!deletingBriefId} onOpenChange={(open) => !open && setDeletingBriefId(null)}>
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