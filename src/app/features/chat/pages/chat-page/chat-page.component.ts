import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../services/chat.service';
import { Observable } from 'rxjs';
import { Chat } from '../../../../core/models/chat.model';
import { Message } from '../../../../core/models/message.model';
import { ChatSidebarComponent } from '../../components/chat-sidebar/chat-sidebar.component';
import { ChatMessageComponent } from '../../components/chat-message/chat-message.component';
import { ChatInputComponent } from '../../components/chat-input/chat-input.component';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [
    CommonModule,
    ChatSidebarComponent,
    ChatMessageComponent,
    ChatInputComponent,
  ],
  template: `
    <div class="flex h-screen bg-gray-900 text-white">
      <!-- Sidebar -->
      <div class="w-80 h-full border-r border-gray-700">
        <app-chat-sidebar></app-chat-sidebar>
      </div>

      <!-- Chat area -->
      <div class="flex-grow flex flex-col h-full">
        <div
          *ngIf="currentChat$ | async as chat"
          class="flex-grow flex flex-col p-4"
        >
          <!-- Chat header -->
          <div class="pb-4 border-b border-gray-700">
            <h2 class="text-xl font-bold">{{ chat.title }}</h2>
          </div>

          <!-- Messages -->
          <div class="flex-grow overflow-y-auto py-4" #messagesContainer>
            <div
              *ngIf="(messages$ | async)?.length === 0"
              class="text-center text-gray-500 mt-10"
            >
              No hay mensajes aún. ¡Comienza la conversación!
            </div>

            <app-chat-message
              *ngFor="let message of messages$ | async"
              [message]="message"
            >
            </app-chat-message>
          </div>

          <!-- Input area -->
          <div class="border-t border-gray-700 pt-4">
            <app-chat-input></app-chat-input>

            <div class="mt-4">
              <button
                (click)="endChat()"
                class="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors"
              >
                Terminar Chat
              </button>
            </div>
          </div>
        </div>

        <div
          *ngIf="!(currentChat$ | async)"
          class="flex-grow flex flex-col items-center justify-center p-8"
        >
          <div class="text-center">
            <h2 class="text-2xl font-bold mb-4">No hay chat seleccionado</h2>
            <p class="text-gray-400 mb-6">
              Selecciona un chat existente o crea uno nuevo para comenzar
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ChatPageComponent implements OnInit, AfterViewChecked {
  currentChat$: Observable<Chat | null>;
  messages$: Observable<Message[]>;

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  constructor(private chatService: ChatService) {
    this.currentChat$ = this.chatService.currentChat$;
    this.messages$ = this.chatService.messages$;
  }

  ngOnInit(): void {}

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop =
        this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  endChat(): void {
    if (confirm('¿Estás seguro que deseas terminar este chat?')) {
      this.chatService.endChat();
    }
  }
}
