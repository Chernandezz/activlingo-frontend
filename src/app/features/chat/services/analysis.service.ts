import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { LanguageAnalysisPoint } from '../models/language-analysis.model';

@Injectable({ providedIn: 'root' })
export class AnalysisService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAnalysisPointsForChat(
    chatId: string
  ): Observable<LanguageAnalysisPoint[]> {
    return this.http.get<LanguageAnalysisPoint[]>(
      `${this.apiUrl}/analysis/${chatId}`
    );
  }
}
