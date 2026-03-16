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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      ai_questions: {
        Row: {
          created_at: string | null
          grade: number | null
          id: string
          question: string
          response: string
          subject: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          grade?: number | null
          id?: string
          question: string
          response: string
          subject?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          grade?: number | null
          id?: string
          question?: string
          response?: string
          subject?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_private: boolean | null
          ai_answer_mode: string | null
          ai_assistance_level: string | null
          ai_personality: string | null
          allow_ai_data_usage: boolean | null
          autoplay_videos: boolean | null
          avatar_url: string | null
          comment_privacy: string | null
          content_difficulty: string | null
          created_at: string | null
          daily_time_goal: number | null
          display_name: string | null
          dyslexia_font: boolean | null
          email: string
          grade: number
          id: string
          language: string | null
          last_upload_date: string | null
          notification_ai_suggestions: boolean | null
          notification_comments: boolean | null
          notification_likes: boolean | null
          notification_reminders: boolean | null
          notifications_enabled: boolean | null
          search_visible: boolean | null
          show_xp_in_leaderboard: boolean
          subjects: Json
          subscription_plan: string | null
          subtitles_enabled: boolean | null
          text_size: string | null
          updated_at: string | null
          upload_count_today: number | null
          upload_quality: string | null
          username: string | null
        }
        Insert: {
          account_private?: boolean | null
          ai_answer_mode?: string | null
          ai_assistance_level?: string | null
          ai_personality?: string | null
          allow_ai_data_usage?: boolean | null
          autoplay_videos?: boolean | null
          avatar_url?: string | null
          comment_privacy?: string | null
          content_difficulty?: string | null
          created_at?: string | null
          daily_time_goal?: number | null
          display_name?: string | null
          dyslexia_font?: boolean | null
          email: string
          grade: number
          id: string
          language?: string | null
          last_upload_date?: string | null
          notification_ai_suggestions?: boolean | null
          notification_comments?: boolean | null
          notification_likes?: boolean | null
          notification_reminders?: boolean | null
          notifications_enabled?: boolean | null
          search_visible?: boolean | null
          show_xp_in_leaderboard?: boolean
          subjects: Json
          subscription_plan?: string | null
          subtitles_enabled?: boolean | null
          text_size?: string | null
          updated_at?: string | null
          upload_count_today?: number | null
          upload_quality?: string | null
          username?: string | null
        }
        Update: {
          account_private?: boolean | null
          ai_answer_mode?: string | null
          ai_assistance_level?: string | null
          ai_personality?: string | null
          allow_ai_data_usage?: boolean | null
          autoplay_videos?: boolean | null
          avatar_url?: string | null
          comment_privacy?: string | null
          content_difficulty?: string | null
          created_at?: string | null
          daily_time_goal?: number | null
          display_name?: string | null
          dyslexia_font?: boolean | null
          email?: string
          grade?: number
          id?: string
          language?: string | null
          last_upload_date?: string | null
          notification_ai_suggestions?: boolean | null
          notification_comments?: boolean | null
          notification_likes?: boolean | null
          notification_reminders?: boolean | null
          notifications_enabled?: boolean | null
          search_visible?: boolean | null
          show_xp_in_leaderboard?: boolean
          subjects?: Json
          subscription_plan?: string | null
          subtitles_enabled?: boolean | null
          text_size?: string | null
          updated_at?: string | null
          upload_count_today?: number | null
          upload_quality?: string | null
          username?: string | null
        }
        Relationships: []
      }
      saved_videos: {
        Row: {
          created_at: string | null
          id: string
          user_id: string
          video_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_id: string
          video_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_videos_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stats: {
        Row: {
          created_at: string | null
          day_streak: number | null
          id: string
          last_login: string | null
          questions_asked: number | null
          updated_at: string | null
          user_id: string
          xp_points: number | null
        }
        Insert: {
          created_at?: string | null
          day_streak?: number | null
          id?: string
          last_login?: string | null
          questions_asked?: number | null
          updated_at?: string | null
          user_id: string
          xp_points?: number | null
        }
        Update: {
          created_at?: string | null
          day_streak?: number | null
          id?: string
          last_login?: string | null
          questions_asked?: number | null
          updated_at?: string | null
          user_id?: string
          xp_points?: number | null
        }
        Relationships: []
      }
      videos: {
        Row: {
          ai_generated: boolean | null
          comments: number | null
          created_at: string | null
          creator_id: string | null
          duration: number | null
          grade: number
          id: string
          likes: number | null
          subject: string
          thumbnail: string | null
          title: string
          video_url: string | null
        }
        Insert: {
          ai_generated?: boolean | null
          comments?: number | null
          created_at?: string | null
          creator_id?: string | null
          duration?: number | null
          grade: number
          id?: string
          likes?: number | null
          subject: string
          thumbnail?: string | null
          title: string
          video_url?: string | null
        }
        Update: {
          ai_generated?: boolean | null
          comments?: number | null
          created_at?: string | null
          creator_id?: string | null
          duration?: number | null
          grade?: number
          id?: string
          likes?: number | null
          subject?: string
          thumbnail?: string | null
          title?: string
          video_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      leaderboard_view: {
        Row: {
          show_xp_in_leaderboard: boolean | null
          username: string | null
          xp_points: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_unique_username: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
