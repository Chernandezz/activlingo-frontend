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
import { UiService } from '../../../../shared/services/ui.service';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs';
import { Chat } from '../../../../core/models/chat.model';
import { Message } from '../../../../core/models/message.model';
import { ChatSidebarComponent } from '../../components/chat-sidebar/chat-sidebar.component';
import { ChatMessageComponent } from '../../components/chat-message/chat-message.component';
import { ChatInputComponent } from '../../components/chat-input/chat-input.component';
import { ChatAnalysisComponent } from '../../../analysis/components/chat-analysis/chat-analysis.component';
import {
  faSpinner,
  faComments,
  faMicrophone,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';



@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [
    CommonModule,
    ChatSidebarComponent,
    ChatMessageComponent,
    ChatInputComponent,
    ChatAnalysisComponent,
    FontAwesomeModule,
  ],
  templateUrl: './chat-page.component.html',
})
export class ChatPageComponent implements OnInit, AfterViewChecked, OnDestroy {
  faSpinner = faSpinner;
  faComments = faComments;
  faMicrophone = faMicrophone;

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild(ChatInputComponent)
  private chatInputComponent!: ChatInputComponent;
  conversationStatus: 'idle' | 'thinking' | 'responding' | 'user-turn' = 'idle';

  currentChat$: Observable<Chat | null>;
  messages$: Observable<Message[]>;
  hideAIResponses$: Observable<boolean>;
  overlayVisible$: Observable<boolean>;
  overlayMessage = 'Tu turno. Estamos escuchando...';

  showAnalysis = false;
  isSidebarOpen = false;
  isLoading = false;

  private subscriptions = new Subscription();

  constructor(
    private chatService: ChatService,
    private messageService: MessageService,
    public ui: UiService
  ) {
    this.currentChat$ = this.chatService.currentChat$;
    this.messages$ = this.messageService.messages$;
    this.hideAIResponses$ = this.ui.hideAIResponses$;
    this.overlayVisible$ = this.ui.conversationOverlay$;
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.currentChat$.subscribe((chat) => {
        if (chat) this.showAnalysis = false;
      })
    );

    this.subscriptions.add(
      this.ui.conversationStatus$.subscribe((status) => {
        this.conversationStatus = status;
      })
    );

    this.subscriptions.add(
      this.ui.sidebarOpen$.subscribe((open) => (this.isSidebarOpen = open))
    );
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    if (this.messagesContainer?.nativeElement) {
      this.messagesContainer.nativeElement.scrollTop =
        this.messagesContainer.nativeElement.scrollHeight;
    }
  }

  handleSendMessage(content: string): void {
    const currentChat = this.chatService.getCurrentChatValue();
    if (!currentChat) return;

    this.isLoading = true;
    this.messageService.sendMessage(currentChat.id, content);

    setTimeout(() => (this.isLoading = false), 2000);
  }

  handleAudioRecording(audio: Blob): void {
    const currentChat = this.chatService.getCurrentChatValue();
    if (!currentChat) return;

    this.isLoading = true;
    this.messageService.sendVoiceMessage(currentChat.id, audio);

    setTimeout(() => (this.isLoading = false), 3000);
  }

  startConversationMode(): void {
    this.overlayMessage = 'Tu turno. Estamos escuchando...';
    this.ui.setConversationMode(true); // 🔁 Estado global
    this.ui.showOverlay(); // Mostrar overlay visual
  }

  endConversationMode(): void {
    this.ui.setConversationMode(false); // 🔁 Detiene grabación
    this.ui.hideOverlay(); // Oculta overlay
  }

  closeCurrentChat(): void {
    this.chatService.setCurrentChat(null);
    this.messageService.clearMessages();
    this.showAnalysis = false;
    this.ui.setConversationMode(false);
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
    return this.messages$.pipe(map((messages) => messages.length));
  }

  trackByMessage(index: number, message: Message): string {
    return message.id;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.ui.setConversationMode(false); // seguridad al salir
    this.ui.hideOverlay();
  }
}
