import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../services/chat.service';
import { Chat } from '../../../../core/models/chat.model';
import { Observable } from 'rxjs';
import { UiService } from '../../../../shared/services/ui.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { ChatModalComponent } from '../chat-modal/chat-modal.component';
import { MessageService } from '../../services/message.service';
import { take, filter } from 'rxjs/operators';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-chat-sidebar',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, ChatModalComponent],
  templateUrl: './chat-sidebar.component.html',
})
export class ChatSidebarComponent implements OnInit {
  faTimes = faTimes;
  faSpinner = faSpinner;

  chats$: Observable<Chat[]>;
  currentChat$: Observable<Chat | null>;

  hideAIResponses = false;
  isCreatingChat = false;
  showModal = false;

  constructor(
    private chatService: ChatService,
    public ui: UiService,
    private messageService: MessageService,
    private authService: AuthService
  ) {
    this.chats$ = this.chatService.chats$;
    this.currentChat$ = this.chatService.currentChat$;
  }

  ngOnInit(): void {
    const userId = this.authService.currentUserId;

    if (!userId) {
      console.error('No user ID found. Cannot fetch chats.');
      return;
    }

    this.chatService.fetchChats(userId);
    this.ui.sidebarOpen$.subscribe((open) => (this.showModal = false));

    this.ui.hideAIResponses$.subscribe((hide) => (this.hideAIResponses = hide));
  }

  selectChat(chatId: string): void {
    this.chatService.selectChat(chatId);
    this.ui.closeSidebar();
  }

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  startNewChat(data: { role: string; context: string }): void {
    const userId = this.authService.currentUserId;
    if (!userId) {
      console.error('No user ID found. Cannot create chat.');
      return;
    }
    this.isCreatingChat = true;
    const title = data.role;

    this.chatService
      .createChat(userId, {
        title,
        role: data.role,
        context: data.context,
      })
      .subscribe({
        next: (newChat) => {
          this.chatService.selectChat(newChat.id);
          this.messageService.fetchMessages(newChat.id); // 👈 trae los mensajes

          // Esperamos a que se actualicen los mensajes
          this.messageService.messages$
            .pipe(
              filter((msgs) => msgs.length > 0), // 👈 asegura que ya llegaron
              take(1)
            )
            .subscribe((msgs) => {
              const firstAI = msgs.find((m) => m.sender === 'ai');
              if (firstAI) {
                this.messageService.speak(firstAI.content); // ✅ habla
              }
            });

          this.isCreatingChat = false;
          this.closeModal();
          this.ui.closeSidebar();
        },
        error: () => {
          this.isCreatingChat = false;
          this.closeModal();
        },
      });
  }

  toggleAIResponses(): void {
    this.ui.toggleHideAIResponses(); // cambia el estado global
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
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  }

  trackByChat(index: number, chat: Chat): string {
    return chat.id;
  }
}
