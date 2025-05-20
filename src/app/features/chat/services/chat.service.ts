import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap, map } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Chat } from '../../../core/models/chat.model';
import { Message } from '../../../core/models/message.model';
import { ChatRepositoryFactory } from '../../../data/factories/chat-repository.factory';
import { MockLanguageAnalysisService } from '../../analysis/services/mock-language-analysis.service';
import { LocalAnalysisRepository } from '../../../data/repositories/local-analysis.repository';
import { LanguageAnalysisPoint } from '../models/language-analysis.model';

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

  constructor(
    private repositoryFactory: ChatRepositoryFactory,
    private analysisService: MockLanguageAnalysisService,
    private analysisRepository: LocalAnalysisRepository
  ) {
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

  createChat(chatData: Partial<Chat>): Observable<Chat> {
    return this.repository.createChat(chatData).pipe(
      tap((newChat) => {
        const currentChats = this.chatsSubject.value;
        this.chatsSubject.next([newChat, ...currentChats]);
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

        // Analizar el texto del usuario
        this.analysisService
          .analyzeText(content, currentChat.language || 'en')
          .subscribe((analysisPoints) => {
            // Guardar cada punto de análisis
            analysisPoints.forEach((point) => {
              const fullPoint = {
                ...point,
                chatId: currentChat.id,
                messageId: message.id,
              };
              this.analysisRepository.saveAnalysisPoint(fullPoint).subscribe();
            });
          });
      }),
      // Generar respuesta del bot basada en el escenario
      switchMap((message) => {
        // Obtener el escenario del chat (podría ser una propiedad del chat)
        const scenario = currentChat.scenario || 'neighbor-dog';

        return this.analysisService.generateBotResponse(scenario, content).pipe(
          tap((botResponse) => {
            // Crear y guardar mensaje del bot
            const botMessage: Message = {
              id: Date.now().toString(),
              chatId: currentChat.id,
              content: botResponse,
              timestamp: new Date(),
              isUser: false,
            };

            // Añadir mensaje del bot a la lista de mensajes
            const updatedMessages = [...this.messagesSubject.value, botMessage];
            this.messagesSubject.next(updatedMessages);
          }),
          map(() => message) // Devolver el mensaje original del usuario
        );
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
