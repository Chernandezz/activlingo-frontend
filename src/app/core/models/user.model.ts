export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at?: string;
}

export interface UserStats {
  total_conversations: number;
  current_streak: number;
  longest_streak: number;
  total_words_learned: number;
  average_session_minutes: number;
  join_date: string;
  last_activity?: string;
  conversations_this_month?: number;
  words_learned_this_month?: number;
}
