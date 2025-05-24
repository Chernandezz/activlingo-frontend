// chat-analysis.component.ts
import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { LanguageAnalysisPoint } from '../../../chat/models/language-analysis.model';
import { AnalysisService } from '../../../chat/services/analysis.service';

@Component({
  selector: 'app-chat-analysis',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-analysis.component.html',
})
export class ChatAnalysisComponent implements OnChanges {
  @Input() chatId: number | undefined;

  private analysisPointsSubject = new BehaviorSubject<LanguageAnalysisPoint[]>(
    []
  );
  analysisPoints$ = this.analysisPointsSubject.asObservable();

  expandedPoints = new Set<number>();

  constructor(private analysisService: AnalysisService) {}

  ngOnChanges(): void {
    if (this.chatId) {
      this.clearExpandedPoints();
      this.loadAnalysisPoints();
    } else {
      this.analysisPointsSubject.next([]);
      this.clearExpandedPoints();
    }
  }

  loadAnalysisPoints(): void {
    if (this.chatId) {
      this.analysisService
        .getAnalysisPointsForChat(this.chatId)
        .subscribe((points) => {
          this.analysisPointsSubject.next(points);
        });
    }
  }

  getCategoryCount(type: string): number {
    return this.analysisPointsSubject.value.filter((p) => p.category === type)
      .length;
  }

  getTotalPoints(): number {
    return this.analysisPointsSubject.value.length;
  }

  getTypeConfig(type: string): {
    gradient: string;
    icon: string;
    label: string;
  } {
    const configs = {
      grammar: {
        gradient: 'from-rose-500 to-pink-600',
        icon: '📝',
        label: 'Gramática',
      },
      vocabulary: {
        gradient: 'from-amber-500 to-orange-600',
        icon: '📚',
        label: 'Vocabulario',
      },
      phrasal_verb: {
        gradient: 'from-blue-500 to-indigo-600',
        icon: '🔗',
        label: 'Phrasal Verbs',
      },
      idiom: {
        gradient: 'from-purple-500 to-violet-600',
        icon: '🎭',
        label: 'Idiomas',
      },
      collocation: {
        gradient: 'from-cyan-500 to-teal-600',
        icon: '🧩',
        label: 'Colocaciones',
      },
      expression: {
        gradient: 'from-emerald-500 to-green-600',
        icon: '💬',
        label: 'Expresiones',
      },
    };
    return (
      configs[type as keyof typeof configs] || {
        gradient: 'from-gray-500 to-gray-600',
        icon: '📋',
        label: type,
      }
    );
  }

  togglePoint(pointId: number): void {
    if (this.expandedPoints.has(pointId)) {
      this.expandedPoints.delete(pointId);
    } else {
      this.expandedPoints.add(pointId);
    }
  }

  isExpanded(pointId: number): boolean {
    return this.expandedPoints.has(pointId);
  }

  trackByPointId(index: number, point: LanguageAnalysisPoint): number {
    return point.id;
  }

  // Método para limpiar puntos expandidos cuando cambia el chat
  private clearExpandedPoints(): void {
    this.expandedPoints.clear();
  }
}
