import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../services/chat.service';
import { Observable } from 'rxjs';
import { Chat } from '../../../../core/models/chat.model';
import { Message } from '../../../../core/models/message.model';
import { ChatSidebarComponent } from '../../components/chat-sidebar/chat-sidebar.component';
import { ChatMessageComponent } from '../../components/chat-message/chat-message.component';
import { ChatInputComponent } from '../../components/chat-input/chat-input.component';
// import { ChatAnalysisComponent } from '../../../analysis/components/chat-analysis/chat-analysis.component';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [
    CommonModule,
    ChatSidebarComponent,
    // ChatMessageComponent,
    // ChatInputComponent,
    // ChatAnalysisComponent,
  ],
  templateUrl: './chat-page.component.html',
})
export class ChatPageComponent implements OnInit, AfterViewChecked {
  currentChat$: Observable<Chat | null>;
  // messages$: Observable<Message[]>;
  showAnalysis = false;

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  constructor(private chatService: ChatService) {
    this.currentChat$ = this.chatService.currentChat$;
    // this.messages$ = this.chatService.messages$;
  }

  ngOnInit(): void {}

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop =
        this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  toggleAnalysisView(): void {
    this.showAnalysis = !this.showAnalysis;
  }
}
