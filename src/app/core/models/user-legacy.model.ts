export interface TrialStatus {
  trial_end: string;
  trial_active: boolean;
  is_subscribed: boolean;
  onboarding_seen: boolean;
}

export interface UserInfo {
  id: string;
  email: string;
  subscription_type: string;
  plan_type: string;
  is_subscribed: boolean;
  trial_active: boolean;
  trial_end: string | null;
  onboarding_seen: boolean;
  created_at: string;
}

export interface PlanInfo {
  current_plan: string;
  is_premium: boolean;
  features: {
    name: string;
    max_suggestions: number;
    features: string[];
    analyzer_type: string;
  };
}
