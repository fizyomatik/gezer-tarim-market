// Generated from all migrations by npm run db:types. Do not edit by hand.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          sort_order: number;
          is_active: boolean;
          description: string;
          image_path: string | null;
          image_fallback: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          sort_order?: number;
          is_active?: boolean;
          description?: string;
          image_path?: string | null;
          image_fallback?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          sort_order?: number;
          is_active?: boolean;
          description?: string;
          image_path?: string | null;
          image_fallback?: string;
        };
        Relationships: [
        ];
      };
      company_settings: {
        Row: {
          id: boolean;
          company_name: string;
          address: string;
          phone: string;
          email: string;
          whatsapp: string;
          hours: string;
          map_url: string;
          updated_at: string;
        };
        Insert: {
          id?: boolean;
          company_name: string;
          address: string;
          phone: string;
          email: string;
          whatsapp: string;
          hours: string;
          map_url: string;
          updated_at?: string;
        };
        Update: {
          id?: boolean;
          company_name?: string;
          address?: string;
          phone?: string;
          email?: string;
          whatsapp?: string;
          hours?: string;
          map_url?: string;
          updated_at?: string;
        };
        Relationships: [
        ];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          storage_path: string;
          alt_text: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          storage_path: string;
          alt_text?: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          storage_path?: string;
          alt_text?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          { foreignKeyName: "product_images_product_id_fkey"; columns: ["product_id"]; isOneToOne: false; referencedRelation: "products"; referencedColumns: ["id"] },
        ];
      };
      products: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          slug: string;
          brand: string;
          description: string;
          price: number | null;
          is_featured: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          name: string;
          slug: string;
          brand?: string;
          description?: string;
          price?: number | null;
          is_featured?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          name?: string;
          slug?: string;
          brand?: string;
          description?: string;
          price?: number | null;
          is_featured?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          { foreignKeyName: "products_category_id_fkey"; columns: ["category_id"]; isOneToOne: false; referencedRelation: "categories"; referencedColumns: ["id"] },
        ];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string;
          address: string;
          role: Database['public']['Enums']['user_role'];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          address?: string;
          role?: Database['public']['Enums']['user_role'];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          address?: string;
          role?: Database['public']['Enums']['user_role'];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
        ];
      };
      slides: {
        Row: {
          id: string;
          title: string;
          text: string;
          href: string;
          image_path: string;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          text?: string;
          href?: string;
          image_path: string;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          text?: string;
          href?: string;
          image_path?: string;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
        ];
      };
      storage_cleanup: {
        Row: {
          bucket: string;
          path: string;
          ready_at: string;
          processing: boolean;
        };
        Insert: {
          bucket: string;
          path: string;
          ready_at?: string;
          processing?: boolean;
        };
        Update: {
          bucket?: string;
          path?: string;
          ready_at?: string;
          processing?: boolean;
        };
        Relationships: [
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      claim_storage_cleanup: { Args: Record<PropertyKey, never>; Returns: { bucket: string; path: string }[] };
      commit_upload: { Args: { media_bucket: string | null; media_path: string | null }; Returns: undefined };
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      save_category: { Args: { category_id: string | null; category_name: string | null; category_description: string | null; media_path: string | null; display_order: number | null; active: boolean | null }; Returns: string };
      save_product: { Args: { product_id: string | null; product_name: string | null; product_brand: string | null; product_description: string | null; product_price: number | null; category_slug: string | null; featured: boolean | null; active: boolean | null; image_paths: string[] | null }; Returns: string };
      save_slide: { Args: { slide_id: string | null; slide_title: string | null; slide_text: string | null; slide_href: string | null; media_path: string | null; display_order: number | null; active: boolean | null }; Returns: string };
    };
    Enums: {
      user_role: "customer" | "admin";
    };
    CompositeTypes: { [_ in never]: never };
  };
};
