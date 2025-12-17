Need to install the following packages:
supabase@2.67.2
Ok to proceed? (y) 
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          applied_date: string
          cover_letter: string | null
          id: string
          included_sections: Json | null
          internship_id: string
          offer_decision: Database["public"]["Enums"]["offfer_decision"]
          profile_match_score: number | null
          status: Database["public"]["Enums"]["application_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          applied_date?: string
          cover_letter?: string | null
          id?: string
          included_sections?: Json | null
          internship_id: string
          offer_decision?: Database["public"]["Enums"]["offfer_decision"]
          profile_match_score?: number | null
          status?: Database["public"]["Enums"]["application_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          applied_date?: string
          cover_letter?: string | null
          id?: string
          included_sections?: Json | null
          internship_id?: string
          offer_decision?: Database["public"]["Enums"]["offfer_decision"]
          profile_match_score?: number | null
          status?: Database["public"]["Enums"]["application_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_internship_id_fkey"
            columns: ["internship_id"]
            isOneToOne: false
            referencedRelation: "internships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          completion_date: string | null
          course_id: string
          created_at: string
          enrollment_date: string
          id: string
          progress: number | null
          status: Database["public"]["Enums"]["enrollment_status"]
          student_id: string
        }
        Insert: {
          completion_date?: string | null
          course_id: string
          created_at?: string
          enrollment_date?: string
          id?: string
          progress?: number | null
          status?: Database["public"]["Enums"]["enrollment_status"]
          student_id: string
        }
        Update: {
          completion_date?: string | null
          course_id?: string
          created_at?: string
          enrollment_date?: string
          id?: string
          progress?: number | null
          status?: Database["public"]["Enums"]["enrollment_status"]
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string | null
          created_at: string
          created_by: string
          description: string | null
          difficulty_level: string | null
          duration: string | null
          enrolled_count: number | null
          id: string
          image_url: string | null
          is_suspended: boolean
          provider: string | null
          status: Database["public"]["Enums"]["course_status"]
          title: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          difficulty_level?: string | null
          duration?: string | null
          enrolled_count?: number | null
          id?: string
          image_url?: string | null
          is_suspended?: boolean
          provider?: string | null
          status?: Database["public"]["Enums"]["course_status"]
          title: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          difficulty_level?: string | null
          duration?: string | null
          enrolled_count?: number | null
          id?: string
          image_url?: string | null
          is_suspended?: boolean
          provider?: string | null
          status?: Database["public"]["Enums"]["course_status"]
          title?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      internships: {
        Row: {
          application_deadline: string | null
          application_url: string | null
          benefits: Json | null
          company_description: string | null
          company_email: string | null
          company_logo: string | null
          company_name: string
          created_at: string
          created_by: string
          description: string | null
          duration: string | null
          id: string
          is_paid: boolean | null
          job_type: Database["public"]["Enums"]["job_type"] | null
          language_requirements: Json | null
          location: string | null
          min_age_required: string | null
          payment: string | null
          posted_date: string | null
          requirements: Json | null
          responsibilities: Json | null
          skills_required: Json | null
          status: Database["public"]["Enums"]["internship_status"]
          title: string
          updated_at: string
        }
        Insert: {
          application_deadline?: string | null
          application_url?: string | null
          benefits?: Json | null
          company_description?: string | null
          company_email?: string | null
          company_logo?: string | null
          company_name: string
          created_at?: string
          created_by: string
          description?: string | null
          duration?: string | null
          id?: string
          is_paid?: boolean | null
          job_type?: Database["public"]["Enums"]["job_type"] | null
          language_requirements?: Json | null
          location?: string | null
          min_age_required?: string | null
          payment?: string | null
          posted_date?: string | null
          requirements?: Json | null
          responsibilities?: Json | null
          skills_required?: Json | null
          status?: Database["public"]["Enums"]["internship_status"]
          title: string
          updated_at?: string
        }
        Update: {
          application_deadline?: string | null
          application_url?: string | null
          benefits?: Json | null
          company_description?: string | null
          company_email?: string | null
          company_logo?: string | null
          company_name?: string
          created_at?: string
          created_by?: string
          description?: string | null
          duration?: string | null
          id?: string
          is_paid?: boolean | null
          job_type?: Database["public"]["Enums"]["job_type"] | null
          language_requirements?: Json | null
          location?: string | null
          min_age_required?: string | null
          payment?: string | null
          posted_date?: string | null
          requirements?: Json | null
          responsibilities?: Json | null
          skills_required?: Json | null
          status?: Database["public"]["Enums"]["internship_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "internships_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      interviews: {
        Row: {
          application_id: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          meeting_link: string
          scheduled_date: string
          status: string | null
          student_id: string
          title: string | null
          unit_id: string
          updated_at: string | null
        }
        Insert: {
          application_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          meeting_link: string
          scheduled_date: string
          status?: string | null
          student_id: string
          title?: string | null
          unit_id: string
          updated_at?: string | null
        }
        Update: {
          application_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          meeting_link?: string
          scheduled_date?: string
          status?: string | null
          student_id?: string
          title?: string | null
          unit_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interviews_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_receiver_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_sender_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          allow_all: boolean
          application_status_email: boolean
          application_status_in_app: boolean
          created_at: string
          id: string
          internship_updates_email: boolean
          internship_updates_in_app: boolean
          recommended_courses_email: boolean
          recommended_courses_in_app: boolean
          recommended_internship_email: boolean
          recommended_internship_in_app: boolean
          similar_internships_email: boolean
          similar_internships_in_app: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          allow_all?: boolean
          application_status_email?: boolean
          application_status_in_app?: boolean
          created_at?: string
          id?: string
          internship_updates_email?: boolean
          internship_updates_in_app?: boolean
          recommended_courses_email?: boolean
          recommended_courses_in_app?: boolean
          recommended_internship_email?: boolean
          recommended_internship_in_app?: boolean
          similar_internships_email?: boolean
          similar_internships_in_app?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          allow_all?: boolean
          application_status_email?: boolean
          application_status_in_app?: boolean
          created_at?: string
          id?: string
          internship_updates_email?: boolean
          internship_updates_in_app?: boolean
          recommended_courses_email?: boolean
          recommended_courses_in_app?: boolean
          recommended_internship_email?: boolean
          recommended_internship_in_app?: boolean
          similar_internships_email?: boolean
          similar_internships_in_app?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_id: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          related_id?: string | null
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          related_id?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          date_of_birth: string | null
          deactivated_at: string | null
          email: string | null
          full_name: string
          gender: string | null
          id: string
          is_suspended: boolean
          onboarding_completed: boolean | null
          phone: string | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          deactivated_at?: string | null
          email?: string | null
          full_name: string
          gender?: string | null
          id?: string
          is_suspended?: boolean
          onboarding_completed?: boolean | null
          phone?: string | null
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          deactivated_at?: string | null
          email?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          is_suspended?: boolean
          onboarding_completed?: boolean | null
          phone?: string | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_internships: {
        Row: {
          created_at: string
          id: string
          internship_id: string
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          internship_id: string
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          internship_id?: string
          student_id?: string
        }
        Relationships: []
      }
      student_profiles: {
        Row: {
          achievements: Json | null
          avatar_url: string | null
          banner_url: string | null
          behance_url: string | null
          bio: string[] | null
          completed_courses: Json | null
          cover_letter: string | null
          created_at: string
          dribbble_url: string | null
          education: Json | null
          experience_level: string | null
          has_career_break: boolean | null
          headline: string | null
          id: string
          interests: Json | null
          internships: Json | null
          is_differently_abled: boolean | null
          languages: Json | null
          linkedin_url: string | null
          links: Json | null
          location: string | null
          looking_for: string[] | null
          marital_status: string | null
          portfolio_url: string | null
          preferred_language: string | null
          profile_id: string
          profile_type: string | null
          projects: Json | null
          resume_url: string | null
          skills: Json | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          achievements?: Json | null
          avatar_url?: string | null
          banner_url?: string | null
          behance_url?: string | null
          bio?: string[] | null
          completed_courses?: Json | null
          cover_letter?: string | null
          created_at?: string
          dribbble_url?: string | null
          education?: Json | null
          experience_level?: string | null
          has_career_break?: boolean | null
          headline?: string | null
          id?: string
          interests?: Json | null
          internships?: Json | null
          is_differently_abled?: boolean | null
          languages?: Json | null
          linkedin_url?: string | null
          links?: Json | null
          location?: string | null
          looking_for?: string[] | null
          marital_status?: string | null
          portfolio_url?: string | null
          preferred_language?: string | null
          profile_id: string
          profile_type?: string | null
          projects?: Json | null
          resume_url?: string | null
          skills?: Json | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          achievements?: Json | null
          avatar_url?: string | null
          banner_url?: string | null
          behance_url?: string | null
          bio?: string[] | null
          completed_courses?: Json | null
          cover_letter?: string | null
          created_at?: string
          dribbble_url?: string | null
          education?: Json | null
          experience_level?: string | null
          has_career_break?: boolean | null
          headline?: string | null
          id?: string
          interests?: Json | null
          internships?: Json | null
          is_differently_abled?: boolean | null
          languages?: Json | null
          linkedin_url?: string | null
          links?: Json | null
          location?: string | null
          looking_for?: string[] | null
          marital_status?: string | null
          portfolio_url?: string | null
          preferred_language?: string | null
          profile_id?: string
          profile_type?: string | null
          projects?: Json | null
          resume_url?: string | null
          skills?: Json | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_tasks: {
        Row: {
          application_id: string
          color: string | null
          created_at: string
          description: string | null
          end_date: string | null
          end_time: string | null
          id: string
          review_remarks: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          start_date: string | null
          start_time: string | null
          status: Database["public"]["Enums"]["task_status"]
          student_id: string
          submission_link: string | null
          submitted_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          application_id: string
          color?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          id?: string
          review_remarks?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          student_id: string
          submission_link?: string | null
          submitted_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          application_id?: string
          color?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          id?: string
          review_remarks?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          student_id?: string
          submission_link?: string | null
          submitted_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_tasks_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_tasks_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_tasks_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          address: string | null
          avatar_url: string | null
          banner_url: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          focus_areas: Json | null
          gallery_images: Json | null
          glimpse: Json | null
          id: string
          industry: string | null
          is_aurovillian: boolean | null
          is_suspended: boolean
          mission: string | null
          opportunities_offered: Json | null
          profile_id: string
          projects: Json | null
          skills_offered: Json | null
          social_links: Json | null
          unit_name: string | null
          unit_type: string | null
          updated_at: string
          values: string | null
          website_url: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          focus_areas?: Json | null
          gallery_images?: Json | null
          glimpse?: Json | null
          id?: string
          industry?: string | null
          is_aurovillian?: boolean | null
          is_suspended?: boolean
          mission?: string | null
          opportunities_offered?: Json | null
          profile_id: string
          projects?: Json | null
          skills_offered?: Json | null
          social_links?: Json | null
          unit_name?: string | null
          unit_type?: string | null
          updated_at?: string
          values?: string | null
          website_url?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          focus_areas?: Json | null
          gallery_images?: Json | null
          glimpse?: Json | null
          id?: string
          industry?: string | null
          is_aurovillian?: boolean | null
          is_suspended?: boolean
          mission?: string | null
          opportunities_offered?: Json | null
          profile_id?: string
          projects?: Json | null
          skills_offered?: Json | null
          social_links?: Json | null
          unit_name?: string | null
          unit_type?: string | null
          updated_at?: string
          values?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "units_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      close_expired_internships: { Args: never; Returns: undefined }
      create_unit: {
        Args: {
          p_address: string
          p_contact_email: string
          p_contact_phone: string
          p_description: string
          p_industry: string
          p_is_aurovillian: boolean
          p_unit_name: string
          p_user_id: string
        }
        Returns: string
      }
      is_admin: { Args: never; Returns: boolean }
      is_unit_user: { Args: never; Returns: boolean }
      should_send_notification: {
        Args: {
          p_channel: string
          p_notification_type: string
          p_user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "student" | "unit" | "admin"
      application_status:
        | "applied"
        | "shortlisted"
        | "rejected"
        | "interviewed"
        | "hired"
      course_status: "active" | "inactive" | "draft"
      enrollment_status: "enrolled" | "completed" | "dropped"
      internship_status: "active" | "closed" | "draft"
      job_type: "part_time" | "full_time" | "both"
      offfer_decision: "pending" | "accepted" | "rejected"
      task_status: "pending" | "submitted" | "redo" | "accepted"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["student", "unit", "admin"],
      application_status: [
        "applied",
        "shortlisted",
        "rejected",
        "interviewed",
        "hired",
      ],
      course_status: ["active", "inactive", "draft"],
      enrollment_status: ["enrolled", "completed", "dropped"],
      internship_status: ["active", "closed", "draft"],
      job_type: ["part_time", "full_time", "both"],
      offfer_decision: ["pending", "accepted", "rejected"],
      task_status: ["pending", "submitted", "redo", "accepted"],
    },
  },
} as const
