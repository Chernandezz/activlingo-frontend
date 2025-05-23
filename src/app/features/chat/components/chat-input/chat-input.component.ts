// chat-input.component.ts
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AudioRecorderService } from '../../services/audio-recorder.service';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-input.component.html',
})
export class ChatInputComponent {
  message = '';
  isRecording = false;
  isProcessing = false;

  @Input() chatId!: number;
  @Output() send = new EventEmitter<string>();
  @Output() sendVoice = new EventEmitter<Blob>();

  constructor(private audioService: AudioRecorderService) {}

  sendMessage(): void {
    const content = this.message.trim();
    if (!content) return;

    this.send.emit(content);
    this.message = '';
  }

  async toggleRecording() {
    if (!this.isRecording) {
      this.isRecording = true;
      await this.audioService.startRecording();
    } else {
      this.isRecording = false;
      this.isProcessing = true;

      const audio = await this.audioService.stopRecording();
      this.sendVoice.emit(audio);

      this.isProcessing = false;
    }
  }
}
