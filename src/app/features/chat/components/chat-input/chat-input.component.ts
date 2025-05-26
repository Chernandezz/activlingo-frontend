import {
  Component,
  EventEmitter,
  Output,
  Input,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AudioRecorderService } from '../../services/audio-recorder.service';
import { MessageService } from '../../services/message.service';
import { UiService } from '../../../../shared/services/ui.service';
import { Subscription } from 'rxjs';
import {
  faMicrophone,
  faStop,
  faPaperPlane,
  faSpinner,
  faComments,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';


@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './chat-input.component.html',
})
export class ChatInputComponent implements OnInit, OnDestroy {
  faMicrophone = faMicrophone;
  faStop = faStop;
  faPaperPlane = faPaperPlane;
  faSpinner = faSpinner;
  faComments = faComments;
  @Input() chatId!: string;
  @Output() send = new EventEmitter<string>();
  @Output() sendVoice = new EventEmitter<Blob>();

  message = '';
  isRecording = false;
  isProcessing = false;
  recordingDuration = 0;
  recordingInterval: any;

  private conversationActive = false;
  private subscriptions = new Subscription();

  constructor(
    private audioService: AudioRecorderService,
    private messageService: MessageService,
    public uiService: UiService
  ) {}

  conversationMode = false;

  ngOnInit(): void {
    this.subscriptions.add(
      this.uiService.conversationMode$.subscribe((isActive) => {
        this.conversationMode = isActive; // <-- local state
        if (isActive && !this.conversationActive) {
          this.startConversationLoop();
        } else if (!isActive && this.conversationActive) {
          this.stopConversationLoop();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.stopConversationLoop();
  }

  sendMessage(): void {
    const content = this.message.trim();
    if (!content || this.isProcessing || this.isRecording) return;

    this.send.emit(content);
    this.message = '';
  }

  async toggleRecording(): Promise<void> {
    if (!this.isRecording) {
      await this.startRecording();
    } else {
      await this.stopRecording();
    }
  }

  private async startRecording() {
    try {
      this.isRecording = true;
      this.recordingDuration = 0;
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

  async startConversationLoop(): Promise<void> {
    this.conversationActive = true;

    while (this.conversationActive) {
      const audio = await this.audioService.recordUntilSilence();
      if (!audio) continue;

      try {
        await this.messageService.sendVoiceMessageAndWait(this.chatId, audio);
      } catch (error) {
        console.error('❌ Error en modo conversación:', error);
        break;
      }

      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  stopConversationLoop(): void {
    this.conversationActive = false;

    if (this.isRecording) {
      this.stopRecording();
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
