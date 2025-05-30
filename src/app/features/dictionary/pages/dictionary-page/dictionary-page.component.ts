import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DictionarySidebarComponent } from '../../components/dictionary-sidebar/dictionary-sidebar.component';
import { WordDetailsComponent } from '../../components/word-details/word-details.component';
import { DictionarySearchPanelComponent } from '../../components/dictionary-search-panel/dictionary-search-panel.component';
import { DictionaryService } from '../../services/dictionary.service';
import { AuthService } from '../../../../core/services/auth.service';
import {
  UserDictionaryEntry,
  WordDefinition,
} from '../../../../core/models/user-dictionary.model';

@Component({
  selector: 'app-dictionary-page',
  standalone: true,
  imports: [
    CommonModule,
    DictionarySidebarComponent,
    WordDetailsComponent,
    DictionarySearchPanelComponent,
  ],
  templateUrl: './dictionary-page.component.html',
})
export class DictionaryPageComponent implements OnInit {
  searchMode = false;
  selectedWord: UserDictionaryEntry | null = null;
  filter: 'active' | 'passive' = 'active';

  words: UserDictionaryEntry[] = [];

  constructor(
    private dictionaryService: DictionaryService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadWords();
    this.dictionaryService.refreshWords$.subscribe(() => this.loadWords());
  }

  get userId(): string | null {
    return this.authService.getCurrentUser;
  }

  loadWords(): void {
    if (!this.userId) return;
    this.dictionaryService
      .getWordsByStatus(this.userId, this.filter)
      .subscribe((entries) => {
        this.words = entries;
      });
  }

  onSearchResults(results: WordDefinition[]): void {
    this.searchMode = false;
  }

  onSelectWord(word: UserDictionaryEntry): void {
    this.selectedWord = word;
  }

  onFilterChange(filter: 'active' | 'passive'): void {
    this.filter = filter;
    this.selectedWord = null;
    this.loadWords();
  }
}
