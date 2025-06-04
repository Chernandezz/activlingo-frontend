// conversation-overlay.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import {
  faMicrophone,
  faHandPaper,
  faMicrochip,
  faInfoCircle,
  faSignOutAlt,
  faListCheck,
  faInbox,
  faCommentSlash,
  faCheckCircle,
  faCircleNotch,
  faLightbulb,
  faQuoteLeft,
  faVolumeUp,
  faCog,
  faHistory,
  faQuestionCircle,
} from '@fortawesome/free-solid-svg-icons';

export interface OverlayTask {
  description: string;
  completed: boolean;
}

// Nueva interfaz para cada palabra recomendada
export interface RecommendedWord {
  text: string; // La palabra misma, p. ej. "match"
  usageCount: number; // Total de veces usada
  lastUsed: string; // Fecha de última vez usada, p. ej. "2025-05-30"
  type: 'idiom' | 'phrasal verb' | 'collocation' | 'other'; // Tipo de palabra
}

interface QuickAction {
  type: string;
  icon: any;
  color: string;
  title: string;
}

@Component({
  selector: 'app-conversation-overlay',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './conversation-overlay.component.html',
  styleUrls: ['./conversation-overlay.component.css'],
})
export class ConversationOverlayComponent {
  @Input() message: string = 'Tu turno. Estamos escuchando...';
  @Input() isNaturalMode: boolean = false;
  @Input() tasks: OverlayTask[] = [];
  @Input() isRecordingManual: boolean = false;
  @Input() isProcessing: boolean = false;

  // Ahora recibimos RecommendedWord[] en lugar de string[]
  @Input() recommendedWords: RecommendedWord[] = [
    // Ejemplos por defecto, pero el padre puede enviar su propio arreglo
    {
      text: 'match',
      usageCount: 3,
      lastUsed: 'Hace 2 días',
      type: 'other',
    },
    {
      text: 'make up',
      usageCount: 1,
      lastUsed: 'Hace 1 semana',
      type: 'phrasal verb',
    },
    {
      text: 'take it easy',
      usageCount: 5,
      lastUsed: 'Hace 1 día',
      type: 'idiom',
    },
    {
      text: 'in a nutshell',
      usageCount: 2,
      lastUsed: 'Hace 3 días',
      type: 'idiom',
    },
  ];

  @Input() isLoading: boolean = false;
  @Input() showNotification: boolean = false;
  @Input() notificationMessage: string =
    '¡Nueva tarea detectada en la conversación!';

  @Output() close = new EventEmitter<void>();
  @Output() toggleMode = new EventEmitter<void>();
  @Output() startRecording = new EventEmitter<void>();
  @Output() sendVoice = new EventEmitter<Blob>();
  @Output() taskToggled = new EventEmitter<number>();
  @Output() quickAction = new EventEmitter<string>();
  @Output() wordSelected = new EventEmitter<string>();

  // Declaramos todos los íconos que vamos a usar mediante FontAwesomeModule
  
  faMicrophone = faMicrophone;
  faHandPaper = faHandPaper;
  faMicrochip = faMicrochip;
  faInfoCircle = faInfoCircle;
  faSignOutAlt = faSignOutAlt;
  faListCheck = faListCheck;
  faInbox = faInbox;
  faCommentSlash = faCommentSlash;
  faLightbulb = faLightbulb;
  faQuoteLeft = faQuoteLeft;
  faVolumeUp = faVolumeUp;
  faCog = faCog;
  faHistory = faHistory;
  faQuestionCircle = faQuestionCircle;
  faCheckCircle = faCheckCircle;
  faCircleNotch = faCircleNotch;

  quickActions: QuickAction[] = [
    {
      type: 'settings',
      icon: this.faCog,
      color: 'text-blue-600',
      title: 'Ajustes rápidos',
    },
    {
      type: 'history',
      icon: this.faHistory,
      color: 'text-indigo-600',
      title: 'Historial de conversación',
    },
    {
      type: 'help',
      icon: this.faQuestionCircle,
      color: 'text-blue-400',
      title: 'Ayuda rápida',
    },
  ];

  get completedTasksCount(): number {
    return this.tasks.filter((t) => t.completed).length;
  }

  toggleTaskCompletion(index: number) {
    this.taskToggled.emit(index);
  }

  emitDummyAudio() {
    const dummyBlob = new Blob(['test audio'], { type: 'audio/wav' });
    this.sendVoice.emit(dummyBlob);
  }

  playWord(word: RecommendedWord) {
    // Emitimos el texto de la palabra al padre
    this.wordSelected.emit(word.text);
  }

  handleQuickAction(type: string) {
    this.quickAction.emit(type);
  }

  dismissNotification() {
    this.showNotification = false;
  }
}
