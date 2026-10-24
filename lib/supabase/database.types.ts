// Types TypeScript du schéma Supabase (projet de test « lespetitspas »).
// À garder synchronisé avec la base : mêmes noms de tables et de colonnes.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Role = "staff" | "parent"
export type Section = "bebes" | "moyens" | "grands"
export type EventType = "repas" | "sieste" | "activite" | "medicament" | "incident"
export type AuthorizationSource = "application" | "papier"
export type MessageStatus = "nouveau" | "traité"

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          role: Role
          created_at: string
        }
        Insert: {
          id: string
          first_name: string
          last_name: string
          email: string
          role: Role
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>
        Relationships: []
      }
      children: {
        Row: {
          id: string
          first_name: string
          last_name: string
          birth_date: string
          section: Section
          photo_url: string | null
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          birth_date: string
          section: Section
          photo_url?: string | null
        }
        Update: Partial<Database["public"]["Tables"]["children"]["Insert"]>
        Relationships: []
      }
      parent_children: {
        Row: {
          parent_id: string
          child_id: string
        }
        Insert: {
          parent_id: string
          child_id: string
        }
        Update: Partial<Database["public"]["Tables"]["parent_children"]["Insert"]>
        Relationships: [
          {
            foreignKeyName: "parent_children_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_children_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          id: string
          child_id: string
          type: EventType
          occurred_at: string
          details: Json
          created_by: string
          created_at: string
          // Obligatoire quand type = 'medicament' (contrôlé par la base).
          authorization_id: string | null
        }
        Insert: {
          id?: string
          child_id: string
          type: EventType
          occurred_at: string
          details?: Json
          created_by: string
          created_at?: string
          authorization_id?: string | null
        }
        Update: Partial<Database["public"]["Tables"]["events"]["Insert"]>
        Relationships: [
          {
            foreignKeyName: "events_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_authorization_id_fkey"
            columns: ["authorization_id"]
            isOneToOne: false
            referencedRelation: "medication_authorizations"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_authorizations: {
        Row: {
          id: string
          child_id: string
          medication_name: string
          dose: string
          start_date: string
          end_date: string
          source: AuthorizationSource
          recorded_by: string
          created_at: string
        }
        Insert: {
          id?: string
          child_id: string
          medication_name: string
          dose: string
          start_date: string
          end_date: string
          source: AuthorizationSource
          recorded_by: string
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["medication_authorizations"]["Insert"]>
        Relationships: [
          {
            foreignKeyName: "medication_authorizations_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_authorizations_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          id: string
          child_id: string
          parent_id: string
          // 500 caractères maximum (contrôlé par la base).
          content: string
          status: MessageStatus
          created_at: string
          handled_by: string | null
          handled_at: string | null
        }
        Insert: {
          id?: string
          child_id: string
          parent_id: string
          content: string
          status?: MessageStatus
          created_at?: string
          handled_by?: string | null
          handled_at?: string | null
        }
        Update: Partial<Database["public"]["Tables"]["messages"]["Insert"]>
        Relationships: [
          {
            foreignKeyName: "messages_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_handled_by_fkey"
            columns: ["handled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

type Tables = Database["public"]["Tables"]

// Raccourcis pratiques : Profile, Child, Event, etc.
export type Profile = Tables["profiles"]["Row"]
export type Child = Tables["children"]["Row"]
export type ParentChild = Tables["parent_children"]["Row"]
export type Event = Tables["events"]["Row"]
export type MedicationAuthorization = Tables["medication_authorizations"]["Row"]
export type Message = Tables["messages"]["Row"]
