'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { supabase, Brief, Application } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronRight, BarChart3, FileText, Mail } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    briefs: 0,
    applications: 0,
    portfolioItems: 0,
  });
  const [recentBriefs, setRecentBriefs] = useState<Brief[]>([]);
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || !profile) return;
      
      try {
        setLoading(true);
        
        if (profile.role === 'brand') {
          // Fetch stats for brand
          const { data: briefsCount, error: briefsError } = await supabase
            .from('briefs')
            .select('id', { count: 'exact' })
            .eq('brand_id', user.id);
            
          const { data: applicationsCount, error: applicationsError } = await supabase
            .from('applications')
            .select('id', { count: 'exact' })
            .in('brief_id', function(subQuery) {
              return subQuery.from('briefs').select('id').eq('brand_id', user.id);
            });
            
          // Fetch recent briefs
          const { data: briefs, error: recentBriefsError } = await supabase
            .from('briefs')
            .select('*')
            .eq('brand_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5);
            
          // Fetch recent applications to brand's briefs
          const { data: applications, error: recentAppsError } = await supabase
            .from('applications')
            .select(`
              *,
              briefs:brief_id(*),
              creators:creator_id(*)
            `)
            .in('brief_id', function(subQuery) {
              return subQuery.from('briefs').select('id').eq('brand_id', user.id);
            })
            .order('created_at', { ascending: false })
            .limit(5);
            
          setStats({
            briefs: briefsCount?.length || 0,
            applications: applicationsCount?.length || 0,
            portfolioItems: 0,
          });
          
          setRecentBriefs(briefs || []);
          setRecentApplications(applications || []);
          
        } else if (profile.role === 'creator') {
          // Fetch stats for creator
          const { data: applicationsCount, error: applicationsError } = await supabase
            .from('applications')
            .select('id', { count: 'exact' })
            .eq('creator_id', user.id);
            
          const { data: portfolioCount, error: portfolioError } = await supabase
            .from('portfolio_items')
            .select('id', { count: 'exact' })
            .eq('creator_id', user.id);
            
          // Fetch recent applications by creator
          const { data: applications, error: recentAppsError } = await supabase
            .from('applications')
            .select(`
              *,
              briefs:brief_id(*),
              brands:briefs(
                brand_profiles:brand_id(*)
              )
            `)
            .eq('creator_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5);
            
          // Fetch recent briefs (for discovery)
          const { data: briefs, error: recentBriefsError } = await supabase
            .from('briefs')
            .select('*')
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .limit(5);
            
          setStats({
            briefs: 0,
            applications: applicationsCount?.length || 0,
            portfolioItems: portfolioCount?.length || 0,
          });
          
          setRecentApplications(applications || []);
          setRecentBriefs(briefs || []);
        }
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user && profile) {
      fetchDashboardData();
    }
  }, [user, profile]);
  
  if (!profile) return null;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        {profile.role === 'brand' ? (
          <Link href="/dashboard/briefs/create">
            <Button>
              Create Brief
            </Button>
          </Link>
        ) : (
          <Link href="/dashboard/discover">
            <Button>
              Find Briefs
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {profile.role === 'brand' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Briefs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.briefs}</div>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {profile.role === 'brand' ? 'Applications Received' : 'Applications Submitted'}
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.applications}</div>
          </CardContent>
        </Card>

        {profile.role === 'creator' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Portfolio Items</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.portfolioItems}</div>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {profile.role === 'brand' ? (
            <TabsTrigger value="applications">Recent Applications</TabsTrigger>
          ) : (
            <TabsTrigger value="briefs">Discover Briefs</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {profile.role === 'brand' ? 'Your Recent Briefs' : 'Your Recent Applications'}
              </CardTitle>
              <CardDescription>
                {profile.role === 'brand' 
                  ? 'Content briefs you have created recently' 
                  : 'Briefs you have applied to recently'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {profile.role === 'brand' ? (
                  recentBriefs.length > 0 ? (
                    recentBriefs.map((brief) => (
                      <div key={brief.id} className="flex items-center justify-between p-3 border rounded-md">
                        <div>
                          <div className="font-medium">{brief.title}</div>
                          <div className="text-sm text-muted-foreground">
                            Posted: {new Date(brief.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <Link href={`/dashboard/briefs/${brief.id}`}>
                          <Button variant="ghost" size="sm">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground">No briefs created yet</p>
                      <Button variant="outline" className="mt-2" asChild>
                        <Link href="/dashboard/briefs/create">Create Your First Brief</Link>
                      </Button>
                    </div>
                  )
                ) : (
                  recentApplications.length > 0 ? (
                    recentApplications.map((application) => (
                      <div key={application.id} className="flex items-center justify-between p-3 border rounded-md">
                        <div>
                          <div className="font-medium">
                            {application.briefs?.title}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Status: {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </div>
                        </div>
                        <Link href={`/dashboard/applications/${application.id}`}>
                          <Button variant="ghost" size="sm">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground">No applications submitted yet</p>
                      <Button variant="outline" className="mt-2" asChild>
                        <Link href="/dashboard/discover">Discover Briefs</Link>
                      </Button>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>
                Recent applications from creators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentApplications.length > 0 ? (
                  recentApplications.map((application) => (
                    <div key={application.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <div className="font-medium">
                          Application for: {application.briefs?.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          From: {application.creators?.name}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="mr-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            application.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : application.status === 'accepted'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </span>
                        </div>
                        <Link href={`/dashboard/applications/${application.id}`}>
                          <Button variant="ghost" size="sm">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No applications received yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="briefs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Discover Briefs</CardTitle>
              <CardDescription>
                Find opportunities to collaborate with brands
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentBriefs.length > 0 ? (
                  recentBriefs.map((brief) => (
                    <div key={brief.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <div className="font-medium">{brief.title}</div>
                        <div className="text-sm text-muted-foreground">
                          Budget: ${brief.budget} • Deadline: {new Date(brief.deadline).toLocaleDateString()}
                        </div>
                      </div>
                      <Link href={`/dashboard/discover/${brief.id}`}>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No briefs available at the moment</p>
                  </div>
                )}
                
                <div className="mt-4">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/dashboard/discover">View All Available Briefs</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}