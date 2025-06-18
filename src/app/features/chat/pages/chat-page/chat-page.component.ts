import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription, forkJoin } from 'rxjs';
import { take, finalize } from 'rxjs/operators';

import { Chat } from '../../../../core/models/chat.model';
import { Message } from '../../../../core/models/message.model';
import { ChatService } from '../../services/chat.service';
import { MessageService } from '../../services/message.service';
import { UiService } from '../../../../shared/services/ui.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { OnboardingWelcomeOverlayComponent } from '../../../onboarding/pages/onboarding-welcome-overlay.component';

import { ChatSidebarComponent } from '../../components/chat-sidebar/chat-sidebar.component';
import { ChatMessageComponent } from '../../components/chat-message/chat-message.component';
import { ChatInputComponent } from '../../components/chat-input/chat-input.component';
import { ChatAnalysisComponent } from '../../../analysis/components/chat-analysis/chat-analysis.component';
import { ConversationOverlayComponent } from '../../components/conversation-overlay/conversation-overlay.component';
import { ChatWelcomeComponent } from '../../components/chat-welcome/chat-welcome.component';
import { ConversationCreatorModalComponent } from '../../components/chat-modal/conversation-creator-modal.component';
import { Task } from '../../../../core/models/task';
import { TaskService } from '../../services/tasks.service';
import { AudioRecorderService } from '../../services/audio-recorder.service';

