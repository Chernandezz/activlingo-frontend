// chat-page.component.ts
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../services/chat.service';
import { MessageService } from '../../services/message.service';
import { Observable, Subscription } from 'rxjs';
import { Chat } from '../../../../core/models/chat.model';
import { Message } from '../../../../core/models/message.model';
import { ChatSidebarComponent } from '../../components/chat-sidebar/chat-sidebar.component';
import { ChatMessageComponent } from '../../components/chat-message/chat-message.component';
import { ChatInputComponent } from '../../components/chat-input/chat-input.component';
import { ChatAnalysisComponent } from '../../../analysis/components/chat-analysis/chat-analysis.component';
import { UiService } from '../../../../shared/services/ui.service';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [
    CommonModule,
    ChatSidebarComponent,
    ChatMessageComponent,
    ChatInputComponent,
    ChatAnalysisComponent,
  ],
  templateUrl: './chat-page.component.html',
})
export class ChatPageComponent implements OnInit, AfterViewChecked, OnDestroy {
  isSidebarOpen = false;
  overlayVisible$: Observable<boolean>;
  overlayMessage = 'Tu turno. Estamos escuchando...';

  currentChat$: Observable<Chat | null>;
  messages$: Observable<Message[]>;
  showAnalysis = false;
  isLoading = false;

  private subscriptions = new Subscription();

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  constructor(
    private chatService: ChatService,
    private messageService: MessageService,
    public ui: UiService
  ) {
    this.currentChat$ = this.chatService.currentChat$;
    this.messages$ = this.messageService.messages$;
    this.overlayVisible$ = this.ui.conversationOverlay$;
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.currentChat$.subscribe((chat) => {
        if (chat) {
          this.showAnalysis = false;
        }
      })
    );

    this.ui.sidebarOpen$.subscribe((open) => (this.isSidebarOpen = open));
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  handleSendMessage(content: string): void {
    const currentChat = this.chatService.getCurrentChatValue();
    if (currentChat) {
      this.isLoading = true;
      this.messageService.sendMessage(currentChat.id, content);

      // Reset loading after a delay (you might want to use actual response)
      setTimeout(() => {
        this.isLoading = false;
      }, 2000);
    }
  }

  handleAudioRecording(audioBlob: Blob): void {
    const currentChat = this.chatService.getCurrentChatValue();
    if (currentChat) {
      this.isLoading = true;
      this.messageService.sendVoiceMessage(currentChat.id, audioBlob);

      // Reset loading after a delay
      setTimeout(() => {
        this.isLoading = false;
      }, 3000);
    }
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
  startConversationMode(): void {
    this.overlayMessage = 'Tu turno. Estamos escuchando...';
    this.ui.showOverlay();
    // Aquí podrías emitir un evento a ChatInputComponent si quieres iniciar el loop
  }

  endConversationMode() {
    this.ui.hideOverlay();
    
  }

  toggleAnalysisView(): void {
    this.showAnalysis = !this.showAnalysis;
  }

  getChatLanguageIcon(language: string): string {
    const icons: Record<string, string> = {
      english: '🇺🇸',
      spanish: '🇪🇸',
      french: '🇫🇷',
      german: '🇩🇪',
      italian: '🇮🇹',
      portuguese: '🇵🇹',
    };
    return icons[language?.toLowerCase()] || '🌐';
  }

  getMessageCount(): Observable<number> {
    return new Observable((observer) => {
      this.messages$.subscribe((messages) => {
        observer.next(messages?.length || 0);
      });
    });
  }

  trackByMessage(index: number, message: Message): number {
    return message.id;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
