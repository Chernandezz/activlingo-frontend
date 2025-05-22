import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Message } from '../../../core/models/message.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  messages$ = this.messagesSubject.asObservable();

  constructor(private http: HttpClient) {}

  fetchMessages(chatId: number): void {
    this.http
      .get<Message[]>(`${environment.apiUrl}/messages/?chat_id=${chatId}`)
      .subscribe((messages) => {
        const filtered = messages.filter((m) => m.sender !== 'system');
        this.messagesSubject.next(filtered);
      });
  }

  clearMessages(): void {
    this.messagesSubject.next([]);
  }

  sendMessage(chatId: number, content: string): void {
    const currentMessages = this.messagesSubject.getValue();

    // Mensaje del usuario
    const humanMessage: Message = {
      id: Date.now(), // temporal
      chat_id: chatId,
      sender: 'human',
      content,
      timestamp: new Date().toISOString(),
    };

    // Mensaje placeholder de la IA
    const aiPlaceholder: Message = {
      id: Date.now() + 1,
      chat_id: chatId,
      sender: 'ai',
      content: '...',
      timestamp: new Date().toISOString(),
    };

    // Mostrar ambos de inmediato
    this.messagesSubject.next([
      ...currentMessages,
      humanMessage,
      aiPlaceholder,
    ]);

    // Llamar a la API
    this.http
      .post<Message>(`${environment.apiUrl}/messages/`, {
        chat_id: chatId,
        sender: 'human',
        content,
      })
      .subscribe((response) => {
        // Reemplazar el placeholder con la respuesta real
        const updatedMessages = this.messagesSubject
          .getValue()
          .map((msg) => (msg.id === aiPlaceholder.id ? response : msg));
        this.messagesSubject.next(updatedMessages);
      });
  }
}
