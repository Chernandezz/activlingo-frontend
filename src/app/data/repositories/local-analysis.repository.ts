// src/app/data/repositories/local-analysis.repository.ts
import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { LanguageAnalysisPoint } from '../../features/chat/models/language-analysis.model';

@Injectable()
export class LocalAnalysisRepository {
  private ANALYSIS_POINTS_KEY = 'language_app_analysis_points';

  constructor() {
    // Inicializar localStorage si no existe
    if (!localStorage.getItem(this.ANALYSIS_POINTS_KEY)) {
      localStorage.setItem(this.ANALYSIS_POINTS_KEY, JSON.stringify([]));
    }
  }

  saveAnalysisPoint(
    point: LanguageAnalysisPoint
  ): Observable<LanguageAnalysisPoint> {
    const points = JSON.parse(
      localStorage.getItem(this.ANALYSIS_POINTS_KEY) || '[]'
    );
    points.push(point);
    localStorage.setItem(this.ANALYSIS_POINTS_KEY, JSON.stringify(points));
    return of(point).pipe(delay(300));
  }

  getAnalysisPointsForChat(
    chatId: string
  ): Observable<LanguageAnalysisPoint[]> {
    const points = JSON.parse(
      localStorage.getItem(this.ANALYSIS_POINTS_KEY) || '[]'
    );
    const chatPoints = points.filter(
      (p: LanguageAnalysisPoint) => p.chatId === chatId
    );
    return of(chatPoints).pipe(delay(300));
  }

  getAllAnalysisPoints(): Observable<LanguageAnalysisPoint[]> {
    const points = JSON.parse(
      localStorage.getItem(this.ANALYSIS_POINTS_KEY) || '[]'
    );
    return of(points).pipe(delay(300));
  }

  markAsReviewed(pointId: string): Observable<void> {
    const points = JSON.parse(
      localStorage.getItem(this.ANALYSIS_POINTS_KEY) || '[]'
    );
    const index = points.findIndex(
      (p: LanguageAnalysisPoint) => p.id === pointId
    );

    if (index !== -1) {
      points[index].reviewed = true;
      localStorage.setItem(this.ANALYSIS_POINTS_KEY, JSON.stringify(points));
    }

    return of(undefined).pipe(delay(300));
  }
}
