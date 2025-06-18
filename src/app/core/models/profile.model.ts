import { User, UserStats } from './user.model';
import { Achievement } from './achievement.model';
import { SubscriptionPlan } from './subscription.model';

export interface UserProfileResponse {
  user: User;
  subscription: {
    id: number;
    user_id: string;
    plan: SubscriptionPlan;
    status: string;
    starts_at: string;
    ends_at?: string;
    trial_ends_at?: string;
    canceled_at?: string;
  } | null;
  stats: UserStats;
}

export interface ApiProfileResponse {
  success: boolean;
  profile: UserProfileResponse;
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
