export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5';
  };
  public: {
    Tables: {
      account_profiles: {
        Row: {
          display_name: string;
          preferred_locale: string;
          revision: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          display_name?: string;
          preferred_locale?: string;
          revision?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          display_name?: string;
          preferred_locale?: string;
          revision?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      account_workspaces: {
        Row: {
          family_name: string;
          members: Json;
          revision: number;
          study_plans: Json;
          tasks: Json;
          updated_at: string;
          user_id: string;
          workspace_id: string;
        };
        Insert: {
          family_name?: string;
          members?: Json;
          revision?: number;
          study_plans?: Json;
          tasks?: Json;
          updated_at?: string;
          user_id: string;
          workspace_id?: string;
        };
        Update: {
          family_name?: string;
          members?: Json;
          revision?: number;
          study_plans?: Json;
          tasks?: Json;
          updated_at?: string;
          user_id?: string;
          workspace_id?: string;
        };
        Relationships: [];
      };
      app_badge_awards: {
        Row: {
          awarded_at: string;
          badge_id: string;
          child_id: string;
          evidence: Json;
          family_id: string;
        };
        Insert: {
          awarded_at: string;
          badge_id: string;
          child_id: string;
          evidence: Json;
          family_id: string;
        };
        Update: {
          awarded_at?: string;
          badge_id?: string;
          child_id?: string;
          evidence?: Json;
          family_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'app_badge_awards_child_id_family_id_fkey';
            columns: ['child_id', 'family_id'];
            isOneToOne: false;
            referencedRelation: 'app_children';
            referencedColumns: ['id', 'family_id'];
          },
          {
            foreignKeyName: 'app_badge_awards_family_id_fkey';
            columns: ['family_id'];
            isOneToOne: false;
            referencedRelation: 'app_families';
            referencedColumns: ['id'];
          },
        ];
      };
      app_children: {
        Row: {
          active: boolean;
          age_band: string;
          created_at: string;
          display_name: string;
          family_id: string;
          id: string;
        };
        Insert: {
          active?: boolean;
          age_band: string;
          created_at?: string;
          display_name: string;
          family_id: string;
          id?: string;
        };
        Update: {
          active?: boolean;
          age_band?: string;
          created_at?: string;
          display_name?: string;
          family_id?: string;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'app_children_family_id_fkey';
            columns: ['family_id'];
            isOneToOne: false;
            referencedRelation: 'app_families';
            referencedColumns: ['id'];
          },
        ];
      };
      app_command_receipts: {
        Row: {
          auth_user_id: string;
          command: Json;
          created_at: string;
          family_id: string;
          request_id: string;
          result: Json | null;
        };
        Insert: {
          auth_user_id: string;
          command: Json;
          created_at?: string;
          family_id: string;
          request_id: string;
          result?: Json | null;
        };
        Update: {
          auth_user_id?: string;
          command?: Json;
          created_at?: string;
          family_id?: string;
          request_id?: string;
          result?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: 'app_command_receipts_family_id_fkey';
            columns: ['family_id'];
            isOneToOne: false;
            referencedRelation: 'app_families';
            referencedColumns: ['id'];
          },
        ];
      };
      app_custom_task_templates: {
        Row: {
          active: boolean;
          created_at: string;
          created_by: string;
          family_id: string;
          id: string;
          revision: number;
          template: Json;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          created_by: string;
          family_id: string;
          id?: string;
          revision?: number;
          template: Json;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          created_by?: string;
          family_id?: string;
          id?: string;
          revision?: number;
          template?: Json;
        };
        Relationships: [
          {
            foreignKeyName: 'app_custom_task_templates_family_id_fkey';
            columns: ['family_id'];
            isOneToOne: false;
            referencedRelation: 'app_families';
            referencedColumns: ['id'];
          },
        ];
      };
      app_families: {
        Row: {
          active: boolean;
          created_at: string;
          id: string;
          name: string;
          owner_id: string;
          revision: number;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          id?: string;
          name: string;
          owner_id: string;
          revision?: number;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          id?: string;
          name?: string;
          owner_id?: string;
          revision?: number;
        };
        Relationships: [];
      };
      app_family_document_requests: {
        Row: {
          auth_user_id: string;
          command: Json;
          created_at: string;
          family_id: string;
          request_id: string;
          result: Json;
        };
        Insert: {
          auth_user_id: string;
          command: Json;
          created_at?: string;
          family_id: string;
          request_id: string;
          result: Json;
        };
        Update: {
          auth_user_id?: string;
          command?: Json;
          created_at?: string;
          family_id?: string;
          request_id?: string;
          result?: Json;
        };
        Relationships: [
          {
            foreignKeyName: 'app_family_document_requests_family_id_fkey';
            columns: ['family_id'];
            isOneToOne: false;
            referencedRelation: 'app_families';
            referencedColumns: ['id'];
          },
        ];
      };
      app_family_documents: {
        Row: {
          child_id: string | null;
          created_at: string;
          family_id: string;
          id: string;
          kind: string;
          payload: Json;
          revision: number;
          updated_at: string;
        };
        Insert: {
          child_id?: string | null;
          created_at?: string;
          family_id: string;
          id?: string;
          kind: string;
          payload: Json;
          revision?: number;
          updated_at?: string;
        };
        Update: {
          child_id?: string | null;
          created_at?: string;
          family_id?: string;
          id?: string;
          kind?: string;
          payload?: Json;
          revision?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'app_family_documents_child_family_fk';
            columns: ['child_id', 'family_id'];
            isOneToOne: false;
            referencedRelation: 'app_children';
            referencedColumns: ['id', 'family_id'];
          },
          {
            foreignKeyName: 'app_family_documents_child_id_fkey';
            columns: ['child_id'];
            isOneToOne: false;
            referencedRelation: 'app_children';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'app_family_documents_family_id_fkey';
            columns: ['family_id'];
            isOneToOne: false;
            referencedRelation: 'app_families';
            referencedColumns: ['id'];
          },
        ];
      };
      app_family_members: {
        Row: {
          active: boolean;
          auth_user_id: string;
          child_id: string | null;
          created_at: string;
          display_name: string | null;
          family_id: string;
          id: string;
          role: string;
          session_id: string | null;
        };
        Insert: {
          active?: boolean;
          auth_user_id: string;
          child_id?: string | null;
          created_at?: string;
          display_name?: string | null;
          family_id: string;
          id?: string;
          role: string;
          session_id?: string | null;
        };
        Update: {
          active?: boolean;
          auth_user_id?: string;
          child_id?: string | null;
          created_at?: string;
          display_name?: string | null;
          family_id?: string;
          id?: string;
          role?: string;
          session_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'app_family_members_child_id_family_id_fkey';
            columns: ['child_id', 'family_id'];
            isOneToOne: false;
            referencedRelation: 'app_children';
            referencedColumns: ['id', 'family_id'];
          },
          {
            foreignKeyName: 'app_family_members_family_id_fkey';
            columns: ['family_id'];
            isOneToOne: false;
            referencedRelation: 'app_families';
            referencedColumns: ['id'];
          },
        ];
      };
      app_family_message_reads: {
        Row: {
          person_id: string;
          sequence: number;
          thread_id: string;
        };
        Insert: {
          person_id: string;
          sequence?: number;
          thread_id: string;
        };
        Update: {
          person_id?: string;
          sequence?: number;
          thread_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'app_family_message_reads_thread_id_fkey';
            columns: ['thread_id'];
            isOneToOne: false;
            referencedRelation: 'app_family_message_threads';
            referencedColumns: ['id'];
          },
        ];
      };
      app_family_message_threads: {
        Row: {
          child_id: string;
          family_id: string;
          id: string;
          kind: string;
          next_sequence: number;
          parent_member_id: string | null;
          peer_child_id: string | null;
          peer_enabled: boolean;
        };
        Insert: {
          child_id: string;
          family_id: string;
          id?: string;
          kind: string;
          next_sequence?: number;
          parent_member_id?: string | null;
          peer_child_id?: string | null;
          peer_enabled?: boolean;
        };
        Update: {
          child_id?: string;
          family_id?: string;
          id?: string;
          kind?: string;
          next_sequence?: number;
          parent_member_id?: string | null;
          peer_child_id?: string | null;
          peer_enabled?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'app_family_message_threads_child_id_family_id_fkey';
            columns: ['child_id', 'family_id'];
            isOneToOne: false;
            referencedRelation: 'app_children';
            referencedColumns: ['id', 'family_id'];
          },
          {
            foreignKeyName: 'app_family_message_threads_family_id_fkey';
            columns: ['family_id'];
            isOneToOne: false;
            referencedRelation: 'app_families';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'app_family_message_threads_parent_member_id_family_id_fkey';
            columns: ['parent_member_id', 'family_id'];
            isOneToOne: false;
            referencedRelation: 'app_family_members';
            referencedColumns: ['id', 'family_id'];
          },
          {
            foreignKeyName: 'app_family_message_threads_peer_child_id_family_id_fkey';
            columns: ['peer_child_id', 'family_id'];
            isOneToOne: false;
            referencedRelation: 'app_children';
            referencedColumns: ['id', 'family_id'];
          },
        ];
      };
      app_family_messages: {
        Row: {
          body: string;
          client_key: string;
          created_at: string;
          family_id: string;
          id: string;
          phrase_id: string | null;
          sender_id: string;
          sequence: number;
          thread_id: string;
        };
        Insert: {
          body: string;
          client_key: string;
          created_at?: string;
          family_id: string;
          id?: string;
          phrase_id?: string | null;
          sender_id: string;
          sequence: number;
          thread_id: string;
        };
        Update: {
          body?: string;
          client_key?: string;
          created_at?: string;
          family_id?: string;
          id?: string;
          phrase_id?: string | null;
          sender_id?: string;
          sequence?: number;
          thread_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'app_family_messages_thread_id_family_id_fkey';
            columns: ['thread_id', 'family_id'];
            isOneToOne: false;
            referencedRelation: 'app_family_message_threads';
            referencedColumns: ['id', 'family_id'];
          },
        ];
      };
      app_invite_attempts: {
        Row: {
          attempts: number;
          auth_user_id: string;
          window_start: string;
        };
        Insert: {
          attempts: number;
          auth_user_id: string;
          window_start: string;
        };
        Update: {
          attempts?: number;
          auth_user_id?: string;
          window_start?: string;
        };
        Relationships: [];
      };
      app_league_encouragements: {
        Row: {
          created_at: string;
          family_id: string;
          id: string;
          phrase_id: string;
          recipient_id: string;
          sender_id: string;
          week_id: string;
        };
        Insert: {
          created_at?: string;
          family_id: string;
          id?: string;
          phrase_id: string;
          recipient_id: string;
          sender_id: string;
          week_id: string;
        };
        Update: {
          created_at?: string;
          family_id?: string;
          id?: string;
          phrase_id?: string;
          recipient_id?: string;
          sender_id?: string;
          week_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'app_league_encouragements_recipient_id_family_id_fkey';
            columns: ['recipient_id', 'family_id'];
            isOneToOne: false;
            referencedRelation: 'app_league_participants';
            referencedColumns: ['id', 'family_id'];
          },
          {
            foreignKeyName: 'app_league_encouragements_sender_id_family_id_fkey';
            columns: ['sender_id', 'family_id'];
            isOneToOne: false;
            referencedRelation: 'app_league_participants';
            referencedColumns: ['id', 'family_id'];
          },
          {
            foreignKeyName: 'app_league_encouragements_week_id_family_id_fkey';
            columns: ['week_id', 'family_id'];
            isOneToOne: false;
            referencedRelation: 'app_league_weeks';
            referencedColumns: ['id', 'family_id'];
          },
        ];
      };
      app_league_leaves: {
        Row: {
          child_id: string;
          family_id: string;
          participant_id: string;
          recognition_id: string | null;
          task_id: string;
        };
        Insert: {
          child_id: string;
          family_id: string;
          participant_id: string;
          recognition_id?: string | null;
          task_id: string;
        };
        Update: {
          child_id?: string;
          family_id?: string;
          participant_id?: string;
          recognition_id?: string | null;
          task_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'app_league_leaves_participant_id_family_id_fkey';
            columns: ['participant_id', 'family_id'];
            isOneToOne: false;
            referencedRelation: 'app_league_participants';
            referencedColumns: ['id', 'family_id'];
          },
          {
            foreignKeyName: 'app_league_leaves_participant_id_fkey';
            columns: ['participant_id'];
            isOneToOne: false;
            referencedRelation: 'app_league_participants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'app_league_leaves_recognition_id_fkey';
            columns: ['recognition_id'];
            isOneToOne: true;
            referencedRelation: 'app_recognitions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'app_league_leaves_task_id_family_id_child_id_fkey';
            columns: ['task_id', 'family_id', 'child_id'];
            isOneToOne: false;
            referencedRelation: 'app_tasks';
            referencedColumns: ['id', 'family_id', 'child_id'];
          },
        ];
      };
      app_league_participants: {
        Row: {
          child_id: string;
          family_id: string;
          id: string;
          nickname: Json;
          rest: boolean;
          tree_avatar: string;
          week_id: string;
        };
        Insert: {
          child_id: string;
          family_id: string;
          id?: string;
          nickname: Json;
          rest?: boolean;
          tree_avatar: string;
          week_id: string;
        };
        Update: {
          child_id?: string;
          family_id?: string;
          id?: string;
          nickname?: Json;
          rest?: boolean;
          tree_avatar?: string;
          week_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'app_league_participants_child_id_family_id_fkey';
            columns: ['child_id', 'family_id'];
            isOneToOne: false;
            referencedRelation: 'app_children';
            referencedColumns: ['id', 'family_id'];
          },
          {
            foreignKeyName: 'app_league_participants_week_id_family_id_fkey';
            columns: ['week_id', 'family_id'];
            isOneToOne: false;
            referencedRelation: 'app_league_weeks';
            referencedColumns: ['id', 'family_id'];
          },
        ];
      };
      app_league_weeks: {
        Row: {
          family_id: string;
          id: string;
          revision: number;
          week_key: string;
        };
        Insert: {
          family_id: string;
          id?: string;
          revision?: number;
          week_key: string;
        };
        Update: {
          family_id?: string;
          id?: string;
          revision?: number;
          week_key?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'app_league_weeks_family_id_fkey';
            columns: ['family_id'];
            isOneToOne: false;
            referencedRelation: 'app_families';
            referencedColumns: ['id'];
          },
        ];
      };
      app_memories: {
        Row: {
          child_id: string;
          created_at: string;
          deleted_at: string | null;
          family_id: string;
          id: string;
          task_id: string;
          title: Json;
        };
        Insert: {
          child_id: string;
          created_at?: string;
          deleted_at?: string | null;
          family_id: string;
          id?: string;
          task_id: string;
          title: Json;
        };
        Update: {
          child_id?: string;
          created_at?: string;
          deleted_at?: string | null;
          family_id?: string;
          id?: string;
          task_id?: string;
          title?: Json;
        };
        Relationships: [
          {
            foreignKeyName: 'app_memories_task_id_family_id_child_id_fkey';
            columns: ['task_id', 'family_id', 'child_id'];
            isOneToOne: false;
            referencedRelation: 'app_recognitions';
            referencedColumns: ['task_id', 'family_id', 'child_id'];
          },
        ];
      };
      app_pairing_invites: {
        Row: {
          child_id: string | null;
          expires_at: string;
          family_id: string;
          issued_by: string;
          revoked: boolean;
          role: string;
          token_hash: string;
          used_session_id: string | null;
        };
        Insert: {
          child_id?: string | null;
          expires_at?: string;
          family_id: string;
          issued_by: string;
          revoked?: boolean;
          role: string;
          token_hash: string;
          used_session_id?: string | null;
        };
        Update: {
          child_id?: string | null;
          expires_at?: string;
          family_id?: string;
          issued_by?: string;
          revoked?: boolean;
          role?: string;
          token_hash?: string;
          used_session_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'app_pairing_invites_child_id_family_id_fkey';
            columns: ['child_id', 'family_id'];
            isOneToOne: false;
            referencedRelation: 'app_children';
            referencedColumns: ['id', 'family_id'];
          },
          {
            foreignKeyName: 'app_pairing_invites_family_id_fkey';
            columns: ['family_id'];
            isOneToOne: false;
            referencedRelation: 'app_families';
            referencedColumns: ['id'];
          },
        ];
      };
      app_recognitions: {
        Row: {
          canopy_contribution: number;
          child_id: string;
          created_at: string;
          family_id: string;
          id: string;
          landscape_id: string;
          seeds: number;
          task_id: string;
        };
        Insert: {
          canopy_contribution: number;
          child_id: string;
          created_at?: string;
          family_id: string;
          id?: string;
          landscape_id: string;
          seeds: number;
          task_id: string;
        };
        Update: {
          canopy_contribution?: number;
          child_id?: string;
          created_at?: string;
          family_id?: string;
          id?: string;
          landscape_id?: string;
          seeds?: number;
          task_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'app_recognitions_task_id_family_id_child_id_fkey';
            columns: ['task_id', 'family_id', 'child_id'];
            isOneToOne: false;
            referencedRelation: 'app_tasks';
            referencedColumns: ['id', 'family_id', 'child_id'];
          },
        ];
      };
      app_reward_versions: {
        Row: {
          child_id: string;
          created_by: string;
          current: boolean;
          family_id: string;
          given_at: string | null;
          id: string;
          lifecycle: string;
          milestone: Json;
          month: string;
          promise: Json;
          promised_at: string;
          superseded_at: string | null;
          unlocked_at: string | null;
          version: number;
        };
        Insert: {
          child_id: string;
          created_by: string;
          current?: boolean;
          family_id: string;
          given_at?: string | null;
          id: string;
          lifecycle?: string;
          milestone: Json;
          month: string;
          promise: Json;
          promised_at: string;
          superseded_at?: string | null;
          unlocked_at?: string | null;
          version: number;
        };
        Update: {
          child_id?: string;
          created_by?: string;
          current?: boolean;
          family_id?: string;
          given_at?: string | null;
          id?: string;
          lifecycle?: string;
          milestone?: Json;
          month?: string;
          promise?: Json;
          promised_at?: string;
          superseded_at?: string | null;
          unlocked_at?: string | null;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'app_reward_versions_child_id_family_id_fkey';
            columns: ['child_id', 'family_id'];
            isOneToOne: false;
            referencedRelation: 'app_children';
            referencedColumns: ['id', 'family_id'];
          },
          {
            foreignKeyName: 'app_reward_versions_family_id_fkey';
            columns: ['family_id'];
            isOneToOne: false;
            referencedRelation: 'app_families';
            referencedColumns: ['id'];
          },
        ];
      };
      app_routine_phases: {
        Row: {
          catalog_id: string;
          child_id: string;
          created_at: string;
          family_id: string;
          phase: string;
          reviewed_by: string;
        };
        Insert: {
          catalog_id: string;
          child_id: string;
          created_at?: string;
          family_id: string;
          phase: string;
          reviewed_by: string;
        };
        Update: {
          catalog_id?: string;
          child_id?: string;
          created_at?: string;
          family_id?: string;
          phase?: string;
          reviewed_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'app_routine_phases_catalog_id_fkey';
            columns: ['catalog_id'];
            isOneToOne: false;
            referencedRelation: 'app_task_catalog';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'app_routine_phases_child_id_family_id_fkey';
            columns: ['child_id', 'family_id'];
            isOneToOne: false;
            referencedRelation: 'app_children';
            referencedColumns: ['id', 'family_id'];
          },
          {
            foreignKeyName: 'app_routine_phases_family_id_fkey';
            columns: ['family_id'];
            isOneToOne: false;
            referencedRelation: 'app_families';
            referencedColumns: ['id'];
          },
        ];
      };
      app_task_catalog: {
        Row: {
          id: string;
          template: Json;
        };
        Insert: {
          id: string;
          template: Json;
        };
        Update: {
          id?: string;
          template?: Json;
        };
        Relationships: [];
      };
      app_tasks: {
        Row: {
          catalog_id: string | null;
          child_id: string;
          created_at: string;
          custom_template_id: string | null;
          family_id: string;
          help_requested: boolean;
          id: string;
          praise: string | null;
          recognized_at: string | null;
          revision: number;
          status: string;
          step_states: Json;
          submitted_at: string | null;
          template: Json;
        };
        Insert: {
          catalog_id?: string | null;
          child_id: string;
          created_at?: string;
          custom_template_id?: string | null;
          family_id: string;
          help_requested?: boolean;
          id?: string;
          praise?: string | null;
          recognized_at?: string | null;
          revision?: number;
          status?: string;
          step_states?: Json;
          submitted_at?: string | null;
          template: Json;
        };
        Update: {
          catalog_id?: string | null;
          child_id?: string;
          created_at?: string;
          custom_template_id?: string | null;
          family_id?: string;
          help_requested?: boolean;
          id?: string;
          praise?: string | null;
          recognized_at?: string | null;
          revision?: number;
          status?: string;
          step_states?: Json;
          submitted_at?: string | null;
          template?: Json;
        };
        Relationships: [
          {
            foreignKeyName: 'app_custom_task_family';
            columns: ['custom_template_id', 'family_id'];
            isOneToOne: false;
            referencedRelation: 'app_custom_task_templates';
            referencedColumns: ['id', 'family_id'];
          },
          {
            foreignKeyName: 'app_tasks_catalog_id_fkey';
            columns: ['catalog_id'];
            isOneToOne: false;
            referencedRelation: 'app_task_catalog';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'app_tasks_child_id_family_id_fkey';
            columns: ['child_id', 'family_id'];
            isOneToOne: false;
            referencedRelation: 'app_children';
            referencedColumns: ['id', 'family_id'];
          },
          {
            foreignKeyName: 'app_tasks_family_id_fkey';
            columns: ['family_id'];
            isOneToOne: false;
            referencedRelation: 'app_families';
            referencedColumns: ['id'];
          },
        ];
      };
      pilot_access: {
        Row: {
          created_at: string;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          status?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      can_access_account_profile: { Args: never; Returns: boolean };
      get_or_create_account_profile: {
        Args: never;
        Returns: {
          display_name: string;
          preferred_locale: string;
          revision: number;
          updated_at: string;
          user_id: string;
        }[];
        SetofOptions: {
          from: '*';
          to: 'account_profiles';
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      get_or_create_account_workspace: {
        Args: never;
        Returns: {
          family_name: string;
          members: Json;
          revision: number;
          study_plans: Json;
          tasks: Json;
          updated_at: string;
          user_id: string;
          workspace_id: string;
        }[];
        SetofOptions: {
          from: '*';
          to: 'account_workspaces';
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      ghaf_configure_family_message_retention: { Args: never; Returns: number };
      ghaf_custom_template: {
        Args: { p_id: string; p_input: Json };
        Returns: Json;
      };
      ghaf_doc_can_read: {
        Args: { c: string; f: string; k: string };
        Returns: boolean;
      };
      ghaf_doc_date: { Args: { v: Json }; Returns: boolean };
      ghaf_doc_keys: {
        Args: { optional_keys?: string[]; required_keys: string[]; v: Json };
        Returns: boolean;
      };
      ghaf_doc_number: {
        Args: { maximum: number; minimum: number; v: Json; whole?: boolean };
        Returns: boolean;
      };
      ghaf_doc_options: {
        Args: { allowed: string[]; v: Json };
        Returns: boolean;
      };
      ghaf_doc_study_input: {
        Args: { is_goal: boolean; v: Json };
        Returns: Json;
      };
      ghaf_doc_text: {
        Args: { maximum: number; minimum: number; v: Json };
        Returns: boolean;
      };
      ghaf_family_actor: {
        Args: { p_family_id: string };
        Returns: {
          auth_user_id: string;
          child_id: string;
          member_id: string;
          role: string;
        }[];
      };
      ghaf_family_command: {
        Args: { p_command: Json; p_family_id: string; p_request_id: string };
        Returns: Json;
      };
      ghaf_family_core_command: {
        Args: { p_command: Json; p_family_id: string; p_request_id: string };
        Returns: Json;
      };
      ghaf_family_document_command: {
        Args: { p_command: Json; p_family_id: string; p_request_id: string };
        Returns: Json;
      };
      ghaf_family_document_snapshot: {
        Args: { p_family_id: string };
        Returns: Json;
      };
      ghaf_family_documents: {
        Args: { p_family_id: string };
        Returns: {
          child_id: string | null;
          created_at: string;
          family_id: string;
          id: string;
          kind: string;
          payload: Json;
          revision: number;
          updated_at: string;
        }[];
        SetofOptions: {
          from: '*';
          to: 'app_family_documents';
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      ghaf_family_growth: { Args: { p_family_id: string }; Returns: Json };
      ghaf_family_growth_command: {
        Args: { p_command: Json; p_family_id: string; p_request_id: string };
        Returns: Json;
      };
      ghaf_family_growth_command_before_targets: {
        Args: { p_command: Json; p_family_id: string; p_request_id: string };
        Returns: Json;
      };
      ghaf_family_identity: { Args: never; Returns: Json };
      ghaf_family_masroofi: { Args: { p_family_id: string }; Returns: Json };
      ghaf_family_masroofi_command: {
        Args: { p_family_id: string; p_request_id: string; p_command: Json };
        Returns: Json;
      };
      ghaf_family_message_mark_read: {
        Args: { p_family_id: string; p_sequence: number; p_thread_id: string };
        Returns: Json;
      };
      ghaf_family_message_page: {
        Args: {
          p_after?: number;
          p_before?: number;
          p_family_id: string;
          p_limit?: number;
          p_thread_id: string;
        };
        Returns: Json;
      };
      ghaf_family_message_purge_expired: { Args: never; Returns: number };
      ghaf_family_message_send: {
        Args: {
          p_body: string;
          p_family_id: string;
          p_phrase_id?: string;
          p_request_id: string;
          p_thread_id: string;
        };
        Returns: Json;
      };
      ghaf_family_message_threads: {
        Args: { p_family_id: string };
        Returns: Json;
      };
      ghaf_family_peer_leave: {
        Args: { p_family_id: string; p_request_id: string; p_thread_id: string };
        Returns: Json;
      };
      ghaf_family_peer_permission: {
        Args: {
          p_enabled: boolean;
          p_family_id: string;
          p_first_child_id: string;
          p_request_id: string;
          p_second_child_id: string;
        };
        Returns: Json;
      };
      ghaf_family_peer_permissions: {
        Args: { p_family_id: string };
        Returns: Json;
      };
      ghaf_family_reference_snapshot: {
        Args: { p_family_id?: string };
        Returns: Json;
      };
      ghaf_family_snapshot: { Args: { p_family_id?: string }; Returns: Json };
      ghaf_family_visible: { Args: { p_family_id: string }; Returns: boolean };
      ghaf_growth_eligible: {
        Args: {
          p_seeds: number;
          p_task: Database['public']['Tables']['app_tasks']['Row'];
        };
        Returns: boolean;
      };
      ghaf_growth_evaluate: {
        Args: { p_child: string; p_family: string; p_time: string };
        Returns: undefined;
      };
      ghaf_growth_landscapes: {
        Args: {
          p_child: string;
          p_eligible?: boolean;
          p_family: string;
          p_since?: string;
        };
        Returns: Json;
      };
      ghaf_growth_reward_baseline: {
        Args: { p_before: string; p_child: string; p_family: string };
        Returns: Json;
      };
      ghaf_growth_reward_crossed: {
        Args: { p_baseline: Json; p_delta: Json; p_milestone: Json };
        Returns: boolean;
      };
      ghaf_growth_reward_reached: {
        Args: { p_milestone: Json; p_totals: Json };
        Returns: boolean;
      };
      ghaf_growth_validate_reward: {
        Args: { p_milestone: Json; p_month: string; p_promise: Json };
        Returns: undefined;
      };
      ghaf_growth_week: { Args: { p_time?: string }; Returns: string };
      ghaf_localize_p0_name: {
        Args: { p_name: string; p_value: Json };
        Returns: Json;
      };
      ghaf_message_child_available: {
        Args: { p_child_id: string; p_family_id: string };
        Returns: boolean;
      };
      ghaf_message_dto: {
        Args: {
          p_message: Database['public']['Tables']['app_family_messages']['Row'];
        };
        Returns: Json;
      };
      ghaf_message_parent_name: {
        Args: { p_member_id: string };
        Returns: string;
      };
      ghaf_message_thread: {
        Args: { p_family_id: string; p_thread_id: string };
        Returns: {
          child_id: string;
          family_id: string;
          id: string;
          kind: string;
          next_sequence: number;
          parent_member_id: string | null;
          peer_child_id: string | null;
          peer_enabled: boolean;
        };
        SetofOptions: {
          from: '*';
          to: 'app_family_message_threads';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      ghaf_redeem_family_invite: {
        Args: { p_request_id: string; p_token: string };
        Returns: Json;
      };
      ghaf_require_recent_parent_password: {
        Args: { p_family_id: string };
        Returns: undefined;
      };
      ghaf_require_session: { Args: never; Returns: string };
      ghaf_task_copy: {
        Args: { p_content: Json; p_template: Json };
        Returns: Json;
      };
      ghaf_task_instruction_pattern: {
        Args: { p_pattern: string };
        Returns: string;
      };
      ghaf_template_canonical_fingerprint: { Args: { v: Json }; Returns: Json };
      save_account_profile: {
        Args: {
          p_display_name: string;
          p_expected_revision: number;
          p_preferred_locale: string;
        };
        Returns: {
          display_name: string;
          preferred_locale: string;
          revision: number;
          updated_at: string;
          user_id: string;
        }[];
        SetofOptions: {
          from: '*';
          to: 'account_profiles';
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      update_account_workspace: {
        Args: { p_command: Json; p_expected_revision: number };
        Returns: {
          family_name: string;
          members: Json;
          revision: number;
          study_plans: Json;
          tasks: Json;
          updated_at: string;
          user_id: string;
          workspace_id: string;
        }[];
        SetofOptions: {
          from: '*';
          to: 'account_workspaces';
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
