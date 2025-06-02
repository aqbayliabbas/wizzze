'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { supabase, Brief } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { INDUSTRIES } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { Search, Calendar, DollarSign } from 'lucide-react';

export default function DiscoverBriefs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [loading, setLoading] = useState(true);
  const [appliedBriefs, setAppliedBriefs] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    industry: '',
    minBudget: '',
  });
  
  useEffect(() => {
    const fetchBriefs = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch published briefs
        let query = supabase
          .from('briefs')
          .select(`
            *,
            brand_profiles:brand_id(
              id,
              company_name,
              industry
            )
          `)
          .eq('status', 'published');
          
        const { data, error } = await query;
          
        if (error) {
          throw error;
        }
        
        // Fetch user's applications to know which briefs they've already applied to
        const { data: applications, error: applicationsError } = await supabase
          .from('applications')
          .select('brief_id')
          .eq('creator_id', user.id);
          
        if (applicationsError) {
          console.error('Error fetching applications:', applicationsError);
        } else {
          setAppliedBriefs(applications.map(app => app.brief_id));
        }
        
        setBriefs(data || []);
        
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
  
  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const filteredBriefs = briefs.filter(brief => {
    // Apply search filter
    if (filters.search && !brief.title.toLowerCase().includes(filters.search.toLowerCase()) && 
        !brief.description.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    // Apply industry filter (if any)
    if (filters.industry && brief.brand_profiles.industry !== filters.industry) {
      return false;
    }
    
    // Apply min budget filter (if any)
    if (filters.minBudget && brief.budget < parseFloat(filters.minBudget)) {
      return false;
    }
    
    return true;
  });
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Discover Briefs</h1>
        <p className="text-muted-foreground">
          Find content creation opportunities with brands
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Filter Opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by keyword"
                className="pl-9"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            
            <Select
              value={filters.industry}
              onValueChange={(value) => handleFilterChange('industry', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All industries</SelectItem>
                {INDUSTRIES.map((industry) => (
                  <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Minimum budget"
                className="pl-9"
                type="number"
                min={0}
                value={filters.minBudget}
                onChange={(e) => handleFilterChange('minBudget', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {loading ? (
        <div className="flex justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredBriefs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBriefs.map((brief) => (
            <Card key={brief.id} className="flex flex-col h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="line-clamp-2">{brief.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {brief.brand_profiles.company_name}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{brief.brand_profiles.industry}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {brief.description}
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>${brief.budget}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(brief.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                {appliedBriefs.includes(brief.id) ? (
                  <Button variant="secondary\" className="w-full\" disabled>
                    Already Applied
                  </Button>
                ) : (
                  <Button className="w-full" asChild>
                    <Link href={`/dashboard/discover/${brief.id}`}>
                      View Details
                    </Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <p className="text-muted-foreground mb-4">No briefs found matching your filters</p>
            <Button variant="outline" onClick={() => setFilters({ search: '', industry: '', minBudget: '' })}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}