import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Chat, ChatCreate } from '../../../core/models/chat.model';
import { environment } from '../../../../environments/environment';
import { MessageService } from './message.service';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private apiUrl = environment.apiUrl;

  private chatsSubject = new BehaviorSubject<Chat[]>([]);
  private currentChatSubject = new BehaviorSubject<Chat | null>(null);

  chats$ = this.chatsSubject.asObservable();
  currentChat$ = this.currentChatSubject.asObservable();

  constructor(
    private http: HttpClient,
    private messageService: MessageService
  ) {}

  getCurrentChatValue(): Chat | null {
    return this.currentChatSubject.getValue();
  }

  setCurrentChat(chat: Chat | null): void {
    this.currentChatSubject.next(chat);
  }

  fetchChats(userId: string): void {
    this.http
      .get<Chat[]>(`${this.apiUrl}/chats/?user_id=${userId}`)
      .subscribe((chats) => this.chatsSubject.next(chats));
  }

  createChat(userId: string, chat: ChatCreate): Observable<Chat> {
    const payload: ChatCreate = {
      title: chat.title || 'New Chat',
      language: chat.language || 'en',
      level: chat.level || 'beginner',
      role: chat.role || 'Tutor',
      context:
        chat.context || 'You are having a conversation to practice English.',
    };

    return this.http
      .post<Chat>(`${this.apiUrl}/chats/?user_id=${userId}`, payload)
      .pipe(
        tap((newChat) => {
          const current = this.chatsSubject.getValue();
          this.chatsSubject.next([newChat, ...current]);
          this.currentChatSubject.next(newChat);
        })
      );
  }

  clearChats(): void {
    this.chatsSubject.next([]);
    this.currentChatSubject.next(null);
  }

  selectChat(chatId: string): void {
    this.http.get<Chat>(`${this.apiUrl}/chats/${chatId}`).subscribe((chat) => {
      this.currentChatSubject.next(chat);
      this.messageService.fetchMessages(chatId);
    });
  }

  getChatById(chatId: string): Observable<Chat> {
    return this.http.get<Chat>(`${this.apiUrl}/chats/${chatId}`);
  }

  clearCurrentChat(): void {
    this.currentChatSubject.next(null);
  }
}
