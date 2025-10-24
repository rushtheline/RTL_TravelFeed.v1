// Auto-generated types from Supabase schema
// Generated on: 2025-10-22

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ads: {
        Row: {
          active: boolean | null
          airport_id: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          image_url: string | null
          link_url: string | null
          start_date: string | null
          terminal_id: string | null
          title: string
        }
        Insert: {
          active?: boolean | null
          airport_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          link_url?: string | null
          start_date?: string | null
          terminal_id?: string | null
          title: string
        }
        Update: {
          active?: boolean | null
          airport_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          link_url?: string | null
          start_date?: string | null
          terminal_id?: string | null
          title?: string
        }
      }
      airports: {
        Row: {
          city: string
          code: string
          country: string
          created_at: string | null
          id: string
          name: string
          timezone: string
        }
        Insert: {
          city: string
          code: string
          country: string
          created_at?: string | null
          id?: string
          name: string
          timezone: string
        }
        Update: {
          city?: string
          code?: string
          country?: string
          created_at?: string | null
          id?: string
          name?: string
          timezone?: string
        }
      }
      profiles: {
        Row: {
          avatar_url: string | null
          badge: Database['public']['Enums']['user_badge'] | null
          bio: string | null
          created_at: string | null
          current_airport_id: string | null
          current_terminal_id: string | null
          display_name: string | null
          id: string
          level: number | null
          role: Database['public']['Enums']['user_role'] | null
          updated_at: string | null
          username: string
          xp: number | null
        }
        Insert: {
          avatar_url?: string | null
          badge?: Database['public']['Enums']['user_badge'] | null
          bio?: string | null
          created_at?: string | null
          current_airport_id?: string | null
          current_terminal_id?: string | null
          display_name?: string | null
          id: string
          level?: number | null
          role?: Database['public']['Enums']['user_role'] | null
          updated_at?: string | null
          username: string
          xp?: number | null
        }
        Update: {
          avatar_url?: string | null
          badge?: Database['public']['Enums']['user_badge'] | null
          bio?: string | null
          created_at?: string | null
          current_airport_id?: string | null
          current_terminal_id?: string | null
          display_name?: string | null
          id?: string
          level?: number | null
          role?: Database['public']['Enums']['user_role'] | null
          updated_at?: string | null
          username?: string
          xp?: number | null
        }
      }
      posts: {
        Row: {
          airport_id: string | null
          category: Database['public']['Enums']['post_category']
          content: string
          created_at: string | null
          gate_id: string | null
          id: string
          is_pinned: boolean | null
          location_text: string | null
          media_type: string | null
          media_url: string | null
          terminal_id: string | null
          updated_at: string | null
          user_id: string | null
          xp_reward: number | null
        }
        Insert: {
          airport_id?: string | null
          category: Database['public']['Enums']['post_category']
          content: string
          created_at?: string | null
          gate_id?: string | null
          id?: string
          is_pinned?: boolean | null
          location_text?: string | null
          media_type?: string | null
          media_url?: string | null
          terminal_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          xp_reward?: number | null
        }
        Update: {
          airport_id?: string | null
          category?: Database['public']['Enums']['post_category']
          content?: string
          created_at?: string | null
          gate_id?: string | null
          id?: string
          is_pinned?: boolean | null
          location_text?: string | null
          media_type?: string | null
          media_url?: string | null
          terminal_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          xp_reward?: number | null
        }
      }
    }
    Enums: {
      post_category:
        | 'helpful_tip'
        | 'wait_time'
        | 'food'
        | 'gate_change'
        | 'tsa_update'
        | 'parking'
        | 'general'
      user_badge: 'road_warrior' | 'frequent_flyer' | 'elite_traveler'
      user_role: 'regular' | 'frequent_flyer' | 'staff'
    }
  }
}
