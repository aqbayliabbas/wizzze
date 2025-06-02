import { createClient } from '@supabase/supabase-js';

// These env variables need to be set in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'brand' | 'creator';

export interface UserProfile {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
}

export interface BrandProfile extends UserProfile {
  company_name: string;
  industry: string;
  website?: string;
  description?: string;
}

export interface CreatorProfile extends UserProfile {
  bio?: string;
  specialties?: string[];
  social_links?: Record<string, string>;
  portfolio_items?: PortfolioItem[];
}

export interface PortfolioItem {
  id: string;
  creator_id: string;
  title: string;
  description?: string;
  media_url: string;
  media_type: 'image' | 'video';
  created_at: string;
}

export interface Brief {
  id: string;
  brand_id: string;
  title: string;
  description: string;
  requirements: string;
  budget: number;
  deadline: string;
  status: 'draft' | 'published' | 'closed';
  created_at: string;
}

export interface Application {
  id: string;
  brief_id: string;
  creator_id: string;
  proposal: string;
  portfolio_items?: string[]; // IDs of relevant portfolio items
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}