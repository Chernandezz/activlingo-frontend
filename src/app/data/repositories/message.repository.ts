import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Message } from '../../core/models/message.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MessageRepository {
  private apiUrl = `${environment.apiUrl}/messages`;

  constructor(private http: HttpClient) {}

  getMessagesByChatId(chatId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}?chat_id=${chatId}`);
  }

  sendMessage(message: Partial<Message>): Observable<Message> {
    return this.http.post<Message>(this.apiUrl, message);
  }

  deleteMessage(messageId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${messageId}`);
  }
}
