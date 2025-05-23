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
  recordingDuration = 0;
  recordingInterval: any;

  @Input() chatId!: number;
  @Output() send = new EventEmitter<string>();
  @Output() sendVoice = new EventEmitter<Blob>();

  constructor(private audioService: AudioRecorderService) {}

  sendMessage(): void {
    const content = this.message.trim();
    if (!content || this.isProcessing || this.isRecording) return;

    this.send.emit(content);
    this.message = '';
  }

  async toggleRecording() {
    if (!this.isRecording) {
      this.startRecording();
    } else {
      this.stopRecording();
    }
  }

  private async startRecording() {
    try {
      this.isRecording = true;
      this.recordingDuration = 0;

      // Start recording timer
      this.recordingInterval = setInterval(() => {
        this.recordingDuration++;
      }, 1000);

      await this.audioService.startRecording();
    } catch (error) {
      console.error('Error starting recording:', error);
      this.isRecording = false;
      this.clearRecordingTimer();
    }
  }

  private async stopRecording() {
    try {
      this.isRecording = false;
      this.isProcessing = true;
      this.clearRecordingTimer();

      const audio = await this.audioService.stopRecording();
      this.sendVoice.emit(audio);
    } catch (error) {
      console.error('Error stopping recording:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private clearRecordingTimer() {
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }
  }

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  get canSend(): boolean {
    return (
      this.message.trim().length > 0 && !this.isProcessing && !this.isRecording
    );
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
