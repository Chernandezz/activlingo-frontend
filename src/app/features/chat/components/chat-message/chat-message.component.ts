import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message } from '../../../../core/models/message.model';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mb-4 flex" [class.justify-end]="message.isUser">
      <div
        class="max-w-[80%] p-3 rounded-lg"
        [class.bg-blue-600]="message.isUser"
        [class.text-white]="message.isUser"
        [class.bg-gray-700]="!message.isUser"
        [class.ml-auto]="message.isUser"
      >
        <div class="flex items-center" *ngIf="message.isVoice">
          <span class="mr-2">🎤</span>
          <span>{{ message.content }}</span>
        </div>
        <div *ngIf="!message.isVoice">
          {{ message.content }}
        </div>
        <div class="text-xs opacity-70 mt-1 text-right">
          {{ message.timestamp | date : 'shortTime' }}
        </div>
      </div>
    </div>
  `,
})
export class ChatMessageComponent {
  @Input() message!: Message;
}
