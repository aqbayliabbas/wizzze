'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase, UserRole } from '@/lib/supabase/client';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { INDUSTRIES, CREATOR_SPECIALTIES } from '@/lib/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function SignUp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') as UserRole || 'creator';
  const [role, setRole] = useState<UserRole>(defaultRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !name || (role === 'brand' && !companyName)) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError || !authData.user) {
        throw authError || new Error('Failed to create account');
      }
      
      // 2. Create profile record
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          role,
          name,
          email,
        });
      
      if (profileError) {
        throw profileError;
      }
      
      // 3. Create role-specific profile
      if (role === 'brand') {
        const { error: brandError } = await supabase
          .from('brand_profiles')
          .insert({
            id: authData.user.id,
            company_name: companyName,
            industry,
          });
          
        if (brandError) {
          throw brandError;
        }
      } else {
        const { error: creatorError } = await supabase
          .from('creator_profiles')
          .insert({
            id: authData.user.id,
          });
          
        if (creatorError) {
          throw creatorError;
        }
      }
      
      toast({
        title: 'Account created!',
        description: 'Your account has been created successfully.',
      });
      
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast({
        title: 'Error creating account',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <SiteHeader />
      <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] py-12">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Sign up</CardTitle>
              <CardDescription>
                Create an account to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp}>
                <Tabs defaultValue={role} onValueChange={(value) => setRole(value as UserRole)} className="w-full mb-6">
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="brand">I'm a Brand</TabsTrigger>
                    <TabsTrigger value="creator">I'm a Creator</TabsTrigger>
                  </TabsList>
                  <TabsContent value="brand" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Input 
                        id="name" 
                        placeholder="John Doe" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company Name</Label>
                      <Input 
                        id="company" 
                        placeholder="Acme Inc" 
                        value={companyName} 
                        onChange={(e) => setCompanyName(e.target.value)} 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Select value={industry} onValueChange={setIndustry}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          {INDUSTRIES.map((ind) => (
                            <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>
                  <TabsContent value="creator" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="creatorName">Your Name</Label>
                      <Input 
                        id="creatorName" 
                        placeholder="Jane Doe" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                      />
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="hello@example.com" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <div className="text-center w-full text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}