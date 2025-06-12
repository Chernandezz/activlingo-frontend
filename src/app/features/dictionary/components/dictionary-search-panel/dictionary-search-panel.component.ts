import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DictionaryService } from '../../services/dictionary.service';
import { WordDefinition } from '../../../../core/models/user-dictionary.model';
import { AuthService } from '../../../../core/services/auth.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faCheck, faTimes, faSearch, faSpinner } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-dictionary-search-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './dictionary-search-panel.component.html',
})
export class DictionarySearchPanelComponent {
  private dictionaryService = inject(DictionaryService);
  private authService = inject(AuthService);

  // Iconos
  icons = {
    add: faPlus,
    added: faCheck,
    close: faTimes,
    search: faSearch,
    spinner: faSpinner, // Agregar este icono
  };

  // Estados
  searchTerm = signal('');
  results = signal<WordDefinition[]>([]);
  loading = signal(false);
  searchPerformed = signal(false);

  // Outputs
  @Output() exitSearch = new EventEmitter<void>();
  @Output() wordAdded = new EventEmitter<void>();

  // Realizar búsqueda
  searchWord(): void {
    const term = this.searchTerm().trim();
    if (!term) return;

    this.loading.set(true);
    this.searchPerformed.set(true);

    // Obtener definiciones y palabras del usuario al mismo tiempo
    this.dictionaryService.searchWord(term).subscribe({
      next: (definitions) => {
        this.dictionaryService.getUserWords().subscribe({
          next: (userWords) => {
            const resultsWithFlags = definitions.map((def) => {
              const alreadyExists = userWords.some(
                (w) =>
                  w.word.toLowerCase() === term.toLowerCase() &&
                  w.meaning.trim() === def.meaning.trim()
              );
              return { ...def, added: alreadyExists };
            });

            this.results.set(resultsWithFlags);
            this.loading.set(false);
          },
          error: () => {
            this.results.set([]);
            this.loading.set(false);
          },
        });
      },
      error: () => {
        this.results.set([]);
        this.loading.set(false);
      },
    });
  }

  // Agregar definición al diccionario
  addDefinitionToDictionary(def: WordDefinition): void {
    const userId = this.authService.currentUserId;
    if (!userId || def.added) return;

    const wordData = {
      word: this.searchTerm().trim(),
      meaning: def.meaning,
      part_of_speech: def.part_of_speech,
      example: def.example,
      source: def.source || 'ChatGPT',
      status: 'passive' as const,
    };

    this.dictionaryService.addWord(wordData).subscribe({
      next: () => {
        def.added = true;
        this.wordAdded.emit(); // Notificar que se agregó una palabra
      },
      error: (err) => console.error('Error saving word:', err),
    });
  }

  // Cerrar panel
  closeSearch(): void {
    this.exitSearch.emit();
  }

  // TrackBy function
  trackByMeaning(index: number, def: WordDefinition): string {
    return def.meaning;
  }
}
