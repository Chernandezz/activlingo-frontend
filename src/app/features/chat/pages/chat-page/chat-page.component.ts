import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { Chat } from '../../../../core/models/chat.model';
import { Message } from '../../../../core/models/message.model';
import { ChatService } from '../../services/chat.service';
import { MessageService } from '../../services/message.service';
import { UiService } from '../../../../shared/services/ui.service';
import { AuthService } from '../../../../core/services/auth.service';

import { ChatSidebarComponent } from '../../components/chat-sidebar/chat-sidebar.component';
import { ChatMessageComponent } from '../../components/chat-message/chat-message.component';
import { ChatInputComponent } from '../../components/chat-input/chat-input.component';
import { ChatAnalysisComponent } from '../../../analysis/components/chat-analysis/chat-analysis.component';
import { ConversationOverlayComponent } from '../../components/conversation-overlay/conversation-overlay.component';
import { Task } from '../../../../core/models/task';
import { TaskService } from '../../services/tasks.service';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [
    CommonModule,
    ChatSidebarComponent,
    ChatMessageComponent,
    ChatInputComponent,
    ChatAnalysisComponent,
    ConversationOverlayComponent,
  ],
  templateUrl: './chat-page.component.html',
})
export class ChatPageComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  // Observables
  chats$: Observable<Chat[]>;
  currentChat$: Observable<Chat | null>;
  messages$: Observable<Message[]>;
  overlayVisible$: Observable<boolean>;
  hideAIResponses$: Observable<boolean>;
  chatForAnalysis: Chat | null = null;
  tasks$: Observable<Task[]>;

  // Estado UI
  currentChatId: string | null = null;
  isSidebarOpen = false;
  isCreatingChat = false;
  showModal = false;
  showAnalysis = false;
  isLoading = false;
  overlayMessage = 'Tu turno. Estamos escuchando...';
  isNaturalMode = false;
  message = '';
  isRecording = false;
  isProcessing = false;
  recordingDuration = 0;
  tasksList: { description: string; completed: boolean }[] = [];

  private subscriptions = new Subscription();

  constructor(
    private chatService: ChatService,
    private messageService: MessageService,
    public ui: UiService,
    private authService: AuthService,
    private taskService: TaskService
  ) {
    this.chats$ = this.chatService.chats$;
    this.currentChat$ = this.chatService.currentChat$;
    this.messages$ = this.messageService.messages$;
    this.overlayVisible$ = this.ui.conversationOverlay$;
    this.hideAIResponses$ = this.ui.hideAIResponses$;
    this.tasks$ = this.taskService.tasks$;
  }

  ngOnInit(): void {
    const userId = this.authService.currentUserId;
    if (userId) {
      this.chatService.fetchChats(userId);
    }

    this.subscriptions.add(
      this.currentChat$.subscribe((chat) => {
        this.currentChatId = chat?.id ?? null;
        this.chatForAnalysis = chat;
      })
    );

    this.subscriptions.add(
      this.ui.sidebarOpen$.subscribe((open) => (this.isSidebarOpen = open))
    );

    this.subscriptions.add(
      this.taskService.tasks$.subscribe((tasks) => {
        this.tasksList = tasks.map((t) => ({
          description: t.description,
          completed: t.completed ?? false,
        }));

        
        
      })
    );
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      if (this.messagesContainer?.nativeElement) {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.warn('Error scrolling to bottom:', err);
    }
  }

  handleSendMessage(content: string): void {
    const currentChat = this.chatService.getCurrentChatValue();
    if (currentChat) {
      this.isLoading = true;
      this.messageService.sendMessage(currentChat.id, content);
      setTimeout(() => (this.isLoading = false), 2000); // Simulación
    }
  }

  handleAudioRecording(audioBlob: Blob): void {
    const currentChat = this.chatService.getCurrentChatValue();
    if (currentChat) {
      this.isLoading = true;
      this.messageService.sendVoiceMessage(currentChat.id, audioBlob);
      setTimeout(() => (this.isLoading = false), 3000);
    }
  }

  // 👇 Este es el nuevo método para grabación desde el overlay
  handleManualRecording(): void {
    console.log('🔴 Grabación manual iniciada desde el overlay');
    // Aquí llamas a tu lógica de grabación. Por ahora puedes usar console.log para test.
    // Más adelante puedes vincular esto con tu servicio de grabación de audio.
  }

  handleSelectChat(chatId: string): void {
    this.chatService.selectChat(chatId);
    this.ui.closeSidebar();
  }

  handleStartNewChat(data: { role: string; context: string }): void {
    const userId = this.authService.currentUserId;
    if (!userId) return;

    this.isCreatingChat = true;
    this.chatService
      .createChat(userId, {
        title: data.role,
        role: data.role,
        context: data.context,
      })
      .subscribe({
        next: (newChat) => {
          this.chatService.selectChat(newChat.id);
          this.messageService.fetchMessages(newChat.id);

          this.messageService.messages$
            .pipe(
              map((msgs) => msgs.find((m) => m.sender === 'ai')),
              take(1)
            )
            .subscribe((firstAI) => {
              if (firstAI) this.messageService.speak(firstAI.content);
            });

          this.isCreatingChat = false;
          this.showModal = false;
          this.ui.closeSidebar();
        },
        error: () => {
          this.isCreatingChat = false;
          this.showModal = false;
        },
      });
  }

  toggleAnalysisView(): void {
    this.showAnalysis = !this.showAnalysis;
  }

  closeCurrentChat(): void {
    this.chatService.setCurrentChat(null);
    this.messageService.clearMessages();
    this.showAnalysis = false;
  }

  startConversationMode(): void {
    this.overlayMessage = 'Tu turno. Estamos escuchando...';
    this.ui.showOverlay();
  }

  endConversationMode(): void {
    this.ui.hideOverlay();
  }

  toggleConversationMode(): void {
    this.isNaturalMode = !this.isNaturalMode;
  }

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  trackByMessage(index: number, message: Message): string {
    return message.id;
  }
}
