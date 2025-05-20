// src/app/features/analysis/components/chat-analysis.component.ts
import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, BehaviorSubject } from 'rxjs';
import { LanguageAnalysisPoint } from '../../chat/models/language-analysis.model';
import { LocalAnalysisRepository } from '../../../data/repositories/local-analysis.repository';

@Component({
  selector: 'app-chat-analysis',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 bg-gray-800 text-white overflow-y-auto h-full">
      <h2 class="text-xl font-bold mb-4">Análisis de la Conversación</h2>

      <!-- Resumen -->
      <div class="mb-6 p-4 bg-gray-700 rounded-lg">
        <h3 class="text-lg font-semibold mb-2">Resumen</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div class="p-2 bg-blue-900 rounded">
            <div class="text-xl font-bold">
              {{ getCategoryCount('grammar') }}
            </div>
            <div class="text-sm">Gramática</div>
          </div>
          <div class="p-2 bg-purple-900 rounded">
            <div class="text-xl font-bold">
              {{ getCategoryCount('vocabulary') }}
            </div>
            <div class="text-sm">Vocabulario</div>
          </div>
          <div class="p-2 bg-green-900 rounded">
            <div class="text-xl font-bold">
              {{ getCategoryCount('phrasal_verb') }}
            </div>
            <div class="text-sm">Phrasal Verbs</div>
          </div>
          <div class="p-2 bg-yellow-900 rounded">
            <div class="text-xl font-bold">{{ getCategoryCount('idiom') }}</div>
            <div class="text-sm">Expresiones</div>
          </div>
        </div>
      </div>

      <!-- Listado de puntos de mejora -->
      <h3 class="text-lg font-semibold mb-3">Puntos de Mejora</h3>
      <div
        *ngIf="(analysisPoints$ | async)?.length === 0"
        class="text-center text-gray-500 p-4"
      >
        No hay puntos de análisis para esta conversación aún.
      </div>

      <div class="space-y-4">
        <div
          *ngFor="let point of analysisPoints$ | async"
          class="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 cursor-pointer"
          (click)="showPointDetail(point)"
        >
          <div class="flex justify-between items-center">
            <span
              class="px-2 py-1 text-xs rounded"
              [ngClass]="getTypeClass(point.type)"
              >{{ getTypeLabel(point.type) }}</span
            >
            <span class="text-xs text-gray-400">{{
              point.timestamp | date : 'short'
            }}</span>
          </div>
          <p class="mt-2">
            <span class="line-through text-red-400">{{
              point.originalText
            }}</span>
            <span class="mx-2">→</span>
            <span class="text-green-400">{{ point.suggestion }}</span>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class ChatAnalysisComponent implements OnChanges {
  @Input() chatId: string | undefined;

  private analysisPointsSubject = new BehaviorSubject<LanguageAnalysisPoint[]>(
    []
  );
  analysisPoints$ = this.analysisPointsSubject.asObservable();

  constructor(private analysisRepository: LocalAnalysisRepository) {}

  ngOnChanges(): void {
    if (this.chatId) {
      this.loadAnalysisPoints();
    } else {
      this.analysisPointsSubject.next([]);
    }
  }

  loadAnalysisPoints(): void {
    if (this.chatId) {
      this.analysisRepository
        .getAnalysisPointsForChat(this.chatId)
        .subscribe((points) => {
          this.analysisPointsSubject.next(points);
        });
    }
  }

  getCategoryCount(type: string): number {
    return this.analysisPointsSubject.value.filter((p) => p.type === type)
      .length;
  }

  getTypeClass(type: string): string {
    const classes = {
      grammar: 'bg-blue-900',
      vocabulary: 'bg-purple-900',
      phrasal_verb: 'bg-green-900',
      idiom: 'bg-yellow-900',
      pronunciation: 'bg-red-900',
    };
    return classes[type as keyof typeof classes] || 'bg-gray-900';
  }

  getTypeLabel(type: string): string {
    const labels = {
      grammar: 'Gramática',
      vocabulary: 'Vocabulario',
      phrasal_verb: 'Phrasal Verb',
      idiom: 'Expresión',
      pronunciation: 'Pronunciación',
    };
    return labels[type as keyof typeof labels] || type;
  }

  showPointDetail(point: LanguageAnalysisPoint): void {
    // Aquí implementarías un modal o panel para mostrar detalles
    alert(`${point.explanation}`);

    // Marcar como revisado
    this.analysisRepository.markAsReviewed(point.id).subscribe(() => {
      // Opcionalmente, recargar los puntos o actualizar la UI
      this.loadAnalysisPoints();
    });
  }
}