// ✅ NUEVOS SERVICIOS
import { UserService } from '../../../../core/services/user.service';
import { SubscriptionService } from '../../../../core/services/subscription.service';
import { UserProfile } from '../../../../core/models/user.model';
import { SubscriptionStatus } from '../../../../core/models/subscription.model';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [
    CommonModule,
    ChatSidebarComponent,
    ConversationCreatorModalComponent,
    ChatMessageComponent,
    ChatInputComponent,
    ChatAnalysisComponent,
    ConversationOverlayComponent,
    OnboardingWelcomeOverlayComponent,
    ChatWelcomeComponent,
    FontAwesomeModule,
  ],
  templateUrl: './chat-page.component.html',
})
export class ChatPageComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  // ========== OBSERVABLES ==========
  chats$: Observable<Chat[]>;
  currentChat$: Observable<Chat | null>;
  messages$: Observable<Message[]>;
  overlayVisible$: Observable<boolean>;
  hideAIResponses$: Observable<boolean>;
  tasks$: Observable<Task[]>;

  // ========== DATOS DEL USUARIO ==========
  userProfile: UserProfile | null = null;
  subscriptionStatus: SubscriptionStatus | null = null;

  // ========== ESTADOS DE ONBOARDING ==========
  isLoadingUserData = true;
  shouldShowOnboarding = false;

  // ========== ESTADO DE LA UI ==========
  currentChatId: string | null = null;
  isSidebarOpen = false;
  isCreatingChat = false;
  showModal = false;
  showAnalysis = false;
  isLoading = false;
  isRecordingManual = false;
  isProcessing = false;
  overlayMessage = 'Tu turno. Estamos escuchando...';

  // ========== ESTADO DEL CHAT ==========
  chatForAnalysis: Chat | null = null;
  isNaturalMode = false;
  message = '';
  isRecording = false;
  recordingDuration = 0;
  tasksList: { description: string; completed: boolean }[] = [];

  private subscriptions = new Subscription();

  constructor(
    private chatService: ChatService,
    private messageService: MessageService,
    public ui: UiService,
    private userService: UserService,
    private subscriptionService: SubscriptionService,
    private taskService: TaskService,
    private audioRecorder: AudioRecorderService
  ) {
    this.chats$ = this.chatService.chats$;
    this.currentChat$ = this.chatService.currentChat$;
    this.messages$ = this.messageService.messages$;
    this.overlayVisible$ = this.ui.conversationOverlay$;
    this.hideAIResponses$ = this.ui.hideAIResponses$;
    this.tasks$ = this.taskService.tasks$;
  }

  ngOnInit(): void {
    this.initializeApp();
    this.setupSubscriptions();
  }

  // ========== INICIALIZACIÓN ==========

  private initializeApp(): void {
    // Cargar chats
    this.chatService.fetchChats();

    // Cargar datos del usuario y determinar si mostrar onboarding
    this.loadUserDataAndOnboarding();
  }

  private loadUserDataAndOnboarding(): void {
    this.isLoadingUserData = true;

    // Cargar perfil y estado de suscripción en paralelo
    forkJoin({
      profile: this.userService.getProfile(),
      subscription: this.subscriptionService.getStatus(),
    })
      .pipe(
        take(1),
        finalize(() => (this.isLoadingUserData = false))
      )
      .subscribe({
        next: ({ profile, subscription }) => {
          console.log('✅ Datos cargados:', { profile, subscription });

          this.userProfile = profile;
          this.subscriptionStatus = subscription;

          // Determinar si mostrar onboarding
          this.shouldShowOnboarding = this.shouldShowOnboardingFlow();
        },
        error: (error) => {
          console.error('❌ Error cargando datos del usuario:', error);
          // En caso de error, no mostrar onboarding por seguridad
          this.shouldShowOnboarding = false;
        },
      });
  }

  private shouldShowOnboardingFlow(): boolean {
    // Solo mostrar onboarding si:
    // 1. El usuario no ha visto el onboarding
    // 2. No tiene suscripción activa
    // 3. No está en trial
    const hasSeenOnboarding = this.userProfile?.profile.onboarding_seen || false;
    const isSubscribed = this.isUserSubscribed;
    const isInTrial = this.isUserInTrial;

    const shouldShow = !hasSeenOnboarding && !isSubscribed && !isInTrial;

    console.log('🔍 Onboarding decision:', {
      hasSeenOnboarding,
      isSubscribed,
      isInTrial,
      shouldShow,
    });

    return shouldShow;
  }

  private setupSubscriptions(): void {
    // Suscribirse al chat actual
    this.subscriptions.add(
      this.currentChat$.subscribe((chat) => {
        this.currentChatId = chat?.id ?? null;
        this.chatForAnalysis = chat;
      })
    );

    // Suscribirse al estado del sidebar
    this.subscriptions.add(
      this.ui.sidebarOpen$.subscribe((open) => (this.isSidebarOpen = open))
    );

    // Suscribirse a las tareas
    this.subscriptions.add(
      this.taskService.tasks$.subscribe((tasks) => {
        this.tasksList = tasks.map((t) => ({
          description: t.description,
          completed: t.completed ?? false,
        }));
      })
    );
  }

  // ========== GETTERS PARA EL ESTADO DE SUSCRIPCIÓN ==========

  get isUserSubscribed(): boolean {
    return this.subscriptionService.isActive(
      this.subscriptionStatus?.status || ''
    );
  }

  get isUserInTrial(): boolean {
    return this.subscriptionStatus?.status === 'trial';
  }

  get isUserPremium(): boolean {
    const planSlug = this.subscriptionStatus?.subscription?.plan?.slug || '';
    return this.subscriptionService.isPremium(planSlug);
  }

  get subscriptionStatusText(): string {
    return this.subscriptionService.getStatusText(
      this.subscriptionStatus?.status || ''
    );
  }

  get trialDaysRemaining(): number {
    const endDate = this.subscriptionStatus?.subscription?.ends_at;
    return endDate
      ? this.subscriptionService.calculateTrialDaysRemaining(endDate)
      : 0;
  }

  // ========== MANEJO DE MENSAJES ==========

  handleSendMessage(content: string): void {
    const currentChat = this.chatService.getCurrentChatValue();
    if (currentChat) {
      this.isLoading = true;
      this.messageService.sendMessage(currentChat.id, content);
      this.chatService.bumpChatToTop(currentChat.id);
      setTimeout(() => (this.isLoading = false), 2000);
    }
  }

  handleAudioRecording(audioBlob: Blob): Promise<void> {
    const currentChat = this.chatService.getCurrentChatValue();
    if (!currentChat) return Promise.resolve();

    this.isLoading = true;
    return this.messageService
      .sendVoiceMessageAndWait(currentChat.id, audioBlob)
      .then(() => {
        this.isLoading = false;
      })
      .catch((err) => {
        console.error('Error enviando voz:', err);
        this.isLoading = false;
      });
  }

  async handleManualRecording(): Promise<void> {
    if (!this.isRecordingManual) {
      this.isRecordingManual = true;
      this.isProcessing = false;
      this.overlayMessage = 'Grabando... presiona de nuevo para detener';

      setTimeout(async () => {
        await this.audioRecorder.startRecording();
      }, 300);
    } else {
      this.isRecordingManual = false;
      this.isProcessing = true;
      this.overlayMessage = 'Procesando...';

      const currentChat = this.chatService.getCurrentChatValue();
      const audioBlob = await this.audioRecorder.stopRecording();
      if (audioBlob && currentChat) {
        await this.handleAudioRecording(audioBlob);
        this.chatService.bumpChatToTop(currentChat.id);
      }

      this.isProcessing = false;
      this.overlayMessage = 'Tu turno. Estamos escuchando...';
    }
  }

  // ========== MANEJO DE CHATS ==========

  handleDeleteChat(chatId: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este chat?')) {
      this.chatService.deleteChat(chatId).subscribe(() => {
        const updatedChats = this.chatService
          .getChatsValue()
          .filter((c) => c.id !== chatId);
        this.chatService.setChats(updatedChats);

        if (this.chatService.getCurrentChatValue()?.id === chatId) {
          this.chatService.setCurrentChat(null);
        }
      });
    }
  }

  handleSelectChat(chatId: string): void {
    this.chatService.selectChat(chatId);
    this.ui.closeSidebar();
  }

  handleStartNewChat(data: { role: string; context: string }): void {
    this.isCreatingChat = true;
    this.chatService
      .createChat({
        title: data.role,
        role: data.role,
        context: data.context,
      })
      .subscribe({
        next: (newChat) => {
          this.chatService.selectChat(newChat.id);
          if (newChat.initial_message) {
            this.messageService.speak(newChat.initial_message);
          }

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

  // ========== MANEJO DE ONBOARDING ==========

  handleStartFreeTrial(): void {
    console.log('🎉 Trial iniciado, ocultando onboarding');
    this.shouldShowOnboarding = false;

    // Recargar datos de suscripción para reflejar el nuevo estado
    this.subscriptionService
      .getStatus()
      .pipe(take(1))
      .subscribe({
        next: (status) => {
          this.subscriptionStatus = status;
          console.log('✅ Estado de suscripción actualizado:', status);
        },
        error: (error) => {
          console.error('❌ Error actualizando estado:', error);
        },
      });
  }

  // ========== MÉTODOS DE UI ==========

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
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

  // ========== LIFECYCLE METHODS ==========

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

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ========== UTILIDADES ==========

  trackByMessage(index: number, message: Message): string {
    return message.id;
  }

  // ========== MÉTODOS DE DEBUG ==========

  logCurrentState(): void {
    console.log('🔍 Estado actual del componente:', {
      isLoadingUserData: this.isLoadingUserData,
      shouldShowOnboarding: this.shouldShowOnboarding,
      isUserSubscribed: this.isUserSubscribed,
      isUserInTrial: this.isUserInTrial,
      subscriptionStatus: this.subscriptionStatus,
      userProfile: this.userProfile,
    });
  }
}
