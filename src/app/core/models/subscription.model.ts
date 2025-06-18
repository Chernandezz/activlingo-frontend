// src/app/core/models/subscription.model.ts - MODELOS LIMPIOS
export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  price: number;
  currency: string;
  billing_interval: 'monthly' | 'yearly';
  features: string[];
  stripe_price_id: string;
}

export interface SubscriptionInfo {
  id: number | null;
  status:
    | 'active'
    | 'canceled'
    | 'expired'
    | 'trial'
    | 'past_due'
    | 'no_subscription';
  plan: {
    id: number | null;
    name: string;
    slug: string;
    price: number;
    currency: string;
    billing_interval: string;
  };
  starts_at: string | null;
  ends_at: string | null;
  current_period_end: string | null;
}

export interface SubscriptionAccess {
  plan_slug: string;
  has_premium: boolean;
  max_conversations_per_day: number;
  max_words_per_day: number;
  priority_support: boolean;
  status: string;
}

export interface SubscriptionStatus {
  status:
    | 'no_subscription'
    | 'trial'
    | 'active'
    | 'canceled'
    | 'expired'
    | 'past_due';
  message: string;
  subscription: SubscriptionInfo | null;
  access: SubscriptionAccess;
  can_upgrade: boolean;
  can_cancel: boolean;
}

export interface CheckoutResponse {
  checkout_url: string;
  session_id: string;
}

export interface TrialResponse {
  trial_start: string;
  trial_end: string;
  message: string;
}

export interface CancelResponse {
  message: string;
  ends_at: string;
}
