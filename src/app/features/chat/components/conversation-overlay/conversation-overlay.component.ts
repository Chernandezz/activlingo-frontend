import {
  Component,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  OnChanges,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface OverlayTask {
  description: string;
  completed: boolean;
}

@Component({
  selector: 'app-conversation-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './conversation-overlay.component.html',
  styleUrls: ['./conversation-overlay.component.css'],
})
export class ConversationOverlayComponent {
  @Input() message: string = 'Tu turno. Estamos escuchando...';
  @Input() isNaturalMode: boolean = false;
  @Input() tasks: OverlayTask[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() toggleMode = new EventEmitter<void>();
  @Output() startRecording = new EventEmitter<void>();
  @Output() sendVoice = new EventEmitter<Blob>();

  toggleTaskCompletion(index: number) {
    this.tasks[index].completed = !this.tasks[index].completed;
  }

  emitDummyAudio() {
    const dummyBlob = new Blob(['test audio'], { type: 'audio/wav' });
    this.sendVoice.emit(dummyBlob);
  }
}
