// chat-analysis.component.ts - VERSIÓN MEJORADA CON TODAS LAS CATEGORÍAS
import { Component, Input, OnChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AnalysisService,
  ChatAnalysisSummary,
  DictionaryWord,
} from '../../../chat/services/analysis.service';
import { DictionaryService } from '../../../dictionary/services/dictionary.service';
import { LanguageAnalysisPoint } from '../../../chat/models/language-analysis.model';

@Component({
  selector: 'app-chat-analysis',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-analysis.component.html',
})
export class ChatAnalysisComponent implements OnChanges {
  @Input() chatId?: string;

  // Servicios
  private analysisService = inject(AnalysisService);
  private dictionaryService = inject(DictionaryService);

  // Estado del componente
  points: LanguageAnalysisPoint[] = [];
  filteredPoints: LanguageAnalysisPoint[] = [];
  dictionaryWords: DictionaryWord[] = [];
  overallScore: number = 100;
  categoryStats: Record<string, number> = {};
  expandedPoints = new Set<string>();
  isLoading = true;
  error: string | null = null;

  // Estado de filtros mejorado
  selectedFilter: string | null = null;
  availableFilters: Array<{ key: string; label: string; count: number }> = [];

  // Estado para acciones
  addingToDictionary = new Set<string>();
  successMessages = new Map<string, string>();

  ngOnChanges(): void {
    console.log('🔍 Analyzing chatId:', this.chatId);
    this.expandedPoints.clear();
    this.resetFilters();
    this.loadAnalysisData();
  }

