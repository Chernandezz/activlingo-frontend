export interface Message {
  id: number;
  chat_id: number;
  sender: 'human' | 'ai' | 'system';
  content: string;
  timestamp: string;
  isVoice?: boolean;
  audioBase64?: string;
}
