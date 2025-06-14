import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  // Simulación simple de palabras del diccionario para MVP
  private mockUserDictionary = [
    'serendipity',
    'ubiquitous',
    'ephemeral',
    'sophisticated',
    'comprehensive',
    'significant',
    'essential',
    'tremendous',
  ];

  constructor(private analysisService: AnalysisService) {}

  ngOnChanges(): void {
    console.log('🔍 Analyzing chatId:', this.chatId);
    this.expandedPoints.clear();

    if (this.chatId) {
      this.analysisService
        .getAnalysisPointsForChat(this.chatId)
        .subscribe((points) => {
          console.log('📊 Analysis points received:', points);
          this.points = points;
        });
    } else {
      this.points = [];
    }
  }

  // Métodos básicos para MVP
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

  // Función simple para calcular score general
  getOverallScore(): number {
    if (this.points.length === 0) return 100;

    // Score basado en cantidad de errores vs longitud estimada de conversación
    const baseScore = 100;
    const penaltyPerError = 5;
    const score = Math.max(
      50,
      baseScore - this.points.length * penaltyPerError
    );

    return Math.round(score);
  }

  // MVP: Detectar palabras del diccionario usadas (simulado)
  getWordsFromDictionary(): string[] {
    // En MVP, simular que detectamos algunas palabras del diccionario
    // En producción, esto vendría del análisis real del chat
    const usedWords = this.mockUserDictionary.slice(
      0,
      Math.floor(Math.random() * 4) + 1
    );
    return usedWords;
  }

  // Estilos para categorías
  getCategoryStyle(category: string): string {
    const styles: Record<string, string> = {
      grammar: 'bg-pink-100 text-pink-800',
      vocabulary: 'bg-orange-100 text-orange-800',
      phrasal_verb: 'bg-blue-100 text-blue-800',
      expression: 'bg-emerald-100 text-emerald-800',
      pronunciation: 'bg-purple-100 text-purple-800',
    };
    return styles[category] || 'bg-gray-100 text-gray-800';
  }

  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      grammar: 'Gramática',
      vocabulary: 'Vocabulario',
      phrasal_verb: 'Phrasal Verb',
      expression: 'Expresión',
      pronunciation: 'Pronunciación',
    };
    return labels[category] || category;
  }

  trackByPoint(index: number, point: LanguageAnalysisPoint): string {
    return point.id;
  }

  // MVP: Función simple para añadir al diccionario
  addToDictionary(point: LanguageAnalysisPoint): void {
    // Extraer la palabra de la sugerencia
    const word = this.extractWordFromSuggestion(point.suggestion);

    if (word) {
      console.log(`📚 Adding "${word}" to dictionary`);

      // Mostrar mensaje de éxito simple
      this.showSuccessMessage(`"${word}" añadida al diccionario!`);

      // En producción, aquí llamarías al servicio:
      // this.dictionaryService.addWord({
      //   word: word,
      //   meaning: point.explanation,
      //   context: point.mistake,
      //   status: 'passive'
      // });
    }
  }

  // Helper para extraer palabra de la sugerencia
  private extractWordFromSuggestion(suggestion: string): string | null {
    // Lógica simple para extraer la palabra principal
    // En producción sería más sofisticado
    const words = suggestion.split(' ');
    const meaningfulWords = words.filter(
      (word) =>
        word.length > 3 &&
        !['the', 'and', 'but', 'for', 'you', 'are', 'not'].includes(
          word.toLowerCase()
        )
    );

    return meaningfulWords[0]?.toLowerCase() || null;
  }

  // Mensaje de éxito simple
  private showSuccessMessage(message: string): void {
    // En MVP, solo console.log
    // En producción, usar toast notification
    console.log(`✅ ${message}`);

    // Opcional: Mostrar alert temporal para MVP
    if (confirm(`${message}\n\n¿Quieres seguir practicando?`)) {
      console.log('User wants to continue practicing');
    }
  }

  // Configuración básica de tipos para legacy compatibility
  getTypeConfig(type: string): {
    gradient: string;
    icon: string;
    label: string;
  } {
    const configs: Record<string, any> = {
      grammar: {
        gradient: 'pink',
        icon: '📝',
        label: 'Gramática',
        subtitle: 'Errores detectados',
      },
      vocabulary: {
        gradient: 'orange',
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
