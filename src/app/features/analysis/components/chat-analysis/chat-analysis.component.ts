// chat-analysis.component.ts - VERSIÓN FINAL CORREGIDA
import { Component, Input, OnChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AnalysisService,
  ChatAnalysisSummary,
  DictionaryWord,
} from '../../../chat/services/analysis.service';
import { DictionaryService } from '../../../dictionary/services/dictionary.service';
import { LanguageAnalysisPoint } from '../../../chat/models/language-analysis.model';
import { UserService } from '../../../../core/services/user.service';
import { SubscriptionService } from '../../../../core/services/subscription.service'; // ✅ AGREGADO

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
  private userService = inject(UserService);
  private subscriptionService = inject(SubscriptionService); // ✅ CORREGIDO: inject() en lugar de declaración

  // Estado del componente
  points: LanguageAnalysisPoint[] = [];
  filteredPoints: LanguageAnalysisPoint[] = [];
  dictionaryWords: DictionaryWord[] = [];
  overallScore: number = 100;
  categoryStats: Record<string, number> = {};
  expandedPoints = new Set<string>();
  isLoading = true;
  error: string | null = null;

  // Estado del plan del usuario
  userPlan: string = 'premium';
  isPremium: boolean = true;

  // Categorías que requieren premium (las últimas 3)
  premiumCategories = ['expression', 'collocation', 'context_appropriateness'];

  // Estado de filtros
  selectedFilter: string | null = null;
  availableFilters: Array<{ key: string; label: string; count: number }> = [];

  // Estado para acciones
  addingToDictionary = new Set<string>();
  successMessages = new Map<string, string>();

  // Estado del paywall
  showPaywall = false;

  ngOnChanges(): void {
    this.expandedPoints.clear();
    this.resetFilters();
    this.loadUserPlan();
    this.loadAnalysisData();
  }

  private loadUserPlan(): void {
    this.userService.getFullProfile().subscribe({
      next: (response) => {
        const subscription = response?.profile?.subscription;
        this.userPlan = subscription?.plan?.slug || 'basic';
        this.isPremium = ['premium', 'trial'].includes(this.userPlan);
      },
      error: (error) => {
        console.warn('Could not get user plan, defaulting to basic');
        this.userPlan = 'basic';
        this.isPremium = false;
      },
    });
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

  // Verificar si una categoría requiere premium
  isLockedCategory(category: string): boolean {
    return !this.isPremium && this.premiumCategories.includes(category);
  }

  // Obtener puntos bloqueados para usuarios básicos
  getLockedPoints(): LanguageAnalysisPoint[] {
    if (this.isPremium) {
      return [];
    }
    return this.filteredPoints.filter((point) =>
      this.premiumCategories.includes(point.category)
    );
  }

  // Obtener puntos visibles para usuarios básicos
  getVisiblePoints(): LanguageAnalysisPoint[] {
    if (this.isPremium) {
      return this.filteredPoints;
    }
    return this.filteredPoints.filter(
      (point) => !this.premiumCategories.includes(point.category)
    );
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
    // Si es una categoría premium y el usuario no es premium, mostrar paywall
    if (!this.isPremium && this.premiumCategories.includes(filterKey)) {
      this.showPaywall = true;
      return;
    }

    this.selectedFilter = filterKey === 'all' ? null : filterKey;
    this.applyFilter();
    this.expandedPoints.clear();
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

  // Generar preview intrigante de la explicación
  getIntriguingPreview(explanation: string): string {
    if (!explanation) return '';

    // Cortar en un punto que genere curiosidad (entre 60-80 caracteres)
    const maxLength = 75;

    if (explanation.length <= maxLength) {
      return explanation;
    }

    // Buscar el último espacio antes del límite para no cortar palabras
    let cutPoint = maxLength;
    while (cutPoint > 50 && explanation[cutPoint] !== ' ') {
      cutPoint--;
    }

    // Si no encontramos espacio, cortar directamente
    if (cutPoint <= 50) {
      cutPoint = maxLength;
    }

    let preview = explanation.substring(0, cutPoint);

    // Asegurar que termine de manera intrigante
    if (
      !preview.endsWith('.') &&
      !preview.endsWith(',') &&
      !preview.endsWith(':')
    ) {
      // Si termina a mitad de palabra o frase, es perfecto para generar curiosidad
      return preview;
    }

    // Si termina muy "completo", acortar un poco más para generar expectativa
    const lastSpace = preview.lastIndexOf(' ');
    if (lastSpace > 40) {
      preview = preview.substring(0, lastSpace);
    }

    return preview;
  }

  // FUNCIONALIDAD PARA AÑADIR AL DICCIONARIO (solo vocabulary)
  addToDictionary(point: LanguageAnalysisPoint): void {
    // Verificar si es premium para la funcionalidad del diccionario
    if (!this.isPremium) {
      this.showPaywall = true;
      return;
    }

    const word = this.extractMainWord(point.suggestion);

    if (!word) {
      this.showMessage(point.id, 'No se pudo extraer la palabra', 'error');
      return;
    }

    this.addingToDictionary.add(point.id);

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

    this.dictionaryService.addWord(wordData).subscribe({
      next: (result) => {
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

  extractMainWord(suggestion: string): string | null {
    if (!suggestion) return null;

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

  // Funciones del paywall
  closePaywall(): void {
    this.showPaywall = false;
  }

  // ✅ CORREGIDO: Método upgradeToPremium con tipado correcto
  upgradeToPremium(): void {
    this.subscriptionService.getAvailablePlans().subscribe({
      next: (data) => {
        const premiumPlan = data.plans.find((p) => p.slug === 'premium');
        if (premiumPlan) {
          this.subscriptionService
            .createUpgradeSession('premium', 'monthly')
            .subscribe({
              next: (response) => {
                if (response?.checkout_url) {
                  window.location.href = response.checkout_url;
                } else {
                  alert('Error: No se pudo generar la URL de pago');
                }
              },
              error: (error) => {
                console.error('❌ Error creating checkout:', error);
                alert('Error al procesar el upgrade. Intenta de nuevo.');
              },
            });
        } else {
          console.error('❌ Plan premium no encontrado');
          alert('Plan premium no disponible en este momento');
        }
      },
      error: (error) => {
        console.error('❌ Error getting plans:', error);
        alert('Error al obtener planes. Intenta de nuevo.');
      },
    });
  }
}
