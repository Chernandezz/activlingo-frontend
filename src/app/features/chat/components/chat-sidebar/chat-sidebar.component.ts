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
  template: `
    <div class="w-full h-full flex flex-col bg-gray-800 text-white">
      <div
        class="p-4 border-b border-gray-700 flex justify-between items-center"
      >
        <h1 class="text-xl font-bold">Mis Chats</h1>
        <!-- Toggle solo visible en desarrollo -->
        <div *ngIf="!environment.production" class="mt-2 text-xs">
          <button
            (click)="toggleStorageMode()"
            class="px-2 py-1 rounded text-xs"
            [class.bg-blue-600]="usingLocalStorage"
            [class.bg-green-600]="!usingLocalStorage"
          >
            {{ usingLocalStorage ? 'Usando LocalStorage' : 'Usando API' }}
          </button>
        </div>
      </div>

      <div class="flex-grow overflow-y-auto">
        <div
          *ngFor="let chat of chats$ | async"
          (click)="selectChat(chat.id)"
          class="p-3 hover:bg-gray-700 cursor-pointer transition-colors duration-200"
          [class.bg-gray-700]="(currentChat$ | async)?.id === chat.id"
        >
          <h3 class="font-medium truncate">{{ chat.title }}</h3>
          <div class="flex justify-between">
            <span class="text-xs text-blue-400"
              >{{ chat.language || 'en' }} ·
              {{ chat.level || 'beginner' }}</span
            >
            <span class="text-xs text-gray-400">{{
              chat.updatedAt | date : 'short'
            }}</span>
          </div>
        </div>

        <div
          *ngIf="(chats$ | async)?.length === 0"
          class="p-4 text-center text-gray-500"
        >
          No hay chats. Crea uno nuevo para comenzar.
        </div>
      </div>

      <div class="p-4 border-t border-gray-700">
        <button
          (click)="openScenarioSelector()"
          class="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center justify-center"
        >
          <span class="mr-2">+</span> Nuevo Chat
        </button>
      </div>
    </div>
  `,
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
