'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

export default function EditBrief() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    budget: 0,
    deadline: '',
    status: 'draft',
  });
  
  useEffect(() => {
    const fetchBrief = async () => {
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
        
        // Format the date for the date input (YYYY-MM-DD)
        const formattedDate = new Date(data.deadline).toISOString().split('T')[0];
        
        setFormData({
          title: data.title,
          description: data.description,
          requirements: data.requirements,
          budget: data.budget,
          deadline: formattedDate,
          status: data.status,
        });
        
      } catch (error) {
        console.error('Error fetching brief:', error);
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
      fetchBrief();
    }
  }, [id, user, router, toast]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      status: value,
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Not authenticated',
        description: 'Please log in to update a brief',
        variant: 'destructive',
      });
      return;
    }
    
    if (!formData.title || !formData.description || !formData.requirements || formData.budget <= 0 || !formData.deadline) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from('briefs')
        .update({
          title: formData.title,
          description: formData.description,
          requirements: formData.requirements,
          budget: formData.budget,
          deadline: new Date(formData.deadline).toISOString(),
          status: formData.status,
        })
        .eq('id', id)
        .eq('brand_id', user.id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Brief updated',
        description: 'Your brief has been updated successfully',
      });
      
      router.push(`/dashboard/briefs/${id}`);
      
    } catch (error: any) {
      console.error('Error updating brief:', error);
      toast({
        title: 'Error updating brief',
        description: error.message || 'An unexpected error occurred',
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
  
  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      <div>
        <h1 className="text-3xl font-bold">Edit Brief</h1>
        <p className="text-muted-foreground">
          Update the details of your content brief
        </p>
      </div>
      
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Brief Details</CardTitle>
            <CardDescription>
              Provide detailed information to help creators understand your needs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Brief Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Product Unboxing Video for New Headphones"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Brief Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what you're looking for and provide context for the creators"
                rows={5}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                placeholder="Specific requirements, deliverables, or technical specifications"
                rows={4}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget ($)</Label>
                <Input
                  id="budget"
                  name="budget"
                  type="number"
                  min={0}
                  step={0.01}
                  value={formData.budget || ''}
                  onChange={handleChange}
                  placeholder="e.g., 200"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  name="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Draft briefs are saved but not visible to creators. Published briefs are visible and can receive applications. Closed briefs are no longer accepting applications.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => router.push(`/dashboard/briefs/${id}`)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}