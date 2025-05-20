export interface Message {
  id: string;
  chatId: string;
  content: string;
  timestamp: Date;
  isUser: boolean;
  isVoice?: boolean;
}
