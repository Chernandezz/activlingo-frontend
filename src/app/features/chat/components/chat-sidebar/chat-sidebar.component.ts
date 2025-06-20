import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chat } from '../../../../core/models/chat.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faTimes,
  faSpinner,
  faTrashAlt,
  faEllipsisVertical,
  faBars,
  faComments,
  faPlus,
  faEye,
  faEyeSlash,
} from '@fortawesome/free-solid-svg-icons';
import { UiService } from '../../../../shared/services/ui.service';

@Component({
  selector: 'app-chat-sidebar',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './chat-sidebar.component.html',
  styles: [
    `
      .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
      }

      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }

      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #6b7280;
        border-radius: 20px;
      }

      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #4b5563;
      }

      /* Mejorar la transición del dropdown */
      .dropdown-enter {
        opacity: 0;
        transform: scale(0.95) translateY(-10px);
      }

      .dropdown-enter-active {
        opacity: 1;
        transform: scale(1) translateY(0);
        transition: all 150ms ease-out;
      }
    `,
  ],
})
export class ChatSidebarComponent {
  // Icons
  faTimes = faTimes;
  faSpinner = faSpinner;
  faTrashAlt = faTrashAlt;
  faEllipsisVertical = faEllipsisVertical;
  faBars = faBars;
  faComments = faComments;
  faPlus = faPlus;
  faEye = faEye;
  faEyeSlash = faEyeSlash;

  // Props
  @Input() chats: Chat[] = [];
  @Input() currentChatId: string | null = null;
  @Input() hideAIResponses: boolean = false;
  @Input() isCreatingChat: boolean = false;
  @Input() showModal: boolean = false;

  // Events
  @Output() select = new EventEmitter<string>();
  @Output() startChat = new EventEmitter<{ role: string; context: string }>();
  @Output() toggleAI = new EventEmitter<void>();
  @Output() openModal = new EventEmitter<void>();
  @Output() closeModal = new EventEmitter<void>();
  @Output() deleteChat = new EventEmitter<string>();
  @Output() expandedChange = new EventEmitter<boolean>();

  isExpanded$: typeof this.ui.sidebarExpanded$;
  openMenuId: string | null = null;

  constructor(private ui: UiService) {
    this.isExpanded$ = this.ui.sidebarExpanded$;
  }

  // ✅ NUEVO: Método específico para expandir el sidebar
  toggleExpand(): void {
    this.ui.toggleSidebarExpanded();
  }

  // ✅ NUEVO: Método específico para cerrar/colapsar
  handleCloseSidebar(): void {
    if (this.isDesktop()) {
      // En desktop: colapsar el sidebar
      this.ui.toggleSidebarExpanded();
    } else {
      // En móvil: cerrar completamente el sidebar
      this.ui.closeSidebar();
    }
  }

  // ✅ MEJORADO: Método general para toggle (mantener por compatibilidad)
  toggleSidebar(): void {
    if (this.isDesktop()) {
      this.ui.toggleSidebarExpanded();
    } else {
      this.ui.toggleSidebar();
    }
  }

  // ✅ NUEVO: Utilidad para detectar desktop
  private isDesktop(): boolean {
    return window.innerWidth >= 1024;
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

  trackByChat(index: number, chat: Chat): string {
    return chat.id;
  }

  toggleMenu(chatId: string, event: MouseEvent): void {
    event.stopPropagation();
    this.openMenuId = this.openMenuId === chatId ? null : chatId;
  }

  closeMenu(): void {
    this.openMenuId = null;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.openMenuId = null;
  }

  // ✅ NUEVO: Listener para cambios de tamaño de ventana
  @HostListener('window:resize')
  onWindowResize(): void {
    // Opcional: Puedes manejar cambios de responsive aquí si es necesario
    // Por ejemplo, cerrar el sidebar en móvil si se redimensiona la ventana
  }
}
