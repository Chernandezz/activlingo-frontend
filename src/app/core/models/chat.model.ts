export interface Chat {
  id: number;
  user_id: number;
  title: string;
  language: string;
  level: string;
  created_at: string;
}


export interface ChatCreate {
  title: string;
  language?: string;
  level?: string;
  role?: string;
  context?: string;
}
