// chat-analysis.component.ts - CON FILTROS Y DICCIONARIO REAL
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
  filteredPoints: LanguageAnalysisPoint[] = []; // 🆕 Para filtros
  dictionaryWords: DictionaryWord[] = [];
  overallScore: number = 100;
  categoryStats: Record<string, number> = {};
  expandedPoints = new Set<string>();
  isLoading = true;
  error: string | null = null;

  // 🆕 Estado de filtros
  selectedFilter: string | null = null;
  availableFilters: Array<{ key: string; label: string; count: number }> = [];

  // 🆕 Estado para añadir al diccionario
  addingToDictionary = new Set<string>();
  successMessages = new Map<string, string>();

  ngOnChanges(): void {
    console.log('🔍 Analyzing chatId:', this.chatId);
    this.expandedPoints.clear();
    this.resetFilters();
    this.loadAnalysisData();
  }

  // 🆕 Cargar todos los datos del análisis
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

        // 🆕 Configurar filtros y aplicar filtro actual
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

  // 🆕 Configurar filtros disponibles
  private setupFilters(): void {
    this.availableFilters = [
      { key: 'all', label: 'Todos', count: this.points.length },
      {
        key: 'grammar',
        label: 'Gramática',
        count: this.getCategoryCount('grammar'),
      },
      {
        key: 'vocabulary',
        label: 'Vocabulario',
        count: this.getCategoryCount('vocabulary'),
      },
      {
        key: 'phrasal_verb',
        label: 'Phrasal Verbs',
        count: this.getCategoryCount('phrasal_verb'),
      },
      {
        key: 'expression',
        label: 'Expresiones',
        count: this.getCategoryCount('expression'),
      },
      {
        key: 'collocation',
        label: 'Colocaciones',
        count: this.getCategoryCount('collocation'),
      },
    ].filter((filter) => filter.count > 0); // Solo mostrar filtros que tengan elementos
  }

  // 🆕 Aplicar filtro seleccionado
  private applyFilter(): void {
    if (!this.selectedFilter || this.selectedFilter === 'all') {
      this.filteredPoints = [...this.points];
    } else {
      this.filteredPoints = this.points.filter(
        (point) => point.category === this.selectedFilter
      );
    }
  }

  // 🆕 Cambiar filtro (llamado desde el template)
  setFilter(filterKey: string): void {
    this.selectedFilter = filterKey === 'all' ? null : filterKey;
    this.applyFilter();
    this.expandedPoints.clear(); // Colapsar todos al cambiar filtro
  }

  // 🆕 Verificar si un filtro está activo
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

  // 🆕 FUNCIONALIDAD REAL PARA AÑADIR AL DICCIONARIO
  addToDictionary(point: LanguageAnalysisPoint): void {
    const word = this.extractWordFromSuggestion(point.suggestion);

    if (!word) {
      this.showMessage(point.id, 'No se pudo extraer la palabra', 'error');
      return;
    }

    // Marcar como cargando
    this.addingToDictionary.add(point.id);

    // Preparar datos para el diccionario
    const wordData = {
      word: word,
      meaning: point.explanation,
      part_of_speech: this.mapCategoryToPartOfSpeech(point.category) as any, // Usar 'as any' para evitar problemas de tipo
      example: `Error: "${point.mistake}" → Corrección: "${point.suggestion}"`,
      source: 'chat_analysis',
      usage_context: 'conversacion',
      is_idiomatic: point.category === 'expression',
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

        // Opcional: Recargar palabras del diccionario
        // this.loadAnalysisData();
      },
      error: (error) => {
        console.error('❌ Error adding word to dictionary:', error);
        this.addingToDictionary.delete(point.id);

        // Manejar errores específicos
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

  // 🆕 Mapear categoría de análisis a part_of_speech del diccionario
  private mapCategoryToPartOfSpeech(category: string): string {
    const mapping: Record<string, string> = {
      vocabulary: 'noun',
      grammar: 'other',
      phrasal_verb: 'verb',
      expression: 'expression',
      collocation: 'other',
    };
    return mapping[category] || 'other';
  }

  // 🆕 Verificar si se está añadiendo una palabra
  isAddingToDictionary(pointId: string): boolean {
    return this.addingToDictionary.has(pointId);
  }

  // 🆕 Mostrar mensaje temporal
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

  // 🆕 Obtener mensaje para un punto
  getMessage(pointId: string): string | null {
    return this.successMessages.get(pointId) || null;
  }

  private extractWordFromSuggestion(suggestion: string): string | null {
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

  // Estilos para categorías
  getCategoryStyle(category: string): string {
    const styles: Record<string, string> = {
      grammar: 'bg-pink-100 text-pink-800',
      vocabulary: 'bg-orange-100 text-orange-800',
      phrasal_verb: 'bg-blue-100 text-blue-800',
      expression: 'bg-emerald-100 text-emerald-800',
      collocation: 'bg-purple-100 text-purple-800',
    };
    return styles[category] || 'bg-gray-100 text-gray-800';
  }

  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      grammar: 'Gramática',
      vocabulary: 'Vocabulario',
      phrasal_verb: 'Phrasal Verb',
      expression: 'Expresión',
      collocation: 'Colocación',
    };
    return labels[category] || category;
  }

  trackByPoint(index: number, point: LanguageAnalysisPoint): string {
    return point.id;
  }

  trackByWord(index: number, word: DictionaryWord): string {
    return word.word;
  }

  trackByFilter(index: number, filter: any): string {
    return filter.key;
  }

  // Configuración para compatibilidad legacy
  getTypeConfig(type: string): {
    gradient: string;
    icon: string;
    label: string;
  } {
    const configs: Record<string, any> = {
      grammar: { gradient: 'pink', icon: '📝', label: 'Gramática' },
      vocabulary: { gradient: 'orange', icon: '📚', label: 'Vocabulario' },
      phrasal_verb: { gradient: 'blue', icon: '🔗', label: 'Phrasal Verbs' },
      expression: { gradient: 'emerald', icon: '💬', label: 'Expresiones' },
      collocation: { gradient: 'purple', icon: '🎯', label: 'Colocaciones' },
    };
    return configs[type] || { gradient: 'gray', icon: '📋', label: type };
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
}
