import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DictionaryService } from '../../services/dictionary.service';
import { WordDefinition } from '../../../../core/models/user-dictionary.model';

@Component({
  selector: 'app-dictionary-search-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dictionary-search-panel.component.html',
})
export class DictionarySearchPanelComponent {
  searchTerm = '';
  results: WordDefinition[] = [];

  @Output() searchCompleted = new EventEmitter<WordDefinition[]>();
  @Output() exitSearch = new EventEmitter<void>();

  constructor(private dictionaryService: DictionaryService) {}

  searchWord(): void {
    if (!this.searchTerm.trim()) return;

    this.dictionaryService
      .searchWord(this.searchTerm.trim())
      .subscribe((definitions) => {
        this.results = definitions;
        this.searchCompleted.emit(definitions);
      });
  }

  closeSearch(): void {
    this.exitSearch.emit();
  }
}
