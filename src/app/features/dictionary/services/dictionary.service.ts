import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { catchError, Observable, of, Subject, tap } from 'rxjs';
import {
  UserDictionaryEntry,
  WordDefinition,
} from '../../../core/models/user-dictionary.model';

@Injectable({ providedIn: 'root' })
export class DictionaryService {
  private apiUrl = environment.apiUrl;

  // Observable para que otros componentes escuchen cuando hay cambios
  private refreshWordsSubject = new Subject<void>();
  refreshWords$ = this.refreshWordsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ✅ Obtener todas las palabras del usuario
  getUserWords(
    userId: string,
    status?: 'active' | 'passive'
  ): Observable<WordDefinition[]> {
    let url = `${this.apiUrl}/?user_id=${userId}`;
    if (status) url += `&status=${status}`;
    return this.http.get<WordDefinition[]>(url);
  }

  // ✅ Obtener palabras por estado (active/passive)
  getWordsByStatus(
    userId: string,
    status: 'active' | 'passive'
  ): Observable<UserDictionaryEntry[]> {
    return this.http.get<UserDictionaryEntry[]>(
      `${this.apiUrl}/dictionary/by-status?user_id=${userId}&status=${status}`
    );
  }

  // ✅ Buscar definiciones desde la IA o cache
  searchWord(term: string): Observable<WordDefinition[]> {
    return this.http
      .get<WordDefinition[]>(
        `${this.apiUrl}/search?word=${encodeURIComponent(term)}`
      )
      .pipe(
        catchError(() => of([])) // Manejo de errores
      );
  }

  // ✅ Agregar una sola definición
  addWord(
    userId: string,
    data: Partial<WordDefinition>
  ): Observable<UserDictionaryEntry> {
    return this.http
      .post<UserDictionaryEntry>(
        `${this.apiUrl}/dictionary/?user_id=${userId}`,
        data
      )
      .pipe(tap(() => this.refreshWordsSubject.next()));
  }

  // ✅ Agregar múltiples definiciones (ideal después de buscar)
  addMultipleDefinitions(
    userId: string,
    definitions: Partial<WordDefinition>[]
  ): Observable<UserDictionaryEntry[]> {
    return this.http
      .post<UserDictionaryEntry[]>(
        `${this.apiUrl}/dictionary/add-multiple?user_id=${userId}`,
        definitions
      )
      .pipe(tap(() => this.refreshWordsSubject.next()));
  }

  // ✅ Eliminar palabra del diccionario
  deleteWord(userId: string, wordId: string): Observable<any> {
    return this.http
      .delete(
        `${this.apiUrl}/dictionary/${wordId}?user_id=${encodeURIComponent(
          userId
        )}`
      )
      .pipe(tap(() => this.refreshWordsSubject.next()));
  }

  // Opcional: Obtener detalles ampliados de una palabra (si haces endpoint)
  getWordDetails(
    userId: string,
    word: string
  ): Observable<UserDictionaryEntry[]> {
    return this.http.get<UserDictionaryEntry[]>(
      `${
        this.apiUrl
      }/dictionary/details?user_id=${userId}&word=${encodeURIComponent(word)}`
    );
  }
}
