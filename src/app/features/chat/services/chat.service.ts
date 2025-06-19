import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Chat, ChatCreate } from '../../../core/models/chat.model';
import { environment } from '../../../../environments/environment';
import { MessageService } from './message.service';
import { TaskService } from './tasks.service';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private apiUrl = environment.apiUrl;

  private chatsSubject = new BehaviorSubject<Chat[]>([]);
  private currentChatSubject = new BehaviorSubject<Chat | null>(null);

  chats$ = this.chatsSubject.asObservable();
  currentChat$ = this.currentChatSubject.asObservable();

  constructor(
    private http: HttpClient,
    private messageService: MessageService,
    private taskService: TaskService
  ) {}

  getChatsValue(): Chat[] {
    return this.chatsSubject.getValue();
  }

  setChats(chats: Chat[]): void {
    this.chatsSubject.next(chats);
  }

  getCurrentChatValue(): Chat | null {
    return this.currentChatSubject.getValue();
  }

  setCurrentChat(chat: Chat | null): void {
    this.currentChatSubject.next(chat);
  }

  clearChats(): void {
    this.chatsSubject.next([]);
    this.currentChatSubject.next(null);
  }

  clearCurrentChat(): void {
    this.currentChatSubject.next(null);
  }

  fetchChats(): void {
    this.http.get<Chat[]>(`${this.apiUrl}/chats/`).subscribe((chats) => {
      const sorted = [...chats].sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
      this.chatsSubject.next(sorted);
    });
  }

  bumpChatToTop(chatId: string): void {
    const chats = this.getChatsValue();
    const target = chats.find((c) => c.id === chatId);
    if (!target) return;

    const updatedChat = {
      ...target,
      updated_at: new Date().toISOString(), // actualizamos manualmente
    };

    const newOrder = [updatedChat, ...chats.filter((c) => c.id !== chatId)];
    this.setChats(
      newOrder.sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      )
    );
  }

  getChatById(chatId: string): Observable<Chat> {
    return this.http.get<Chat>(`${this.apiUrl}/chats/${chatId}`);
  }

  createChat(chat: ChatCreate): Observable<Chat> {
    const payload: ChatCreate = {
      title: chat.title || 'New Chat',
      language: chat.language || 'en',
      level: chat.level || 'beginner',
      role: chat.role || 'Tutor',
      context:
        chat.context || 'You are having a conversation to practice English.',
    };

    return this.http.post<Chat>(`${this.apiUrl}/chats/`, payload).pipe(
      tap((newChat) => {
        const current = this.chatsSubject.getValue();
        this.chatsSubject.next([newChat, ...current]);
        this.currentChatSubject.next(newChat);

        if (newChat.tasks) {
          this.taskService.setTasks(newChat.tasks);
        }
      })
    );
  }

  deleteChat(chatId: string): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/chats/${chatId}`);
  }

  selectChat(chatId: string): void {
    const allChats = this.chatsSubject.getValue();

    const chat = allChats.find((c) => c.id === chatId);
    if (chat) {
      this.setCurrentChat(chat);

      if (chat.messages?.length) {
        this.messageService.setMessages(chat.messages);
      } else {
        this.messageService.fetchMessages(chatId);
      }

      if (chat.tasks) {
        this.taskService.setTasks(chat.tasks);
      } else {
        this.taskService.clear();
      }
    } else {
      this.getChatById(chatId).subscribe((loadedChat) => {
        this.setCurrentChat(loadedChat);
        this.messageService.fetchMessages(chatId);

        if (loadedChat.tasks) {
          this.taskService.setTasks(loadedChat.tasks);
        } else {
          this.taskService.clear();
        }
      });
    }
  }
}
