import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { Chat } from '../../core/models/chat.model';
import { Message } from '../../core/models/message.model';

@Injectable({
  providedIn: 'root',
})
export class ChatRepository {
  constructor(private apiService: ApiService) {}

  getChats(): Observable<Chat[]> {
    return this.apiService.get<Chat[]>('chats');
  }

  getChatById(id: string): Observable<Chat> {
    return this.apiService.get<Chat>(`chats/${id}`);
  }

  createChat(title: string): Observable<Chat> {
    return this.apiService.post<Chat>('chats', { title });
  }

  deleteChat(id: string): Observable<void> {
    return this.apiService.delete<void>(`chats/${id}`);
  }

  getMessages(chatId: string): Observable<Message[]> {
    return this.apiService.get<Message[]>(`chats/${chatId}/messages`);
  }

  sendMessage(
    chatId: string,
    content: string,
    isVoice: boolean = false
  ): Observable<Message> {
    return this.apiService.post<Message>(`chats/${chatId}/messages`, {
      content,
      isVoice,
    });
  }
}
