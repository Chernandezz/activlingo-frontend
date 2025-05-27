import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable, Subject, tap } from 'rxjs';
import { WordDefinition } from '../../../core/models/user-dictionary.model';

@Injectable({ providedIn: 'root' })
export class DictionaryService {
  private apiUrl = environment.apiUrl;
  private refreshWordsSubject = new Subject<void>();
  refreshWords$ = this.refreshWordsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getUserWords(userId: string): Observable<WordDefinition[]> {
    return this.http.get<WordDefinition[]>(
      `${this.apiUrl}/dictionary/?user_id=${userId}`
    );
  }

  getWordDetails(userId: string, word: string): Observable<WordDefinition[]> {
    return this.http.get<WordDefinition[]>(
      `${
        this.apiUrl
      }/dictionary/details?user_id=${userId}&word=${encodeURIComponent(word)}`
    );
  }

  addWord(userId: string, data: Partial<WordDefinition>): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/dictionary/?user_id=${userId}`, data)
      .pipe(tap(() => this.refreshWordsSubject.next()));
  }
  searchWord(term: string): Observable<WordDefinition[]> {
    return this.http.get<WordDefinition[]>(
      `${this.apiUrl}/dictionary/search?word=${encodeURIComponent(term)}`
    );
  }
}
