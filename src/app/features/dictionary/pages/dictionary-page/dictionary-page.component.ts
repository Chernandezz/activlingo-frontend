// dictionary-page.component.ts

import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DictionarySidebarComponent } from '../../components/dictionary-sidebar/dictionary-sidebar.component';
import { WordDetailsComponent } from '../../components/word-details/word-details.component';
import { DictionarySearchPanelComponent } from '../../components/dictionary-search-panel/dictionary-search-panel.component';
import { DictionaryService } from '../../services/dictionary.service';
import { AuthService } from '../../../../core/services/auth.service';
import {
  UserDictionaryEntry,
  WordDefinition,
  WordStatus,
} from '../../../../core/models/user-dictionary.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-dictionary-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DictionarySidebarComponent,
    WordDetailsComponent,
    DictionarySearchPanelComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './dictionary-page.component.html',
  styleUrls: ['./dictionary-page.component.scss'],
})
export class DictionaryPageComponent implements OnInit {
  private dictionaryService = inject(DictionaryService);
  private authService = inject(AuthService);

  // Estados reactivos con signals
  searchMode = signal(false);
  selectedWord = signal<UserDictionaryEntry | null>(null);
  filter = signal<WordStatus>('active');
  words = signal<UserDictionaryEntry[]>([]);
  isLoading = signal(false);

  // Computed values
  activeWordCount = computed(
    () => this.words().filter((w) => w.status === 'active').length
  );

  passiveWordCount = computed(
    () => this.words().filter((w) => w.status === 'passive').length
  );

  get userId(): string | null {
    return this.authService.getCurrentUser;
  }

  ngOnInit(): void {
    this.loadWords();

    // Escuchar actualizaciones
    this.dictionaryService.refresh$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.loadWords());
  }

  loadWords(): void {
    if (!this.userId) return;

    this.isLoading.set(true);
    this.dictionaryService.getUserWords(this.filter()).subscribe({
      next: (words) => {
        this.words.set(words);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  onSearchResults(results: WordDefinition[]): void {
    this.searchMode.set(false);
    // Opcional: manejar resultados si es necesario
  }

  onSelectWord(word: UserDictionaryEntry): void {
    this.selectedWord.set(word);
    // Registrar visualización como uso
    this.dictionaryService.logWordUsage(word.id, 'view-details').subscribe();
  }

  onFilterChange(filter: WordStatus): void {
    this.filter.set(filter);
    this.selectedWord.set(null);
    this.loadWords();
  }

  trackByWordId(index: number, word: UserDictionaryEntry): string {
    return 'asdfasdf';
  }
}
