// chat-message.component.ts
import {
  Component,
  Input,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message } from '../../../../core/models/message.model';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-message.component.html',
})
export class ChatMessageComponent implements OnInit, AfterViewInit {
  @Input() message!: Message;
  @ViewChild('messageContent') messageContent!: ElementRef;

  showTimestamp = false;
  isTyping = false;

  ngOnInit(): void {
    // Simulate typing effect for AI messages
    if (this.isAI && !this.isLoading) {
      this.simulateTyping();
    }
  }

  ngAfterViewInit(): void {
    // Add entrance animation
    if (this.messageContent) {
      this.messageContent.nativeElement.style.animation =
        'messageSlideIn 0.3s ease-out';
    }
  }

  private simulateTyping(): void {
    this.isTyping = true;
    setTimeout(() => {
      this.isTyping = false;
    }, 1000);
  }

  toggleTimestamp(): void {
    this.showTimestamp = !this.showTimestamp;
  }

  get isLoading(): boolean {
    return (
      this.message.sender === 'ai' &&
      (this.message.content === '...' ||
        this.message.content === '' ||
        !this.message.content)
    );
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

  get messageTime(): string {
    const date = new Date(this.message.timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  get userAvatar(): string {
    // You can customize this based on user data
    return 'U';
  }

  get aiAvatar(): string {
    return 'AI';
  }

  copyMessage(): void {
    navigator.clipboard.writeText(this.message.content);
    // You could add a toast notification here
  }

  formatContent(content: string): string {
    // Basic formatting - you can extend this
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  }
}
