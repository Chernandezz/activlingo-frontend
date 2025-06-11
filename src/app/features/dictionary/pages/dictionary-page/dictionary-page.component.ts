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
})
export class DictionaryPageComponent implements OnInit {
  private dictionaryService = inject(DictionaryService);
  private authService = inject(AuthService);

  searchMode = signal(false);
  selectedWord = signal<UserDictionaryEntry | null>(null);
  filter = signal<'all' | WordStatus>('all');
  words = signal<UserDictionaryEntry[]>([]);
  isLoading = signal(false);

  private cacheKey = '';

  // Computed
  activeWordCount = computed(
    () => this.words().filter((w) => w.status === 'active').length
  );

  passiveWordCount = computed(
    () => this.words().filter((w) => w.status === 'passive').length
  );

  totalWordCount = computed(
    () => this.activeWordCount() + this.passiveWordCount()
  );

  filteredWords = computed(() => {
    const selected = this.filter();
    return this.words().filter((word) =>
      selected === 'all' ? true : word.status === selected
    );
  });

  get userId(): string | null {
    return this.authService.currentUserId;
  }

  ngOnInit(): void {
    if (!this.userId) return;

    this.cacheKey = `user_words_${this.userId}`;
    this.loadWordsFromCache(); // instantáneo, sin loading

    this.loadWordsFromBackend(); // carga en segundo plano sin forzar loading si ya hay palabras

    this.dictionaryService.refresh$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.loadWordsFromBackend(true)); // fuerza loading al refrescar manualmente
  }

  loadWordsFromCache(): void {
    const cached = localStorage.getItem(this.cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as UserDictionaryEntry[];
        this.words.set(parsed);
      } catch (e) {
        console.error('Error parsing dictionary cache:', e);
      }
    }
  }

  loadWordsFromBackend(forceLoading: boolean = false): void {
    if (!this.userId) return;

    // Solo mostrar spinner si no hay palabras
    if (forceLoading || this.words().length === 0) {
      this.isLoading.set(true);
    }

    this.dictionaryService.getUserWords().subscribe({
      next: (words) => {
        this.words.set(words);
        localStorage.setItem(this.cacheKey, JSON.stringify(words));
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  handleWordAdded(): void {
    this.loadWordsFromBackend();
    this.searchMode.set(false);
  }

  onSearchResults(results: WordDefinition[]): void {
    this.searchMode.set(false);
  }

  onSelectWord(word: UserDictionaryEntry): void {
    this.selectedWord.set(word);
    this.dictionaryService.logWordUsage(word.id, 'view-details').subscribe({
      error: (err) => console.error('Error logging word usage:', err),
    });
  }

  onFilterChange(filter: 'all' | WordStatus): void {
    this.filter.set(filter);
    this.selectedWord.set(null);
  }

  trackByWordId(index: number, word: UserDictionaryEntry): string {
    return word.id;
  }
}
