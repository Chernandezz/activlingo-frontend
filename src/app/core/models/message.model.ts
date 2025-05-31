export interface Message {
  user_i?: string;
  id: string;
  chat_id: string;
  sender: 'human' | 'ai' | 'system';
  content: string;
  timestamp: string;
  isVoice?: boolean;
  audioBase64?: string;
}
