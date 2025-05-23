import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Chat } from '../../../core/models/chat.model';
import { ChatCreate } from '../../../core/models/chat.model';
import { environment } from '../../../../environments/environment';
import { MessageService } from './message.service';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private apiUrl = environment.apiUrl;

  private chatsSubject = new BehaviorSubject<Chat[]>([]);
  private currentChatSubject = new BehaviorSubject<Chat | null>(null);

  getCurrentChatValue(): Chat | null {
    return this.currentChatSubject.getValue();
  }

  chats$ = this.chatsSubject.asObservable();
  currentChat$ = this.currentChatSubject.asObservable();

  constructor(
    private http: HttpClient,
    private messageService: MessageService
  ) {}

  fetchChats(userId: number): void {
    this.http
      .get<Chat[]>(`${this.apiUrl}/chats/?user_id=${userId}`)
      .subscribe((chats) => this.chatsSubject.next(chats));
  }

  createChat(userId: number, chat: ChatCreate): Observable<Chat> {
    chat = {
      title: chat.title || 'Nuevo chat',
      language: 'en',
      level: 'A1',
      role: chat.role || 'Usuario',
      context: chat.context || 'Sin contexto',
    }
    return this.http
      .post<Chat>(`${this.apiUrl}/chats/?user_id=${userId}`, chat)
      .pipe(
        tap((newChat) => {
          const current = this.chatsSubject.getValue();
          this.chatsSubject.next([newChat, ...current]);
          this.currentChatSubject.next(newChat);
        })
      );
  }

  selectChat(chatId: number): void {
    this.http.get<Chat>(`${this.apiUrl}/chats/${chatId}`).subscribe((chat) => {
      this.currentChatSubject.next(chat);
      this.messageService.fetchMessages(chatId);
    });
  }

  getChatById(chatId: number): Observable<Chat> {
    return this.http.get<Chat>(`${this.apiUrl}/chats/${chatId}`);
  }

  clearCurrentChat(): void {
    this.currentChatSubject.next(null);
  }
}
