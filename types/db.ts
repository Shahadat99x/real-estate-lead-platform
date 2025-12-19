// Lightweight hand-written Supabase types; keep in sync with the SQL schema.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: 'ADMIN' | 'AGENT';
          full_name: string | null;
          email: string | null;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: 'ADMIN' | 'AGENT';
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: 'ADMIN' | 'AGENT';
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      agents: {
        Row: {
          id: string;
          display_name: string;
          bio: string | null;
          languages: string[];
          service_areas: string[];
          is_active: boolean;
          public_slug: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          bio?: string | null;
          languages?: string[];
          service_areas?: string[];
          is_active?: boolean;
          public_slug: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          bio?: string | null;
          languages?: string[];
          service_areas?: string[];
          is_active?: boolean;
          public_slug?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      listings: {
        Row: {
          id: string;
          agent_id: string;
          title: string;
          description: string | null;
          purpose: 'BUY' | 'RENT';
          property_type:
          | 'APARTMENT'
          | 'HOUSE'
          | 'STUDIO'
          | 'TOWNHOUSE'
          | 'VILLA'
          | 'LAND';
          status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
          price: number;
          currency: string;
          city: string;
          address: string | null;
          bedrooms: number | null;
          bathrooms: number | null;
          area_sqm: string | null; // numeric in Postgres
          lat: string | null; // numeric in Postgres
          lng: string | null; // numeric in Postgres
          featured: boolean;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          agent_id: string;
          title: string;
          description?: string | null;
          purpose: 'BUY' | 'RENT';
          property_type?:
          | 'APARTMENT'
          | 'HOUSE'
          | 'STUDIO'
          | 'TOWNHOUSE'
          | 'VILLA'
          | 'LAND';
          status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
          price: number;
          currency?: string;
          city: string;
          address?: string | null;
          bedrooms?: number | null;
          bathrooms?: number | null;
          area_sqm?: string | null;
          lat?: string | null;
          lng?: string | null;
          featured?: boolean;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          agent_id?: string;
          title?: string;
          description?: string | null;
          purpose?: 'BUY' | 'RENT';
          property_type?:
          | 'APARTMENT'
          | 'HOUSE'
          | 'STUDIO'
          | 'TOWNHOUSE'
          | 'VILLA'
          | 'LAND';
          status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
          price?: number;
          currency?: string;
          city?: string;
          address?: string | null;
          bedrooms?: number | null;
          bathrooms?: number | null;
          area_sqm?: string | null;
          lat?: string | null;
          lng?: string | null;
          featured?: boolean;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      listing_images: {
        Row: {
          id: string;
          listing_id: string;
          url: string;
          public_id: string | null;
          sort_order: number;
          alt_text: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          url: string;
          public_id?: string | null;
          sort_order?: number;
          alt_text?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string;
          url?: string;
          public_id?: string | null;
          sort_order?: number;
          alt_text?: string | null;
          created_at?: string;
        };
      };
      leads: {
        Row: {
          id: string;
          listing_id: string;
          name: string;
          email: string;
          phone: string | null;
          message: string;
          source: string | null;
          status: 'NEW' | 'CONTACTED' | 'CLOSED' | 'ARCHIVED';
          notes: string | null;
          last_contacted_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          name: string;
          email: string;
          phone?: string | null;
          message: string;
          source?: string | null;
          status?: 'NEW' | 'CONTACTED' | 'CLOSED' | 'ARCHIVED';
          notes?: string | null;
          last_contacted_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          message?: string;
          source?: string | null;
          status?: 'NEW' | 'CONTACTED' | 'CLOSED' | 'ARCHIVED';
          notes?: string | null;
          last_contacted_at?: string | null;
          created_at?: string;
        };
      };
      blog_posts: {
        Row: {
          id: string;
          author_id: string | null;
          title: string;
          slug: string;
          excerpt: string | null;
          content_md: string;
          cover_image_url: string | null;
          status: 'DRAFT' | 'PUBLISHED';
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id?: string | null;
          title: string;
          slug: string;
          excerpt?: string | null;
          content_md: string;
          cover_image_url?: string | null;
          status?: 'DRAFT' | 'PUBLISHED';
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string | null;
          title?: string;
          slug?: string;
          excerpt?: string | null;
          content_md?: string;
          cover_image_url?: string | null;
          status?: 'DRAFT' | 'PUBLISHED';
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_user_id: {
        Args: Record<string, never>;
        Returns: string | null;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type ProfilesRow = Database['public']['Tables']['profiles']['Row'];
export type AgentsRow = Database['public']['Tables']['agents']['Row'];
export type ListingsRow = Database['public']['Tables']['listings']['Row'];
export type ListingImagesRow = Database['public']['Tables']['listing_images']['Row'];
export type LeadsRow = Database['public']['Tables']['leads']['Row'];
export type BlogPostRow = Database['public']['Tables']['blog_posts']['Row'];
export type Role = ProfilesRow['role'];
