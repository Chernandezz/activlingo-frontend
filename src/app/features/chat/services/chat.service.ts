import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { Chat } from '../../../core/models/chat.model';
import { Message } from '../../../core/models/message.model';
import { ChatRepositoryFactory } from '../../../data/factories/chat-repository.factory';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private currentChatSubject = new BehaviorSubject<Chat | null>(null);
  private chatsSubject = new BehaviorSubject<Chat[]>([]);
  private messagesSubject = new BehaviorSubject<Message[]>([]);

  currentChat$ = this.currentChatSubject.asObservable();
  chats$ = this.chatsSubject.asObservable();
  messages$ = this.messagesSubject.asObservable();

  private get repository() {
    return this.repositoryFactory.getRepository();
  }

  constructor(private repositoryFactory: ChatRepositoryFactory) {
    this.loadChats();

    // Escuchar eventos de nuevos mensajes del bot (solo para local)
    window.addEventListener('botMessageAdded', ((event: CustomEvent) => {
      const botMessage = event.detail as Message;
      const currentChat = this.currentChatSubject.value;

      if (currentChat && botMessage.chatId === currentChat.id) {
        this.messagesSubject.next([...this.messagesSubject.value, botMessage]);
      }
    }) as EventListener);
  }

  loadChats(): void {
    this.repository.getChats().subscribe((chats) => {
      // Ordenar chats por fecha de actualización (más reciente primero)
      chats.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      this.chatsSubject.next(chats);
    });
  }

  selectChat(chatId: string): void {
    const chat = this.chatsSubject.value.find((c) => c.id === chatId) || null;
    this.currentChatSubject.next(chat);

    if (chat) {
      this.loadMessages(chat.id);
    }
  }

  loadMessages(chatId: string): void {
    this.repository.getMessages(chatId).subscribe((messages) => {
      // Ordenar mensajes por fecha
      messages.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      this.messagesSubject.next(messages);
    });
  }

  createChat(title: string): Observable<Chat> {
    return this.repository.createChat(title).pipe(
      tap((newChat) => {
        const currentChats = this.chatsSubject.value;
        this.chatsSubject.next([newChat, ...currentChats]); // Añadir al principio
        this.selectChat(newChat.id);
      })
    );
  }

  sendMessage(content: string, isVoice: boolean = false): Observable<Message> {
    const currentChat = this.currentChatSubject.value;

    if (!currentChat) {
      return of({} as Message);
    }

    return this.repository.sendMessage(currentChat.id, content, isVoice).pipe(
      tap((message) => {
        const currentMessages = this.messagesSubject.value;
        this.messagesSubject.next([...currentMessages, message]);
      })
    );
  }

  endChat(): void {
    const currentChat = this.currentChatSubject.value;

    if (currentChat) {
      this.repository.deleteChat(currentChat.id).subscribe(() => {
        const currentChats = this.chatsSubject.value.filter(
          (c) => c.id !== currentChat.id
        );
        this.chatsSubject.next(currentChats);
        this.currentChatSubject.next(null);
        this.messagesSubject.next([]);
      });
    }
  }

  // Método para cambiar entre almacenamiento local y API
  setUseLocalStorage(useLocal: boolean): void {
    this.repositoryFactory.setUseLocalStorage(useLocal);
    this.loadChats(); // Recargar los datos
  }
}
