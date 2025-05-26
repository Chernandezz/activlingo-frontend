export interface Chat {
  id: string;
  user_id: string;
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
