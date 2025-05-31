import {
  Component,
  Input,
  Output,
  EventEmitter,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  UserDictionaryEntry,
  WordStatus,
} from '../../../../core/models/user-dictionary.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSearch, faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-dictionary-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './dictionary-sidebar.component.html',
})
export class DictionarySidebarComponent {
  // Iconos
  icons = {
    search: faSearch,
    plus: faPlus,
    spinner: faSpinner,
  };

  // Inputs
  @Input() words: UserDictionaryEntry[] = [];
  @Input() activeFilter: WordStatus = 'active';
  @Input() activeCount: number = 0;
  @Input() passiveCount: number = 0;
  @Input() loading: boolean = false;

  // Outputs
  @Output() selectWord = new EventEmitter<UserDictionaryEntry>();
  @Output() startSearch = new EventEmitter<void>();
  @Output() filterChanged = new EventEmitter<WordStatus>();

  // Estado local
  searchTerm = signal('');
  selectedFilter = signal<WordStatus>('active');

  // Palabras filtradas computadas
  filteredWords = computed(() => {
    return this.words.filter(
      (word) =>
        word.word.toLowerCase().includes(this.searchTerm().toLowerCase()) &&
        word.status === this.selectedFilter()
    );
  });

  // Manejar cambio de filtro
  onFilterSelect(filter: WordStatus): void {
    this.selectedFilter.set(filter);
    this.filterChanged.emit(filter);
  }

  // Seleccionar palabra
  onSelect(word: UserDictionaryEntry): void {
    this.selectWord.emit(word);
  }

  // TrackBy function
  trackByWordId(index: number, word: UserDictionaryEntry): string {
    return word.id;
  }
}
