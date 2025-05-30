// dictionary.service.ts

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

@Injectable({ providedIn: 'root' })
export class DictionaryService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private baseUrl = `${environment.apiUrl}/dictionary`;
  private _refresh$ = new BehaviorSubject<void>(undefined);

  // Cache para palabras buscadas
  private cache = new Map<string, WordDefinition[]>();

  // Obtener todas las palabras del usuario
  getUserWords(
    status?: 'active' | 'passive'
  ): Observable<UserDictionaryEntry[]> {
    const userId = this.authService.getCurrentUser;
    if (!userId) throw new Error('User not authenticated');

    let url = `${this.baseUrl}/?user_id=${userId}`;
    if (status) url += `&status=${status}`;

    return this.http.get<UserDictionaryEntry[]>(url).pipe(
      tap((words) => this.cacheUserWords(words)),
      shareReplay(1)
    );
  }

  // Buscar definiciones de una palabra
  searchWord(
    term: string,
    useCache: boolean = true
  ): Observable<WordDefinition[]> {
    const cached = this.cache.get(term.toLowerCase());
    if (useCache && cached) return of(cached);

    return this.http
      .get<WordDefinition[]>(
        `${this.baseUrl}/search?word=${encodeURIComponent(term)}`
      )
      .pipe(
        tap((definitions) => this.cache.set(term.toLowerCase(), definitions)),
        shareReplay(1)
      );
  }

  // Búsqueda con debounce para autocompletado
  searchSuggestions(term$: Observable<string>): Observable<WordDefinition[]> {
    return term$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) => (term.length > 2 ? this.searchWord(term) : of([])))
    );
  }

  // Añadir nueva palabra al diccionario
  addWord(wordData: WordCreateDto): Observable<UserDictionaryEntry> {
    const userId = this.authService.getCurrentUser;
    if (!userId) throw new Error('User not authenticated');

    return this.http
      .post<UserDictionaryEntry>(`${this.baseUrl}/?user_id=${userId}`, wordData)
      .pipe(tap(() => this._refresh$.next()));
  }

  // Actualizar palabra existente
  updateWord(
    wordId: string,
    updates: WordUpdateDto
  ): Observable<UserDictionaryEntry> {
    const userId = this.authService.getCurrentUser;
    if (!userId) throw new Error('User not authenticated');

    return this.http
      .patch<UserDictionaryEntry>(
        `${this.baseUrl}/${wordId}?user_id=${userId}`,
        updates
      )
      .pipe(tap(() => this._refresh$.next()));
  }

  // Eliminar palabra
  deleteWord(wordId: string): Observable<void> {
    const userId = this.authService.getCurrentUser;
    if (!userId) throw new Error('User not authenticated');

    return this.http
      .delete<void>(`${this.baseUrl}/${wordId}?user_id=${userId}`)
      .pipe(tap(() => this._refresh$.next()));
  }

  // Registrar uso de palabra en un chat
  logWordUsage(wordId: string, context: string = 'chat'): Observable<void> {
    const userId = this.authService.getCurrentUser;
    if (!userId) throw new Error('User not authenticated');

    return this.http.post<void>(
      `${this.baseUrl}/log-usage?user_id=${userId}&word_id=${wordId}`,
      { context }
    );
  }

  // Obtener palabras por categoría
  getWordsByCategory(
    category: PartOfSpeech
  ): Observable<UserDictionaryEntry[]> {
    return this.getUserWords().pipe(
      map((words) => words.filter((word) => word.part_of_speech === category))
    );
  }

  // Obtener palabras difíciles (menos usadas o con alta dificultad)
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

  // Obtener palabras para repasar (usadas hace más de 30 días)
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

  // Refresh observable
  get refresh$(): Observable<void> {
    return this._refresh$.asObservable();
  }

  // Cachear palabras del usuario
  private cacheUserWords(words: UserDictionaryEntry[]): void {
    words.forEach((word) => {
      if (!this.cache.has(word.word.toLowerCase())) {
        this.cache.set(word.word.toLowerCase(), [
          {
            word: word.word,
            meaning: word.meaning,
            part_of_speech: word.part_of_speech,
            example: word.example,
            source: word.source,
            frequency: word.frequency,
            register: word.register,
          },
        ]);
      }
    });
  }
}
