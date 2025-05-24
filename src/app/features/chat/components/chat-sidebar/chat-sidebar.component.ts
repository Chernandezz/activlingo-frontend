// chat-sidebar.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../services/chat.service';
import { Chat } from '../../../../core/models/chat.model';
import { Observable } from 'rxjs';
import { UiService } from '../../../../shared/services/ui.service';


@Component({
  selector: 'app-chat-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-sidebar.component.html',
})
export class ChatSidebarComponent implements OnInit {
  isSidebarOpen = false;
  chats$: Observable<Chat[]>;
  currentChat$: Observable<Chat | null>;
  hideAIResponses = false;
  isCreatingChat = false;

  constructor(private chatService: ChatService, public ui: UiService) {
    this.chats$ = this.chatService.chats$;
    this.currentChat$ = this.chatService.currentChat$;
  }

  ngOnInit(): void {
    this.chatService.fetchChats(1);
    this.ui.sidebarOpen$.subscribe((open) => (this.isSidebarOpen = open));
  }

  selectChat(chatId: number): void {
    this.chatService.selectChat(chatId);
    this.ui.closeSidebar();
  }

  createNewChat(): void {
    this.isCreatingChat = true;

    setTimeout(() => {
      const title = prompt('Título para este chat:');
      if (!title) {
        this.isCreatingChat = false;
        return;
      }

      const role = prompt('Rol para este chat:');
      if (!role) {
        this.isCreatingChat = false;
        return;
      }

      const context = prompt('Contexto para este chat:');
      if (!context) {
        this.isCreatingChat = false;
        return;
      }

      this.chatService
        .createChat(1, {
          title,
          role,
          context,
        })
        .subscribe({
          next: () => {
            this.isCreatingChat = false;
          },
          error: () => {
            this.isCreatingChat = false;
          },
        });
    }, 300);
  }

  toggleAIResponses(): void {
    this.hideAIResponses = !this.hideAIResponses;
  }

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

    return date.toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
    });
  }

  trackByChat(index: number, chat: Chat): number {
    return chat.id;
  }
}
