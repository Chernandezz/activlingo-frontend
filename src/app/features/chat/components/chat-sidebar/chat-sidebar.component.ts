import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../services/chat.service';
import { Chat } from '../../../../core/models/chat.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-chat-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-sidebar.component.html',
})
export class ChatSidebarComponent implements OnInit {
  chats$: Observable<Chat[]>;
  currentChat$: Observable<Chat | null>;

  constructor(private chatService: ChatService) {
    this.chats$ = this.chatService.chats$;
    this.currentChat$ = this.chatService.currentChat$;
  }

  ngOnInit(): void {
    this.chatService.fetchChats(1); // 1 es el user_id fijo por ahora
  }

  selectChat(chatId: number): void {
    this.chatService.selectChat(chatId);
  }

  createNewChat(): void {
    const title = prompt('Título para este chat:');
    if (!title) return;

    this.chatService
      .createChat(1, {
        title,
        role: 'default',
        context: 'default',
      })
      .subscribe();
  }
}
