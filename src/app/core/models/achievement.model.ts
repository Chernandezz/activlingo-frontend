export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  target_value: number;
  current_progress: number;
  unlocked: boolean;
  unlocked_at?: string;
}
