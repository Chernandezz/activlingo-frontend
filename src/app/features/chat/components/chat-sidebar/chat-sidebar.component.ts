import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chat } from '../../../../core/models/chat.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { ChatModalComponent } from '../chat-modal/chat-modal.component';

@Component({
  selector: 'app-chat-sidebar',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, ChatModalComponent],
  templateUrl: './chat-sidebar.component.html',
})
export class ChatSidebarComponent {
  faTimes = faTimes;
  faSpinner = faSpinner;

  @Input() chats: Chat[] = [];
  @Input() currentChatId: string | null = null;
  @Input() hideAIResponses: boolean = false;
  @Input() isCreatingChat: boolean = false;
  @Input() showModal: boolean = false;

  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() select = new EventEmitter<string>();
  @Output() startChat = new EventEmitter<{ role: string; context: string }>();
  @Output() toggleAI = new EventEmitter<void>();
  @Output() openModal = new EventEmitter<void>();
  @Output() closeModal = new EventEmitter<void>();

  getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );
    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  }

  trackByChat(index: number, chat: Chat): string {
    return chat.id;
  }
}
