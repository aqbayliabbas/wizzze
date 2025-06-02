'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { INDUSTRIES, CREATOR_SPECIALTIES, SOCIAL_PLATFORMS } from '@/lib/constants';

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [brandProfile, setBrandProfile] = useState({
    companyName: '',
    industry: '',
    website: '',
    description: '',
  });
  const [creatorProfile, setCreatorProfile] = useState({
    bio: '',
    specialties: [] as string[],
    socialLinks: {} as Record<string, string>,
  });
  
  useEffect(() => {
    const fetchExtendedProfile = async () => {
      if (!user || !profile) return;
      
      try {
        if (profile.role === 'brand') {
          const { data, error } = await supabase
            .from('brand_profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (error) {
            console.error('Error fetching brand profile:', error);
            return;
          }
          
          if (data) {
            setBrandProfile({
              companyName: data.company_name || '',
              industry: data.industry || '',
              website: data.website || '',
              description: data.description || '',
            });
          }
        } else if (profile.role === 'creator') {
          const { data, error } = await supabase
            .from('creator_profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (error) {
            console.error('Error fetching creator profile:', error);
            return;
          }
          
          if (data) {
            setCreatorProfile({
              bio: data.bio || '',
              specialties: data.specialties || [],
              socialLinks: data.social_links || {},
            });
          }
        }
      } catch (error) {
        console.error('Error in profile fetch:', error);
      }
    };
    
    if (user && profile) {
      fetchExtendedProfile();
    }
  }, [user, profile]);
  
  const handleBrandProfileUpdate = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Update basic profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: profile?.name,
        })
        .eq('id', user.id);
        
      if (profileError) {
        throw profileError;
      }
      
      // Update brand-specific profile
      const { error: brandError } = await supabase
        .from('brand_profiles')
        .update({
          company_name: brandProfile.companyName,
          industry: brandProfile.industry,
          website: brandProfile.website,
          description: brandProfile.description,
        })
        .eq('id', user.id);
        
      if (brandError) {
        throw brandError;
      }
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
      });
      
      await refreshProfile();
      
    } catch (error: any) {
      console.error('Error updating brand profile:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreatorProfileUpdate = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Update basic profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: profile?.name,
        })
        .eq('id', user.id);
        
      if (profileError) {
        throw profileError;
      }
      
      // Update creator-specific profile
      const { error: creatorError } = await supabase
        .from('creator_profiles')
        .update({
          bio: creatorProfile.bio,
          specialties: creatorProfile.specialties,
          social_links: creatorProfile.socialLinks,
        })
        .eq('id', user.id);
        
      if (creatorError) {
        throw creatorError;
      }
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
      });
      
      await refreshProfile();
      
    } catch (error: any) {
      console.error('Error updating creator profile:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (!profile) return null;
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Your Profile</h1>
        <p className="text-muted-foreground">
          Manage your profile information
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={profile.name}
              onChange={(e) => {
                if (!profile) return;
                profile.name = e.target.value;
              }}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={profile.email}
              disabled
              readOnly
            />
            <p className="text-sm text-muted-foreground">
              Email cannot be changed
            </p>
          </div>
        </CardContent>
      </Card>
      
      {profile.role === 'brand' ? (
        <Card>
          <CardHeader>
            <CardTitle>Brand Details</CardTitle>
            <CardDescription>
              Information about your brand
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={brandProfile.companyName}
                onChange={(e) => setBrandProfile((prev) => ({
                  ...prev,
                  companyName: e.target.value,
                }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select
                value={brandProfile.industry}
                onValueChange={(value) => setBrandProfile((prev) => ({
                  ...prev,
                  industry: value,
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((industry) => (
                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={brandProfile.website}
                onChange={(e) => setBrandProfile((prev) => ({
                  ...prev,
                  website: e.target.value,
                }))}
                placeholder="https://www.example.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Brand Description</Label>
              <Textarea
                id="description"
                value={brandProfile.description}
                onChange={(e) => setBrandProfile((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))}
                placeholder="Tell creators about your brand"
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleBrandProfileUpdate} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Creator Profile</CardTitle>
              <CardDescription>
                Information about your creator services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={creatorProfile.bio}
                  onChange={(e) => setCreatorProfile((prev) => ({
                    ...prev,
                    bio: e.target.value,
                  }))}
                  placeholder="Tell brands about yourself and your content creation services"
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Specialties</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {CREATOR_SPECIALTIES.map((specialty) => (
                    <Button
                      key={specialty}
                      type="button"
                      size="sm"
                      variant={creatorProfile.specialties.includes(specialty) ? "default" : "outline"}
                      onClick={() => {
                        setCreatorProfile((prev) => {
                          const specialties = [...prev.specialties];
                          if (specialties.includes(specialty)) {
                            return {
                              ...prev,
                              specialties: specialties.filter((s) => s !== specialty),
                            };
                          } else {
                            return {
                              ...prev,
                              specialties: [...specialties, specialty],
                            };
                          }
                        });
                      }}
                    >
                      {specialty}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleCreatorProfileUpdate} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>
                Connect your social media profiles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {SOCIAL_PLATFORMS.map((platform) => (
                <div key={platform} className="space-y-2">
                  <Label htmlFor={`social-${platform.toLowerCase()}`}>{platform}</Label>
                  <Input
                    id={`social-${platform.toLowerCase()}`}
                    value={creatorProfile.socialLinks[platform.toLowerCase()] || ''}
                    onChange={(e) => setCreatorProfile((prev) => ({
                      ...prev,
                      socialLinks: {
                        ...prev.socialLinks,
                        [platform.toLowerCase()]: e.target.value,
                      },
                    }))}
                    placeholder={`Your ${platform} profile URL`}
                  />
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button onClick={handleCreatorProfileUpdate} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  );
}