// dictionary-search-panel.component.ts - VERSIÓN FINAL OPTIMIZADA
import {
  Component,
  EventEmitter,
  Output,
  inject,
  signal,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DictionaryService } from '../../services/dictionary.service';
import { WordDefinition } from '../../../../core/models/user-dictionary.model';
import { AuthService } from '../../../../core/services/auth.service';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

interface SearchResultWithFlag extends WordDefinition {
  added: boolean;
}

@Component({
  selector: 'app-dictionary-search-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dictionary-search-panel.component.html',
})
export class DictionarySearchPanelComponent implements OnInit, OnDestroy {
  private dictionaryService = inject(DictionaryService);
  private authService = inject(AuthService);
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // Estados
  searchTerm = signal('');
  results = signal<SearchResultWithFlag[]>([]);
  loading = signal(false);
  searchPerformed = signal(false);
  isAdding = signal<string>('');

  // Outputs
  @Output() exitSearch = new EventEmitter<void>();
  @Output() wordAdded = new EventEmitter<void>();

  ngOnInit() {
    this.setupOptimizedSearch();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Setup de búsqueda optimizada con menos consultas
   */
  private setupOptimizedSearch(): void {
    this.searchSubject
      .pipe(
        debounceTime(600), // Aumentado para menos consultas al backend
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((term) => {
        if (term.trim().length >= 3) {
          // Mínimo 3 caracteres para búsqueda
          this.performOptimizedSearch(term);
        }
      });
  }

  /**
   * Maneja input de búsqueda con validación mejorada
   */
  onSearchInput(): void {
    const term = this.searchTerm().trim();

    if (term.length >= 3) {
      this.searchSubject.next(term);
    } else if (term.length === 0) {
      this.clearResults();
    } else {
      // Mostrar mensaje de ayuda para términos muy cortos
      this.searchPerformed.set(false);
    }
  }

  /**
   * Búsqueda manual optimizada (enter o botón)
   */
  searchWord(): void {
    const term = this.searchTerm().trim();
    if (term.length < 2) return;

    this.performOptimizedSearch(term);
  }

  /**
   * Búsqueda optimizada usando endpoint combinado
   */
  private performOptimizedSearch(term: string): void {
    this.loading.set(true);
    this.searchPerformed.set(true);

    // Usar método optimizado que combina búsqueda + verificación de usuario
    this.dictionaryService.searchWordWithUserCheck(term).subscribe({
      next: (results) => {
        this.results.set(results);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error in optimized search:', error);

        // Fallback a búsqueda tradicional si el endpoint optimizado falla
        this.fallbackSearch(term);
      },
    });
  }

  /**
   * Búsqueda fallback usando método tradicional
   */
  private fallbackSearch(term: string): void {
    this.dictionaryService.searchWord(term).subscribe({
      next: (definitions) => {
        // Usar cache local de palabras del usuario
        this.dictionaryService.getUserWords().subscribe({
          next: (userWords) => {
            const resultsWithFlags = definitions.map((def) => {
              const alreadyExists = userWords.some(
                (w) =>
                  w.word.toLowerCase() === term.toLowerCase() &&
                  w.meaning.trim().toLowerCase() ===
                    def.meaning.trim().toLowerCase()
              );
              return { ...def, added: alreadyExists };
            });

            this.results.set(resultsWithFlags);
            this.loading.set(false);
          },
          error: () => {
            this.results.set(
              definitions.map((def) => ({ ...def, added: false }))
            );
            this.loading.set(false);
          },
        });
      },
      error: (error) => {
        console.error('Error in fallback search:', error);
        this.results.set([]);
        this.loading.set(false);
      },
    });
  }

  /**
   * Agregar definición optimizada
   */
  addDefinitionToDictionary(def: SearchResultWithFlag): void {
    if (def.added || this.isAdding()) return;

    const searchTerm = this.searchTerm().trim();
    this.isAdding.set(def.meaning);

    const wordData = {
      word: searchTerm,
      meaning: def.meaning,
      part_of_speech: def.part_of_speech,
      example: def.example || '',
      source: def.source || 'WordsAPI',
      usage_context: def.usage_context || 'general',
      is_idiomatic: def.is_idiomatic || false,
    };

    this.dictionaryService.addWord(wordData).subscribe({
      next: (newWord) => {
        // El servicio ya actualiza su cache interno
        def.added = true;
        this.isAdding.set('');

        this.wordAdded.emit();

        // Actualizar resultados localmente
        const currentResults = this.results();
        const updatedResults = currentResults.map((result) =>
          result.meaning === def.meaning ? { ...result, added: true } : result
        );
        this.results.set(updatedResults);
      },
      error: (err) => {
        console.error('Error saving word:', err);
        this.isAdding.set('');
        this.showErrorMessage(
          'Error al agregar la palabra. Inténtalo de nuevo.'
        );
      },
    });
  }

  /**
   * Obtiene etiqueta traducida para tipo de palabra
   */
  getPartOfSpeechLabel(partOfSpeech?: string): string {
    if (!partOfSpeech) return 'palabra';

    const labels: { [key: string]: string } = {
      noun: 'sustantivo',
      verb: 'verbo',
      adjective: 'adjetivo',
      adverb: 'adverbio',
      preposition: 'preposición',
      conjunction: 'conjunción',
      pronoun: 'pronombre',
      article: 'artículo',
      phrasal_verb: 'verbo frasal',
      idiom: 'expresión',
      expression: 'expresión',
      interjection: 'interjección',
    };

    return labels[partOfSpeech.toLowerCase()] || partOfSpeech;
  }

  capitalizeSentence(text: string): string {
    return text
      .split('. ')
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join('. ');
  }

  /**
   * Mostrar mensaje de error (puede ser customizado)
   */
  private showErrorMessage(message: string): void {
    // Por ahora usamos alert, pero se puede integrar con un toast service
    alert(message);
  }

  /**
   * Limpiar resultados
   */
  private clearResults(): void {
    this.results.set([]);
    this.searchPerformed.set(false);
    this.loading.set(false);
  }

  /**
   * Cerrar panel
   */
  closeSearch(): void {
    this.clearResults();
    this.searchTerm.set('');
    this.exitSearch.emit();
  }

  /**
   * TrackBy optimizado
   */
  trackByMeaning(index: number, def: SearchResultWithFlag): string {
    return `${def.meaning}-${def.part_of_speech}-${def.source}`;
  }

  /**
   * Verificar si búsqueda es válida
   */
  get isSearchValid(): boolean {
    return this.searchTerm().trim().length >= 2;
  }

  /**
   * Obtener placeholder dinámico
   */
  get searchPlaceholder(): string {
    const term = this.searchTerm().trim();
    if (term.length === 1) {
      return 'Escribe al menos 2 caracteres...';
    }
    if (term.length === 2) {
      return 'Un carácter más para buscar...';
    }
    return 'Buscar palabra en inglés...';
  }

  /**
   * Mensaje de estado dinámico
   */
  getStatusMessage(): string {
    if (this.loading()) return 'Buscando definiciones...';
    if (this.searchPerformed() && this.results().length === 0)
      return 'No se encontraron definiciones';
    if (this.results().length > 0)
      return `${this.results().length} definiciones encontradas`;

    const term = this.searchTerm().trim();
    if (term.length === 0) return 'Escribe una palabra para buscar';
    if (term.length < 3) return 'Escribe al menos 3 caracteres';

    return 'Presiona Enter o el botón Buscar';
  }

  /**
   * Estadísticas para debugging (development only)
   */
  getCacheStats() {
    return this.dictionaryService.getCacheStats();
  }
}
