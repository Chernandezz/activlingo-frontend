import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message } from '../../../../core/models/message.model';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-message.component.html',
})
export class ChatMessageComponent implements OnInit {
  @Input() message!: Message;

  ngOnInit(): void {
  }

  get isUser(): boolean {
    return this.message.sender === 'human';
  }

  get isAI(): boolean {
    return this.message.sender === 'ai';
  }

  get isSystem(): boolean {
    return this.message.sender === 'system';
  }
}
