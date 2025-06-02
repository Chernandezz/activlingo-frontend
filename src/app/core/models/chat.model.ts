import { Task } from "./task";

export interface Chat {
  id: string;
  user_id: string;
  title: string;
  language: string;
  level: string;
  created_at: string;
  tasks?: Task[];
}


export interface ChatCreate {
  title: string;
  language?: string;
  level?: string;
  role?: string;
  context?: string;
  tasks?: Task[];
}
