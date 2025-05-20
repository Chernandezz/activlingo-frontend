import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../services/chat.service';
import { Chat } from '../../../../core/models/chat.model';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-chat-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full h-full flex flex-col bg-gray-800 text-white">
      <div class="p-4 border-b border-gray-700">
        <h1 class="text-xl font-bold">Mis Chats</h1>
        <!-- Toggle solo visible en desarrollo -->
        <div *ngIf="!environment.production" class="mt-2 text-xs">
          <button
            (click)="toggleStorageMode()"
            class="px-2 py-1 rounded text-xs"
            [class.bg-blue-600]="usingLocalStorage"
            [class.bg-green-600]="!usingLocalStorage"
          >
            {{ usingLocalStorage ? 'Usando LocalStorage' : 'Usando API' }}
          </button>
        </div>
      </div>

      <div class="flex-grow overflow-y-auto">
        <div
          *ngFor="let chat of chats$ | async"
          (click)="selectChat(chat.id)"
          class="p-3 hover:bg-gray-700 cursor-pointer transition-colors duration-200"
          [class.bg-gray-700]="(currentChat$ | async)?.id === chat.id"
        >
          <h3 class="font-medium truncate">{{ chat.title }}</h3>
          <p class="text-xs text-gray-400">
            {{ chat.updatedAt | date : 'short' }}
          </p>
        </div>

        <div
          *ngIf="(chats$ | async)?.length === 0"
          class="p-4 text-center text-gray-500"
        >
          No hay chats. Crea uno nuevo para comenzar.
        </div>
      </div>

      <div class="p-4 border-t border-gray-700">
        <button
          (click)="createNewChat()"
          class="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center justify-center"
        >
          <span class="mr-2">+</span> Nuevo Chat
        </button>
      </div>
    </div>
  `,
})
export class ChatSidebarComponent implements OnInit {
  chats$: Observable<Chat[]>;
  currentChat$: Observable<Chat | null>;
  usingLocalStorage = environment.useLocalStorage;
  environment = environment;

  constructor(private chatService: ChatService) {
    this.chats$ = this.chatService.chats$;
    this.currentChat$ = this.chatService.currentChat$;
  }

  ngOnInit(): void {}

  selectChat(chatId: string): void {
    this.chatService.selectChat(chatId);
  }

  createNewChat(): void {
    const title = prompt('Título del nuevo chat:') || 'Nuevo chat';
    this.chatService.createChat(title).subscribe();
  }

  toggleStorageMode(): void {
    this.usingLocalStorage = !this.usingLocalStorage;
    this.chatService.setUseLocalStorage(this.usingLocalStorage);
  }
}
