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

  constructor(private analysisService: AnalysisService) {}

  ngOnChanges(): void {
    if (this.chatId) {
      this.loadAnalysisPoints();
    } else {
      this.analysisPointsSubject.next([]);
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

  getTypeClass(type: string): string {
    const classes = {
      grammar: 'bg-pink-700 text-white',
      vocabulary: 'bg-yellow-600 text-white',
      phrasal_verb: 'bg-blue-600 text-white',
      idiom: 'bg-purple-600 text-white',
      collocation: 'bg-cyan-700 text-white',
      expression: 'bg-green-700 text-white',
    };
    return classes[type as keyof typeof classes] || 'bg-gray-600';
  }

  getTypeLabel(type: string): string {
    const labels = {
      grammar: 'Gramática',
      vocabulary: 'Vocabulario',
      phrasal_verb: 'Phrasal Verb',
      idiom: 'Expresión Idiomática',
      expression: 'Expresión',
      collocation: 'Colocación',
    };
    return labels[type as keyof typeof labels] || type;
  }

  showPointDetail(point: LanguageAnalysisPoint): void {
    alert(
      `❌ ${point.mistake}\n✅ ${point.suggestion}\n\n🧠 ${point.explanation}`
    );
  }
}
