export interface UserProfileResponse {
  user: {
    id: string;
    email: string;
    name: string;
    avatar_url: string;
    created_at: string;
  };
  subscription: {
    id: number | null;
    status: string;
    plan: {
      id: number | null;
      name: string;
      slug: string;
      price: number;
      currency: string;
      billing_interval: string;
    };
    starts_at: string;
    ends_at: string;
    current_period_end: string;
  } | null;
  stats: {
    total_conversations: number;
    current_streak: number;
    longest_streak: number;
    total_words_learned: number;
    join_date: string;
    last_activity: string;
    conversations_this_month: number;
    words_learned_this_month: number;
  };
  profile: {
    onboarding_seen: boolean;
  };
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
