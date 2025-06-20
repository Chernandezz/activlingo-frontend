// src/app/core/interfaces/chat-repository.interface.ts
import { Observable } from 'rxjs';
import { Chat } from '../models/chat.model';
import { Message } from '../models/message.model';

export interface IChatRepository {
  getChats(): Observable<Chat[]>;
  getChatById(id: string): Observable<Chat>;

  createChat(chatData: Partial<Chat>): Observable<Chat>;

  deleteChat(id: string): Observable<void>;
  getMessages(chatId: string): Observable<Message[]>;
  sendMessage(
    chatId: string,
    content: string,
    isVoice?: boolean
  ): Observable<Message>;
}
