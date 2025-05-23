// chat-input.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
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
  @Output() send = new EventEmitter<string>();
  @Output() sendVoice = new EventEmitter<Blob>();

  isRecording = false;
  isProcessing = false;

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
      const audio = await this.audioService.stopRecording();
      console.log('🎧 Audio grabado:', audio);

      // OPCIONAL: reproducir para probar
      const audioUrl = URL.createObjectURL(audio);
      const audioElement = new Audio(audioUrl);
      audioElement.play();

      this.sendVoice.emit(audio);
    }
  }
}
