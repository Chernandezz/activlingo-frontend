import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../services/chat.service';
import { Chat } from '../../../../core/models/chat.model';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { MockScenarioService } from '../../../scenarios/services/mock-scenario.service';
import { ConversationScenario } from '../../models/scenario.model';

@Component({
  selector: 'app-chat-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-sidebar.component.html',
})
export class ChatSidebarComponent implements OnInit {
  chats$: Observable<Chat[]>;
  currentChat$: Observable<Chat | null>;
  usingLocalStorage = environment.useLocalStorage;
  environment = environment;
  availableScenarios: ConversationScenario[] = [];

  constructor(
    private chatService: ChatService,
    private scenarioService: MockScenarioService
  ) {
    this.chats$ = this.chatService.chats$;
    this.currentChat$ = this.chatService.currentChat$;
  }

  ngOnInit(): void {
    this.loadScenarios();
  }

  loadScenarios(): void {
    this.scenarioService.getAvailableScenarios().subscribe((scenarios) => {
      this.availableScenarios = scenarios;
    });
  }

  selectChat(chatId: string): void {
    this.chatService.selectChat(chatId);
  }

  openScenarioSelector(): void {
    // En una implementación real, abriríamos un modal o diálogo
    // Por ahora, haremos una versión simplificada con prompt

    let scenarioOptions = 'Selecciona un escenario:\n';
    this.availableScenarios.forEach((scenario, index) => {
      scenarioOptions += `${index + 1}. ${scenario.title} (${
        scenario.language
      }) - ${scenario.level}\n`;
    });

    const selectedIndex = prompt(scenarioOptions);

    if (selectedIndex && !isNaN(Number(selectedIndex))) {
      const index = Number(selectedIndex) - 1;

      if (index >= 0 && index < this.availableScenarios.length) {
        const scenario = this.availableScenarios[index];
        const title =
          prompt('Título para este chat:', scenario.title) || scenario.title;

        // Crear chat con datos del escenario
        this.chatService
          .createChat({
            title: title,
            scenario: scenario.description,
            language: scenario.language,
            level: scenario.level,
          })
          .subscribe();
      }
    }
  }

  toggleStorageMode(): void {
    this.usingLocalStorage = !this.usingLocalStorage;
    this.chatService.setUseLocalStorage(this.usingLocalStorage);
  }
}
