// chat-input.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-input.component.html',
})
export class ChatInputComponent {
  message = '';
  @Output() send = new EventEmitter<string>();

  sendMessage(): void {
    const content = this.message.trim();
    if (!content) return;

    this.send.emit(content);
    this.message = '';
  }
}
