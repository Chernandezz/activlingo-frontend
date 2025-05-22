import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-input.component.html',
})
export class ChatInputComponent {
  messageText = '';
  isVoiceMode = false;

  constructor(private chatService: ChatService) {}

  toggleVoiceMode(): void {
    this.isVoiceMode = !this.isVoiceMode;
  }

  sendMessage(): void {
    // if (!this.messageText.trim()) return;

    // this.chatService
    //   .sendMessage(this.messageText, this.isVoiceMode)
    //   .subscribe(() => {
    //     this.messageText = '';
    //     if (this.isVoiceMode) {
    //       this.isVoiceMode = false;
    //     }
    //   });
  }
}

