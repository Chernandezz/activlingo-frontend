import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DictionaryService } from '../../services/dictionary.service';
import { WordDefinition } from '../../../../core/models/user-dictionary.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-dictionary-search-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dictionary-search-panel.component.html',
})
export class DictionarySearchPanelComponent {
  searchTerm = '';
  results: WordDefinition[] = [];
  loading = false;

  @Output() searchCompleted = new EventEmitter<WordDefinition[]>();
  @Output() exitSearch = new EventEmitter<void>();
  @Output() selectDefinition = new EventEmitter<WordDefinition>();

  constructor(
    private dictionaryService: DictionaryService,
    private authService: AuthService
  ) {}

  searchWord(): void {
    const term = this.searchTerm.trim();
    if (!term) return;

    this.loading = true;
    this.dictionaryService.searchWord(term).subscribe({
      next: (definitions) => {
        this.results = definitions;
        this.searchCompleted.emit(definitions);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  closeSearch(): void {
    this.exitSearch.emit();
  }

  addDefinitionToDictionary(def: WordDefinition): void {
    const userId = this.authService.getCurrentUser;
    if (!userId) return;

    const payload = {
      word: this.searchTerm.trim(),
      meaning: def.meaning,
      part_of_speech: def.part_of_speech,
      example: def.example,
      source: def.source,
    };

    this.dictionaryService.addWord(userId, payload).subscribe({
      next: () => (def.added = true),
      error: (err) => console.error('Error saving word:', err),
    });
  }
}