  public loadAnalysisData(): void {
    if (!this.chatId) {
      this.resetData();
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.analysisService.getChatAnalysisSummary(this.chatId).subscribe({
      next: (summary: ChatAnalysisSummary) => {
        console.log('📊 Analysis summary received:', summary);

        this.points = summary.analysis_points;
        this.dictionaryWords = summary.dictionary_words_used;
        this.overallScore = summary.stats.overall_score;
        this.categoryStats = summary.stats.by_category;

        this.setupFilters();
        this.applyFilter();

        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error loading analysis:', error);
        this.error = 'Error al cargar el análisis. Intenta de nuevo.';
        this.isLoading = false;
        this.resetData();
      },
    });
  }

  // Configurar filtros con todas las categorías
  private setupFilters(): void {
    const allCategories = [
      { key: 'grammar', label: 'Gramática', icon: 'spell-check' },
      { key: 'vocabulary', label: 'Vocabulario', icon: 'book-open' },
      { key: 'phrasal_verb', label: 'Phrasal Verbs', icon: 'link' },
      { key: 'expression', label: 'Expresiones', icon: 'comments' },
      { key: 'collocation', label: 'Colocaciones', icon: 'puzzle-piece' },
      { key: 'context_appropriateness', label: 'Contexto', icon: 'user-tie' },
    ];

    this.availableFilters = [
      { key: 'all', label: 'Todos', count: this.points.length },
      ...allCategories
        .map((cat) => ({
          key: cat.key,
          label: cat.label,
          count: this.getCategoryCount(cat.key),
        }))
        .filter((filter) => filter.count > 0),
    ];
  }

  private applyFilter(): void {
    if (!this.selectedFilter || this.selectedFilter === 'all') {
      this.filteredPoints = [...this.points];
    } else {
      this.filteredPoints = this.points.filter(
        (point) => point.category === this.selectedFilter
      );
    }
  }

  setFilter(filterKey: string): void {
    this.selectedFilter = filterKey === 'all' ? null : filterKey;
    this.applyFilter();
    this.expandedPoints.clear(); // Colapsar todos al cambiar filtro
  }

  isFilterActive(filterKey: string): boolean {
    if (filterKey === 'all') {
      return !this.selectedFilter;
    }
    return this.selectedFilter === filterKey;
  }

  private resetFilters(): void {
    this.selectedFilter = null;
    this.filteredPoints = [];
    this.availableFilters = [];
  }

  private resetData(): void {
    this.points = [];
    this.filteredPoints = [];
    this.dictionaryWords = [];
    this.overallScore = 100;
    this.categoryStats = {};
    this.isLoading = false;
    this.resetFilters();
  }

  // Métodos para la UI
  toggle(pointId: string): void {
    this.expandedPoints.has(pointId)
      ? this.expandedPoints.delete(pointId)
      : this.expandedPoints.add(pointId);
  }

  isExpanded(pointId: string): boolean {
    return this.expandedPoints.has(pointId);
  }

  getCategoryCount(type: string): number {
    return this.categoryStats[type] || 0;
  }

  getOverallScore(): number {
    return this.overallScore;
  }

  getWordsFromDictionary(): DictionaryWord[] {
    return this.dictionaryWords;
  }

  // FUNCIONALIDAD MEJORADA PARA AÑADIR AL DICCIONARIO
  addToDictionary(point: LanguageAnalysisPoint): void {
    const word = this.extractMainWord(point.suggestion);

    if (!word) {
      this.showMessage(point.id, 'No se pudo extraer la palabra', 'error');
      return;
    }

    // Marcar como cargando
    this.addingToDictionary.add(point.id);

    // Preparar datos mejorados para el diccionario
    const wordData = {
      word: word,
      meaning: this.createMeaningFromPoint(point),
      part_of_speech: this.mapCategoryToPartOfSpeech(point.category) as any,
      example: `❌ "${point.mistake}" → ✅ "${point.suggestion}"`,
      source: 'chat_analysis',
      usage_context: 'conversacion',
      is_idiomatic:
        point.category === 'expression' || point.category === 'phrasal_verb',
      status: 'passive' as const,
    };

    console.log(`📚 Adding "${word}" to dictionary:`, wordData);

    this.dictionaryService.addWord(wordData).subscribe({
      next: (result) => {
        console.log('✅ Word added successfully:', result);
        this.addingToDictionary.delete(point.id);
        this.showMessage(
          point.id,
          `"${word}" añadida al diccionario!`,
          'success'
        );
      },
      error: (error) => {
        console.error('❌ Error adding word to dictionary:', error);
        this.addingToDictionary.delete(point.id);

        if (
          error.status === 400 &&
          error.error?.detail?.includes('Duplicate')
        ) {
          this.showMessage(
            point.id,
            `"${word}" ya está en tu diccionario`,
            'warning'
          );
        } else {
          this.showMessage(
            point.id,
            'Error al añadir palabra. Intenta de nuevo.',
            'error'
          );
        }
      },
    });
  }

  // Crear significado contextual según la categoría
  private createMeaningFromPoint(point: LanguageAnalysisPoint): string {
    switch (point.category) {
      case 'vocabulary':
        return `Palabra correcta: ${point.suggestion}. ${point.explanation}`;
      case 'phrasal_verb':
        return `Phrasal verb: ${point.suggestion}. ${point.explanation}`;
      case 'expression':
        return `Expresión natural: ${point.suggestion}. ${point.explanation}`;
      case 'collocation':
        return `Combinación correcta: ${point.suggestion}. ${point.explanation}`;
      case 'context_appropriateness':
        return `Registro apropiado: ${point.suggestion}. ${point.explanation}`;
      default:
        return point.explanation;
    }
  }

  // Mapear categoría a part_of_speech del diccionario
  private mapCategoryToPartOfSpeech(category: string): string {
    const mapping: Record<string, string> = {
      vocabulary: 'noun',
      grammar: 'other',
      phrasal_verb: 'verb',
      expression: 'expression',
      collocation: 'other',
      context_appropriateness: 'other',
    };
    return mapping[category] || 'other';
  }

  // Extraer palabra principal de la sugerencia (mejorado)
  extractMainWord(suggestion: string): string | null {
    if (!suggestion) return null;

    // Para phrasal verbs, tomar todo el phrasal verb
    if (
      suggestion.includes(' up') ||
      suggestion.includes(' off') ||
      suggestion.includes(' on') ||
      suggestion.includes(' out') ||
      suggestion.includes(' in') ||
      suggestion.includes(' down')
    ) {
      const words = suggestion.split(' ');
      const verbIndex = words.findIndex((word) =>
        ['up', 'off', 'on', 'out', 'in', 'down', 'away', 'back'].includes(
          word.toLowerCase()
        )
      );
      if (verbIndex > 0) {
        return words
          .slice(0, verbIndex + 1)
          .join(' ')
          .toLowerCase();
      }
    }

    // Para expresiones largas, tomar las primeras 2-3 palabras significativas
    const words = suggestion.split(' ');
    const meaningfulWords = words.filter(
      (word) =>
        word.length > 2 &&
        ![
          'the',
          'and',
          'but',
          'for',
          'you',
          'are',
          'not',
          'use',
          'try',
          'can',
          'will',
          'would',
          'should',
          'could',
          'may',
          'might',
          'have',
          'has',
          'had',
          'do',
          'does',
          'did',
          'is',
          'was',
          'were',
        ].includes(word.toLowerCase())
    );

    // Si es una expresión, tomar hasta 3 palabras
    if (meaningfulWords.length > 1) {
      return meaningfulWords
        .slice(0, 3)
        .join(' ')
        .toLowerCase()
        .replace(/[.,!?;:"'()]/g, '');
    }

    // Para palabras simples
    return (
      meaningfulWords[0]?.toLowerCase().replace(/[.,!?;:"'()]/g, '') || null
    );
  }

  isAddingToDictionary(pointId: string): boolean {
    return this.addingToDictionary.has(pointId);
  }

  private showMessage(
    pointId: string,
    message: string,
    type: 'success' | 'error' | 'warning'
  ): void {
    this.successMessages.set(pointId, message);

    // Limpiar mensaje después de 3 segundos
    setTimeout(() => {
      this.successMessages.delete(pointId);
    }, 3000);
  }

  getMessage(pointId: string): string | null {
    return this.successMessages.get(pointId) || null;
  }

  // Estilos mejorados para todas las categorías
  getCategoryStyle(category: string): string {
    const styles: Record<string, string> = {
      grammar: 'bg-pink-100 text-pink-800 border-pink-200',
      vocabulary: 'bg-orange-100 text-orange-800 border-orange-200',
      phrasal_verb: 'bg-blue-100 text-blue-800 border-blue-200',
      expression: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      collocation: 'bg-purple-100 text-purple-800 border-purple-200',
      context_appropriateness:
        'bg-indigo-100 text-indigo-800 border-indigo-200',
    };
    return styles[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  }

  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      grammar: 'Gramática',
      vocabulary: 'Vocabulario',
      phrasal_verb: 'Phrasal Verb',
      expression: 'Expresión',
      collocation: 'Colocación',
      context_appropriateness: 'Contexto',
    };
    return labels[category] || category;
  }

  // Obtener icono por categoría
  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      grammar: 'fas fa-spell-check',
      vocabulary: 'fas fa-book-open',
      phrasal_verb: 'fas fa-link',
      expression: 'fas fa-comments',
      collocation: 'fas fa-puzzle-piece',
      context_appropriateness: 'fas fa-user-tie',
    };
    return icons[category] || 'fas fa-tag';
  }

  // Track by functions
  trackByPoint(index: number, point: LanguageAnalysisPoint): string {
    return point.id;
  }

  trackByWord(index: number, word: DictionaryWord): string {
    return word.word;
  }

  trackByFilter(index: number, filter: any): string {
    return filter.key;
  }

  // Métodos de utilidad para la UI
  hasAnalysisData(): boolean {
    return this.points.length > 0 || this.dictionaryWords.length > 0;
  }

  getScoreColor(): string {
    if (this.overallScore >= 90) return 'text-emerald-600';
    if (this.overallScore >= 70) return 'text-blue-600';
    if (this.overallScore >= 50) return 'text-orange-600';
    return 'text-red-600';
  }

  getScoreEmoji(): string {
    if (this.overallScore >= 90) return '🎉';
    if (this.overallScore >= 70) return '👍';
    if (this.overallScore >= 50) return '💪';
    return '📚';
  }

  // Método para obtener descripción de la categoría
  getCategoryDescription(category: string): string {
    const descriptions: Record<string, string> = {
      grammar: 'Tiempos verbales, artículos, preposiciones',
      vocabulary: 'Palabras incorrectas o inexistentes',
      phrasal_verb: 'Verbos compuestos (take off, give up)',
      expression: 'Expresiones más naturales y fluidas',
      collocation: 'Combinaciones naturales de palabras',
      context_appropriateness: 'Registro apropiado para el contexto',
    };
    return descriptions[category] || '';
  }
}
