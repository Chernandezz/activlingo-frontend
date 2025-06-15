// chat-analysis.component.ts - VERSIÓN FINAL
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

  // Estado de filtros
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
      { key: 'grammar', label: 'Gramática' },
      { key: 'vocabulary', label: 'Vocabulario' },
      { key: 'phrasal_verb', label: 'Phrasal Verbs' },
      { key: 'expression', label: 'Expresiones' },
      { key: 'collocation', label: 'Colocaciones' },
      { key: 'context_appropriateness', label: 'Contexto' },
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

  // FUNCIONALIDAD PARA AÑADIR AL DICCIONARIO (solo vocabulary)
  addToDictionary(point: LanguageAnalysisPoint): void {
    const word = this.extractMainWord(point.suggestion);

    if (!word) {
      this.showMessage(point.id, 'No se pudo extraer la palabra', 'error');
      return;
    }

    // Marcar como cargando
    this.addingToDictionary.add(point.id);

    // Preparar datos para el diccionario
    const wordData = {
      word: word,
      meaning: `Palabra correcta: ${point.suggestion}. ${point.explanation}`,
      part_of_speech: 'noun' as any,
      example: `❌ "${point.mistake}" → ✅ "${point.suggestion}"`,
      source: 'chat_analysis',
      usage_context: 'conversacion',
      is_idiomatic: false,
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

  // Extraer palabra principal de la sugerencia
  extractMainWord(suggestion: string): string | null {
    if (!suggestion) return null;

    // Limpiar y tomar la primera palabra significativa
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

    return (
      meaningfulWords[0]?.toLowerCase().replace(/[.,!?;:"'()]/g, '') || null
    );
  }

  isAddingToDictionary(pointId: string): boolean {
    return this.addingToDictionary.has(pointId);
  }

  // Determinar si mostrar el botón de agregar al diccionario
  shouldShowAddToDictionaryButton(point: LanguageAnalysisPoint): boolean {
    return (
      point.category === 'vocabulary' && !this.isAddingToDictionary(point.id)
    );
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

  // Estilos para las categorías
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

  // Métodos de utilidad
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
}
