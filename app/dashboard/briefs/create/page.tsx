'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function CreateBrief() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    budget: 0,
    deadline: '',
    status: 'draft',
  });
  
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
        description: 'Please log in to create a brief',
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
      setLoading(true);
      
      const { data, error } = await supabase
        .from('briefs')
        .insert({
          brand_id: user.id,
          title: formData.title,
          description: formData.description,
          requirements: formData.requirements,
          budget: formData.budget,
          deadline: new Date(formData.deadline).toISOString(),
          status: formData.status,
        })
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Brief created',
        description: `Your brief "${formData.title}" has been created successfully`,
      });
      
      router.push('/dashboard/briefs');
      
    } catch (error: any) {
      console.error('Error creating brief:', error);
      toast({
        title: 'Error creating brief',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Brief</h1>
        <p className="text-muted-foreground">
          Describe what content you need from creators
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
                  min={new Date().toISOString().split('T')[0]}
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
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Draft briefs are saved but not visible to creators. Published briefs are visible and can receive applications.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Brief'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}