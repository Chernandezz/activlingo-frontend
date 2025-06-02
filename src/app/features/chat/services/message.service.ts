import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Message } from '../../../core/models/message.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { generateUUID } from '../../../shared/utils/uuid.util';
import { TaskService } from './tasks.service';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  messages$ = this.messagesSubject.asObservable();
  userId = localStorage.getItem('current_user_id');

  constructor(private http: HttpClient, private taskService: TaskService) {}

  fetchMessages(chatId: string): void {
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

  async sendVoiceMessageAndWait(
    chatId: string,
    audioBlob: Blob
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('user_id', this.userId!);

      this.http
        .post<{ user_text: string; ai_text: string }>(
          `${environment.apiUrl}/messages/transcribe-audio/?chat_id=${chatId}`,
          formData
        )
        .subscribe({
          next: (res) => {
            const now = new Date().toISOString();
            const current = this.messagesSubject.getValue();

            this.messagesSubject.next([
              ...current,
              {
                id: generateUUID(),
                chat_id: chatId,
                sender: 'human',
                content: res.user_text,
                timestamp: now,
                user_id: this.userId,
              },
              {
                id: generateUUID(),
                chat_id: chatId,
                sender: 'ai',
                content: res.ai_text,
                timestamp: now,
                user_id: this.userId,
              },
            ]);

            this.speak(res.ai_text, () => resolve());
          },
          error: (err) => {
            console.error('❌ Voice message error', err);
            reject(err);
          },
        });
    });
  }

  sendVoiceMessage(chatId: string, audioBlob: Blob): void {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('user_id', this.userId!);

    this.http
      .post<{ user_text: string; ai_text: string }>(
        `${environment.apiUrl}/messages/transcribe-audio/?chat_id=${chatId}`,
        formData
      )
      .subscribe({
        next: (res) => {
          const current = this.messagesSubject.getValue();
          const now = new Date().toISOString();

          this.messagesSubject.next([
            ...current,
            {
              id: generateUUID(),
              chat_id: chatId,
              sender: 'human',
              content: res.user_text,
              timestamp: now,
              user_id: this.userId,
            },
            {
              id: generateUUID(),
              chat_id: chatId,
              sender: 'ai',
              content: res.ai_text,
              timestamp: now,
              user_id: this.userId,
            },
          ]);
          this.speak(res.ai_text);
        },
        error: (err) => {
          console.error('❌ Voice message error', err);
        },
      });
  }

  speak(text: string, onEnd?: () => void): void {
    const url = `${environment.apiUrl}/messages/speak`;

    this.http.post(url, { text }, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const audio = new Audio();
        const blobUrl = URL.createObjectURL(blob);
        audio.src = blobUrl;
        audio
          .play()
          .catch((err) => console.error('❌ Error reproduciendo voz:', err));
        if (onEnd) audio.addEventListener('ended', onEnd);
      },
      error: (err) => {
        console.error('❌ Error en TTS API:', err);
        if (onEnd) onEnd();
      },
    });
  }

  sendMessage(chatId: string, content: string): void {
    const currentMessages = this.messagesSubject.getValue();

    const humanMessage: Message = {
      id: generateUUID(),
      chat_id: chatId,
      sender: 'human',
      content,
      timestamp: new Date().toISOString(),
    };

    const aiPlaceholder: Message = {
      id: generateUUID(),
      chat_id: chatId,
      sender: 'ai',
      content: '...',
      timestamp: new Date().toISOString(),
    };

    this.messagesSubject.next([
      ...currentMessages,
      humanMessage,
      aiPlaceholder,
    ]);

    this.http
      .post<{
        message: Message;
        human_message: Message;
        completed_tasks: any[];
      }>(`${environment.apiUrl}/messages/`, {
        chat_id: chatId,
        sender: 'human',
        content,
        user_id: this.userId,
      })
      .subscribe((response) => {
        const updatedMessages = this.messagesSubject
          .getValue()
          .map((msg) => (msg.id === aiPlaceholder.id ? response.message : msg));

        this.messagesSubject.next(updatedMessages);
        this.speak(response.message.content);

        if (response.completed_tasks?.length) {
          console.log('🎯 Completed tasks:', response.completed_tasks);
          response.completed_tasks.forEach((taskId) => {
            this.taskService.updateTaskCompleted(taskId);
          });
        }
      });
  }
}
