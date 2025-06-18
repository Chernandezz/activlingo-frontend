// src/app/core/models/user.model.ts - MODELOS LIMPIOS
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  created_at: string;
}

export interface UserStats {
  total_conversations: number;
  current_streak: number;
  longest_streak: number;
  total_words_learned: number;
  average_session_minutes: number;
  join_date: string;
  last_activity: string;
  conversations_this_month: number;
  words_learned_this_month: number;
}

export interface UserProfile {
  user: User;
  stats: UserStats;
  subscription: UserSubscription | null;
  profile: {
    onboarding_seen: boolean;
  };
}

export interface UserSubscription {
  id: number | null;
  status: 'active' | 'canceled' | 'expired' | 'trial' | 'past_due';
  plan: {
    id: number | null;
    name: string;
    slug: string;
    price: number;
    currency: string;
    billing_interval: string;
  };
  starts_at: string;
  ends_at: string | null;
  current_period_end: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlocked_at: string | null;
  current_progress?: number;
  target_value?: number;
}

export interface UpdateProfileRequest {
  name?: string;
  language?: string;
  learning_goal?: string;
  difficulty_level?: string;
  notifications?: {
    daily_reminders: boolean;
    achievements: boolean;
    product_updates: boolean;
  };
}
