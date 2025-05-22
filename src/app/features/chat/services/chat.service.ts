import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Chat } from '../../../core/models/chat.model';
import { ChatCreate } from '../../../core/models/chat.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private apiUrl = environment.apiUrl;
  
  

  private chatsSubject = new BehaviorSubject<Chat[]>([]);
  private currentChatSubject = new BehaviorSubject<Chat | null>(null);

  chats$ = this.chatsSubject.asObservable();
  currentChat$ = this.currentChatSubject.asObservable();

  constructor(private http: HttpClient) {
  }

  fetchChats(userId: number): void {
    this.http
      .get<Chat[]>(`${this.apiUrl}/chats/?user_id=${userId}`)
      .subscribe((chats) => this.chatsSubject.next(chats));
  }

  createChat(userId: number, chat: ChatCreate): Observable<Chat> {
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
    this.http
      .get<Chat>(`${this.apiUrl}/chats/${chatId}`)
      .subscribe((chat) => this.currentChatSubject.next(chat));
  }

  getChatById(chatId: number): Observable<Chat> {
    return this.http.get<Chat>(`${this.apiUrl}/chats/${chatId}`);
  }

  clearCurrentChat(): void {
    this.currentChatSubject.next(null);
  }
}
