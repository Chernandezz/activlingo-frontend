import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { AnalysisService } from '../../../chat/services/analysis.service';
import { LanguageAnalysisPoint } from '../../../chat/models/language-analysis.model';

@Component({
  selector: 'app-chat-analysis',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-analysis.component.html',
})
export class ChatAnalysisComponent implements OnChanges {
  @Input() chatId?: string;
  points: LanguageAnalysisPoint[] = [];
  expandedPoints = new Set<string>();

  constructor(private analysisService: AnalysisService) {}
  
  ngOnChanges(): void {
    console.log('🔍 Analyzing chatId:', this.chatId); // ✅ Debug
    this.expandedPoints.clear();

    if (this.chatId) {
      this.analysisService
        .getAnalysisPointsForChat(this.chatId)
        .subscribe((points) => {
          console.log('📊 Analysis points received:', points); // ✅ Debug
          this.points = points;
        });
    } else {
      this.points = [];
    }
  }

  toggle(pointId: string): void {
    this.expandedPoints.has(pointId)
      ? this.expandedPoints.delete(pointId)
      : this.expandedPoints.add(pointId);
  }

  isExpanded(pointId: string): boolean {
    return this.expandedPoints.has(pointId);
  }

  getCategoryCount(type: string): number {
    return this.points.filter((p) => p.category === type).length;
  }

  getTypeConfig(type: string): {
    gradient: string;
    icon: string;
    label: string;
  } {
    const configs: Record<string, any> = {
      grammar: {
        gradient: 'rose',
        icon: '📝',
        label: 'Gramática',
        subtitle: 'Errores detectados',
      },
      vocabulary: {
        gradient: 'amber',
        icon: '📚',
        label: 'Vocabulario',
        subtitle: 'Palabras nuevas',
      },
      phrasal_verb: {
        gradient: 'blue',
        icon: '🔗',
        label: 'Phrasal Verbs',
        subtitle: 'Expresiones compuestas',
      },
      expression: {
        gradient: 'emerald',
        icon: '💬',
        label: 'Expresiones',
        subtitle: 'Frases idiomáticas',
      },
    };
    return (
      configs[type] || {
        gradient: 'gray',
        icon: '📋',
        label: type,
        subtitle: '',
      }
    );
  }
}
