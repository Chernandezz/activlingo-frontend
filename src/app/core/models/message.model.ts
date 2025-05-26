export interface Message {
  id: string;
  chat_id: string;
  sender: 'human' | 'ai' | 'system';
  content: string;
  timestamp: string;
  isVoice?: boolean;
  audioBase64?: string;
}
