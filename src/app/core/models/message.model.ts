export interface Message {
  user_id?: string | null; // Optional for system messages
  id: string;
  chat_id: string;
  sender: 'human' | 'ai' | 'system';
  content: string;
  timestamp: string;
  isVoice?: boolean;
  audioBase64?: string;
}
