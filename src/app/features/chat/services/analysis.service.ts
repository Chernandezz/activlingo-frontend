// analysis.service.ts - VERSIÓN COMPLETA
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { LanguageAnalysisPoint } from '../models/language-analysis.model';

// 🆕 Interfaces para las nuevas funcionalidades
export interface ChatStats {
  total_errors: number;
  by_category: Record<string, number>;
  overall_score: number;
  improvement_areas: string[];
}

export interface DictionaryWord {
  word: string;
  meaning: string;
  usage_count: number;
}

export interface DictionaryWordsResponse {
  words_used: DictionaryWord[];
  total_count: number;
}

export interface ChatAnalysisSummary {
  analysis_points: LanguageAnalysisPoint[];
  stats: ChatStats;
  dictionary_words_used: DictionaryWord[];
  summary: {
    total_points: number;
    score: number;
    dictionary_words_count: number;
    top_improvement_area: string | null;
  };
}

@Injectable({ providedIn: 'root' })
export class AnalysisService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Endpoint original
  getAnalysisPointsForChat(
    chatId: string
  ): Observable<LanguageAnalysisPoint[]> {
    return this.http.get<LanguageAnalysisPoint[]>(
      `${this.apiUrl}/analysis/${chatId}`
    );
  }

  // 🆕 Obtener estadísticas del chat
  getChatStats(chatId: string): Observable<ChatStats> {
    return this.http.get<ChatStats>(`${this.apiUrl}/analysis/${chatId}/stats`);
  }

  // 🆕 Obtener palabras del diccionario usadas
  getDictionaryWordsUsed(chatId: string): Observable<DictionaryWordsResponse> {
    return this.http.get<DictionaryWordsResponse>(
      `${this.apiUrl}/analysis/${chatId}/dictionary-words`
    );
  }

  // 🆕 Obtener resumen completo del análisis
  getChatAnalysisSummary(chatId: string): Observable<ChatAnalysisSummary> {
    return this.http.get<ChatAnalysisSummary>(
      `${this.apiUrl}/analysis/${chatId}/summary`
    );
  }
}
