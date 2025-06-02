import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-input.component.html',
})
export class ChatInputComponent {
  @Input() message: string = '';
  @Input() isRecording: boolean = false;
  @Input() isProcessing: boolean = false;
  @Input() recordingDuration: number = 0;

  @Output() messageChange = new EventEmitter<string>();
  @Output() send = new EventEmitter<void>();
  @Output() toggleRecording = new EventEmitter<void>();
  @Output() openOverlay = new EventEmitter<void>();
  @Output() sendVoice = new EventEmitter<Blob>();

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send.emit();
    }
  }

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  handleTextChange(value: string): void {
    this.messageChange.emit(value);
  }

  get canSend(): boolean {
    return (
      this.message.trim().length > 0 && !this.isRecording && !this.isProcessing
    );
  }
}
