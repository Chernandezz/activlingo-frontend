// dictionary.service.ts - OPTIMIZADO CON CACHE INTELIGENTE

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import {
  WordDefinition,
  UserDictionaryEntry,
  WordCreateDto,
  WordUpdateDto,
  PartOfSpeech,
} from '../../../core/models/user-dictionary.model';
import {
  Observable,
  BehaviorSubject,
  map,
  shareReplay,
  tap,
  switchMap,
  distinctUntilChanged,
  debounceTime,
  of,
} from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

interface CachedSearchResult {
  data: WordDefinition[];
  timestamp: number;
}

interface SearchWithUserCheckResult extends WordDefinition {
  added: boolean;
}

@Injectable({ providedIn: 'root' })
export class DictionaryService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private baseUrl = `${environment.apiUrl}/dictionary`;
  private _refresh$ = new BehaviorSubject<void>(undefined);

  // Cache inteligente
  private userWordsCache$ = new BehaviorSubject<UserDictionaryEntry[]>([]);
  private userWordsCacheTime = 0;
  private searchCache = new Map<string, CachedSearchResult>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos
  private readonly SEARCH_CACHE_TTL = 10 * 60 * 1000; // 10 minutos para búsquedas

  /**
   * Obtener palabras del usuario con cache inteligente
   */
  getUserWords(forceRefresh = false): Observable<UserDictionaryEntry[]> {
    const userId = this.authService.currentUserId;
    if (!userId) throw new Error('User not authenticated');

    const now = Date.now();
    const isCacheValid = now - this.userWordsCacheTime < this.CACHE_TTL;

    // Usar cache si es válido y no se fuerza refresh
    if (
      !forceRefresh &&
      isCacheValid &&
      this.userWordsCache$.value.length > 0
    ) {
      return this.userWordsCache$.asObservable();
    }

    const url = `${this.baseUrl}/?user_id=${userId}`;

    return this.http.get<UserDictionaryEntry[]>(url).pipe(
      tap((words) => {
        this.userWordsCache$.next(words);
        this.userWordsCacheTime = now;
        this.cacheUserWordsForSearch(words);
      }),
      shareReplay(1)
    );
  }

  /**
   * Buscar palabra con verificación de usuario optimizada
   */
  searchWordWithUserCheck(
    term: string
  ): Observable<SearchWithUserCheckResult[]> {
    const userId = this.authService.currentUserId;
    if (!userId) throw new Error('User not authenticated');

    const key = `${term.toLowerCase()}_${userId}`;
    const cached = this.searchCache.get(key);

    // Verificar cache de búsqueda
    if (cached && Date.now() - cached.timestamp < this.SEARCH_CACHE_TTL) {
      return of(cached.data as SearchWithUserCheckResult[]);
    }

    // Usar endpoint optimizado que combina búsqueda + verificación
    return this.http
      .get<SearchWithUserCheckResult[]>(
        `${this.baseUrl}/search-with-user-check?word=${encodeURIComponent(
          term
        )}&user_id=${userId}`
      )
      .pipe(
        tap((results) => {
          // Guardar en cache
          this.searchCache.set(key, {
            data: results,
            timestamp: Date.now(),
          });

          // Limpiar cache viejo (opcional)
          this.cleanOldSearchCache();
        }),
        shareReplay(1)
      );
  }

  /**
   * Búsqueda tradicional (para compatibilidad)
   */
  searchWord(
    term: string,
    useCache: boolean = true
  ): Observable<WordDefinition[]> {
    const key = term.toLowerCase();
    const cached = this.searchCache.get(key);

    if (
      useCache &&
      cached &&
      Date.now() - cached.timestamp < this.SEARCH_CACHE_TTL
    ) {
      return of(cached.data);
    }

    return this.http
      .get<WordDefinition[]>(
        `${this.baseUrl}/search?word=${encodeURIComponent(term)}`
      )
      .pipe(
        tap((defs) => {
          this.searchCache.set(key, {
            data: defs,
            timestamp: Date.now(),
          });
        }),
        shareReplay(1)
      );
  }

  /**
   * Búsqueda con debounce para autocompletado
   */
  searchSuggestions(term$: Observable<string>): Observable<WordDefinition[]> {
    return term$.pipe(
      debounceTime(600), // Aumentado para menos consultas
      distinctUntilChanged(),
      switchMap((term) => {
        if (term.length < 3) {
          // Mínimo 3 caracteres
          return of<WordDefinition[]>([]);
        }
        return this.searchWord(term);
      })
    );
  }

  /**
   * Añadir palabra con invalidación de cache
   */
  addWord(wordData: WordCreateDto): Observable<UserDictionaryEntry> {
    const userId = this.authService.currentUserId;
    if (!userId) throw new Error('User not authenticated');

    const payload = {
      ...wordData,
      status: 'passive',
      usage_count: 0,
      created_at: new Date().toISOString(),
    };

    return this.http
      .post<UserDictionaryEntry>(`${this.baseUrl}/?user_id=${userId}`, payload)
      .pipe(
        tap((newWord) => {
          // Actualizar cache local inmediatamente
          const currentWords = this.userWordsCache$.value;
          this.userWordsCache$.next([newWord, ...currentWords]);
          this.userWordsCacheTime = Date.now();

          // Invalidar cache de búsquedas que incluyen esta palabra
          this.invalidateSearchCacheForWord(newWord.word);

          // Disparar refresh para otros componentes
          this._refresh$.next();
        })
      );
  }

  /**
   * Actualizar palabra con cache update
   */
  updateWord(
    wordId: string,
    updates: WordUpdateDto
  ): Observable<UserDictionaryEntry> {
    const userId = this.authService.currentUserId;
    if (!userId) throw new Error('User not authenticated');

    return this.http
      .patch<UserDictionaryEntry>(
        `${this.baseUrl}/${wordId}?user_id=${userId}`,
        updates
      )
      .pipe(
        tap((updatedWord) => {
          // Actualizar en cache local
          const currentWords = this.userWordsCache$.value;
          const updatedWords = currentWords.map((word) =>
            word.id === updatedWord.id ? updatedWord : word
          );
          this.userWordsCache$.next(updatedWords);
          this.userWordsCacheTime = Date.now();

          this._refresh$.next();
        })
      );
  }

  /**
   * Eliminar palabra con cache update
   */
  deleteWord(wordId: string): Observable<void> {
    const userId = this.authService.currentUserId;
    if (!userId) throw new Error('User not authenticated');

    return this.http
      .delete<void>(`${this.baseUrl}/${wordId}?user_id=${userId}`)
      .pipe(
        tap(() => {
          // Remover del cache local
          const currentWords = this.userWordsCache$.value;
          const filteredWords = currentWords.filter(
            (word) => word.id !== wordId
          );
          this.userWordsCache$.next(filteredWords);
          this.userWordsCacheTime = Date.now();

          this._refresh$.next();
        })
      );
  }

  /**
   * Registrar uso de palabra
   */
  logWordUsage(wordId: string, context: string = 'chat'): Observable<void> {
    const userId = this.authService.currentUserId;
    if (!userId) throw new Error('User not authenticated');

    return this.http
      .post<void>(
        `${this.baseUrl}/log-usage?user_id=${userId}&word_id=${wordId}`,
        { context }
      )
      .pipe(
        tap(() => {
          // Actualizar cache local incrementando usage_count
          const currentWords = this.userWordsCache$.value;
          const updatedWords = currentWords.map((word) => {
            if (word.id === wordId) {
              return {
                ...word,
                usage_count: (word.usage_count || 0) + 1,
                last_used_at: new Date().toISOString(),
              };
            }
            return word;
          });
          this.userWordsCache$.next(updatedWords);
        })
      );
  }

  /**
   * Obtener palabras por categoría (usando cache)
   */
  getWordsByCategory(
    category: PartOfSpeech
  ): Observable<UserDictionaryEntry[]> {
    return this.getUserWords().pipe(
      map((words) => words.filter((word) => word.part_of_speech === category))
    );
  }

  /**
   * Obtener palabras difíciles (usando cache)
   */
  getDifficultWords(limit: number = 10): Observable<UserDictionaryEntry[]> {
    return this.getUserWords().pipe(
      map((words) => {
        return words
          .filter((word) => word.difficulty && word.difficulty >= 4)
          .sort((a, b) => (a.usage_count || 0) - (b.usage_count || 0))
          .slice(0, limit);
      })
    );
  }

  /**
   * Obtener palabras para repasar (usando cache)
   */
  getWordsToReview(): Observable<UserDictionaryEntry[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.getUserWords().pipe(
      map((words) =>
        words.filter((word) => {
          if (!word.last_used_at) return true;
          return new Date(word.last_used_at) < thirtyDaysAgo;
        })
      )
    );
  }

  /**
   * Observable de refresh
   */
  get refresh$(): Observable<void> {
    return this._refresh$.asObservable();
  }

  /**
   * Obtener estadísticas del cache
   */
  getCacheStats() {
    return {
      userWordsCount: this.userWordsCache$.value.length,
      userWordsCacheAge: Date.now() - this.userWordsCacheTime,
      searchCacheSize: this.searchCache.size,
      isUserWordsCacheValid:
        Date.now() - this.userWordsCacheTime < this.CACHE_TTL,
    };
  }

  /**
   * Limpiar cache manualmente
   */
  clearCache(): void {
    this.userWordsCache$.next([]);
    this.userWordsCacheTime = 0;
    this.searchCache.clear();
  }

  /**
   * Forzar refresh de palabras del usuario
   */
  refreshUserWords(): Observable<UserDictionaryEntry[]> {
    return this.getUserWords(true);
  }

  // ========== MÉTODOS PRIVADOS PARA GESTIÓN DE CACHE ==========

  /**
   * Cache palabras del usuario para búsquedas (compatibilidad)
   */
  private cacheUserWordsForSearch(words: UserDictionaryEntry[]): void {
    words.forEach((word) => {
      const key = word.word.toLowerCase();
      if (!this.searchCache.has(key)) {
        this.searchCache.set(key, {
          data: [
            {
              word: word.word,
              meaning: word.meaning,
              part_of_speech: word.part_of_speech,
              example: word.example,
              source: word.source,
              synonyms: word.synonyms,
              antonyms: word.antonyms,
              usage_context: word.usage_context,
              is_idiomatic: word.is_idiomatic,
              frequency: word.frequency,
              register: word.register,
            },
          ],
          timestamp: Date.now(),
        });
      }
    });
  }

  /**
   * Invalidar cache de búsquedas para una palabra específica
   */
  private invalidateSearchCacheForWord(word: string): void {
    const wordKey = word.toLowerCase();
    const userId = this.authService.currentUserId;

    // Remover entradas relacionadas
    const keysToRemove: string[] = [];
    this.searchCache.forEach((_, key) => {
      if (key.includes(wordKey) || key.includes(userId || '')) {
        keysToRemove.push(key);
      }
    });

    keysToRemove.forEach((key) => this.searchCache.delete(key));
  }

  /**
   * Limpiar cache de búsquedas antiguo
   */
  private cleanOldSearchCache(): void {
    const now = Date.now();
    const keysToRemove: string[] = [];

    this.searchCache.forEach((cached, key) => {
      if (now - cached.timestamp > this.SEARCH_CACHE_TTL) {
        keysToRemove.push(key);
      }
    });

    keysToRemove.forEach((key) => this.searchCache.delete(key));
  }
}
