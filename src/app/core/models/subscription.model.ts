// core/models/subscription.model.ts

export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  price: number;
  currency: string;
  billing_interval: 'monthly' | 'yearly';
  features: string[];
  max_conversations: number;
  max_words_per_day: number;
  priority_support: boolean;
  stripe_price_id: string;
}

export interface UserSubscription {
  id: number;
  user_id: string;
  plan: SubscriptionPlan;
  status: 'active' | 'canceled' | 'expired' | 'trial' | 'past_due';
  starts_at: string;
  ends_at: string | null;
  trial_ends_at: string | null;
  canceled_at: string | null;
}

export interface CheckoutResponse {
  checkout_url: string;
  session_id: string;
}

export interface CancelResponse {
  success: boolean;
  message: string;
  ends_at: string;
}
