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
  @Input() activeFilter: 'all' | WordStatus = 'all';
  @Input() activeCount: number = 0;
  @Input() passiveCount: number = 0;
  @Input() totalCount: number = 0;
  @Input() loading: boolean = false;

  // Outputs - CORREGIDO: ahora emite 'all' | WordStatus
  @Output() selectWord = new EventEmitter<UserDictionaryEntry>();
  @Output() startSearch = new EventEmitter<void>();
  @Output() filterChanged = new EventEmitter<'all' | WordStatus>();

  // Estado local
  searchTerm = signal('');

  // Computed para filtrar palabras basado en término de búsqueda
  filteredWords = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.words;

    return this.words.filter(
      (word) =>
        word.word.toLowerCase().includes(term) ||
        word.meaning.toLowerCase().includes(term)
    );
  });

  // Manejar cambio de filtro - CORREGIDO: acepta 'all' | WordStatus
  onFilterSelect(filter: 'all' | WordStatus): void {
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

  // Limpiar búsqueda
  clearSearch(): void {
    this.searchTerm.set('');
  }
}
