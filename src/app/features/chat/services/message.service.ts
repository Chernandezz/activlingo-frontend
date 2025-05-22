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
        const filtered = messages.filter(m => m.sender !== 'system');
        this.messagesSubject.next(filtered)});
  }

  clearMessages(): void {
    this.messagesSubject.next([]);
  }

  // sendMessage(message: Partial<Message>): Observable<Message> {
  //   return this.messageRepo.sendMessage(message).pipe(
  //     tap((newMessage) => {
  //       const current = this.messagesSubject.getValue();
  //       this.messagesSubject.next([...current, newMessage]);
  //     })
  //   );
  // }

}
