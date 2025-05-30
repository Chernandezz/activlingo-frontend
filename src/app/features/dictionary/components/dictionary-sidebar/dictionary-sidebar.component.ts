import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserDictionaryEntry } from '../../../../core/models/user-dictionary.model';

@Component({
  selector: 'app-dictionary-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dictionary-sidebar.component.html',
})
export class DictionarySidebarComponent {
  @Input() words: UserDictionaryEntry[] = [];
  @Output() selectWord = new EventEmitter<UserDictionaryEntry>();
  @Output() startSearch = new EventEmitter<void>();
  @Output() filterChanged = new EventEmitter<'active' | 'passive'>();

  onFilterSelect(f: 'active' | 'passive') {
    this.filter = f;
    this.filterChanged.emit(f);
  }

  filter: 'active' | 'passive' = 'active';
  searchTerm: string = '';

  onSelect(word: UserDictionaryEntry): void {
    this.selectWord.emit(word);
  }

  get filteredWords(): UserDictionaryEntry[] {
    return this.words.filter(
      (w) =>
        w.word.toLowerCase().includes(this.searchTerm.toLowerCase()) &&
        w.status === this.filter
    );
  }
}
