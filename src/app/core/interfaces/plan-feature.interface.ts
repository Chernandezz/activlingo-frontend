export interface PlanFeatures {
  unlimited_conversations: boolean;
  advanced_scenarios: boolean;
  priority_support: boolean;
  analytics: boolean;
  export_data: boolean;
  api_access?: boolean;
  custom_scenarios?: boolean;
  max_conversations_per_day: number;
  [key: string]: boolean | number | undefined;
}

export interface PlanFeaturesConfig {
  [planSlug: string]: PlanFeatures;
}
