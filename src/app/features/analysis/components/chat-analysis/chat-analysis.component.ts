// chat-analysis.component.ts - VERSIÓN ACTUALIZADA CON NUEVOS SERVICIOS
import { Component, Input, OnChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { take, finalize } from 'rxjs/operators';

import {
  AnalysisService,
  ChatAnalysisSummary,
  DictionaryWord,
} from '../../../chat/services/analysis.service';
import { DictionaryService } from '../../../dictionary/services/dictionary.service';
import { LanguageAnalysisPoint } from '../../../chat/models/language-analysis.model';

// ✅ NUEVOS SERVICIOS ACTUALIZADOS
import { UserService } from '../../../../core/services/user.service';
import { SubscriptionService } from '../../../../core/services/subscription.service';
import { UserProfile } from '../../../../core/models/user.model';
import {
  SubscriptionStatus,
  SubscriptionPlan,
} from '../../../../core/models/subscription.model';

@Component({
  selector: 'app-chat-analysis',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-analysis.component.html',
})
export class ChatAnalysisComponent implements OnChanges {
  @Input() chatId?: string;

  // ========== SERVICIOS ==========
  private analysisService = inject(AnalysisService);
  private dictionaryService = inject(DictionaryService);
  private userService = inject(UserService);
  private subscriptionService = inject(SubscriptionService);

  // ========== ESTADO DEL ANÁLISIS ==========
  points: LanguageAnalysisPoint[] = [];
  filteredPoints: LanguageAnalysisPoint[] = [];
  dictionaryWords: DictionaryWord[] = [];
  overallScore: number = 100;
  categoryStats: Record<string, number> = {};
  expandedPoints = new Set<string>();
  isLoading = true;
  error: string | null = null;

  // ========== ESTADO DEL USUARIO ==========
  userProfile: UserProfile | null = null;
  subscriptionStatus: SubscriptionStatus | null = null;
  availablePlans: SubscriptionPlan[] = [];
  isLoadingUserData = false;

  // ========== CONFIGURACIÓN DE PREMIUM ==========
  // Categorías que requieren premium (las últimas 3)
  premiumCategories = ['expression', 'collocation', 'context_appropriateness'];

  // ========== ESTADO DE FILTROS ==========
  selectedFilter: string | null = null;
  availableFilters: Array<{ key: string; label: string; count: number }> = [];

  // ========== ESTADO DE ACCIONES ==========
  addingToDictionary = new Set<string>();
  successMessages = new Map<string, string>();
  showPaywall = false;
  isUpgrading = false;

  ngOnChanges(): void {
    this.expandedPoints.clear();
    this.resetFilters();
    this.loadUserData();
    this.loadAnalysisData();
  }

  // ========== CARGA DE DATOS DEL USUARIO ==========

  private loadUserData(): void {
    this.isLoadingUserData = true;

    // Cargar perfil del usuario
    this.userService
      .getProfile()
      .pipe(take(1))
      .subscribe({
        next: (profile) => {
          this.userProfile = profile;
          this.loadSubscriptionStatus();
        },
        error: (error) => {
          console.warn('Could not get user profile, defaulting to basic');
          this.setDefaultUserState();
          this.isLoadingUserData = false;
        },
      });
  }

  private loadSubscriptionStatus(): void {
    this.subscriptionService
      .getStatus()
      .pipe(take(1))
      .subscribe({
        next: (status) => {
          this.subscriptionStatus = status;
          this.loadAvailablePlans();
        },
        error: (error) => {
          console.warn('Could not get subscription status');
          this.setDefaultUserState();
          this.isLoadingUserData = false;
        },
      });
  }

  private loadAvailablePlans(): void {
    this.subscriptionService
      .getPlans()
      .pipe(take(1))
      .subscribe({
        next: (plans) => {
          this.availablePlans = plans;
          this.isLoadingUserData = false;
        },
        error: (error) => {
          console.warn('Could not get available plans');
          this.isLoadingUserData = false;
        },
      });
  }

  private setDefaultUserState(): void {
    this.userProfile = null;
    this.subscriptionStatus = null;
    this.availablePlans = [];
  }

  // ========== GETTERS PARA EL ESTADO DE SUSCRIPCIÓN ==========

  get isPremium(): boolean {
    if (!this.subscriptionStatus) return false;
    return this.subscriptionService.isActive(this.subscriptionStatus.status);
  }

  get isTrialActive(): boolean {
    return this.subscriptionStatus?.status === 'trial';
  }

  get currentPlanSlug(): string {
    return this.subscriptionStatus?.subscription?.plan?.slug || 'basic';
  }

  get canAccessPremiumFeatures(): boolean {
    return this.isPremium || this.isTrialActive;
  }

  // ========== CARGA DEL ANÁLISIS ==========

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

  // ========== LÓGICA DE PREMIUM ==========

  // Verificar si una categoría requiere premium
  isLockedCategory(category: string): boolean {
    return (
      !this.canAccessPremiumFeatures &&
      this.premiumCategories.includes(category)
    );
  }

  // Obtener puntos bloqueados para usuarios básicos
  getLockedPoints(): LanguageAnalysisPoint[] {
    if (this.canAccessPremiumFeatures) {
      return [];
    }
    return this.filteredPoints.filter((point) =>
      this.premiumCategories.includes(point.category)
    );
  }

  // Obtener puntos visibles para usuarios básicos
  getVisiblePoints(): LanguageAnalysisPoint[] {
    if (this.canAccessPremiumFeatures) {
      return this.filteredPoints;
    }
    return this.filteredPoints.filter(
      (point) => !this.premiumCategories.includes(point.category)
    );
  }

  // ========== FILTROS ==========

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
    // Si es una categoría premium y el usuario no tiene acceso, mostrar paywall
    if (
      !this.canAccessPremiumFeatures &&
      this.premiumCategories.includes(filterKey)
    ) {
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

  // ========== DICCIONARIO ==========

  // FUNCIONALIDAD PARA AÑADIR AL DICCIONARIO (solo vocabulary)
  addToDictionary(point: LanguageAnalysisPoint): void {
    // Verificar si tiene acceso premium para la funcionalidad del diccionario
    if (!this.canAccessPremiumFeatures) {
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

  // ========== PAYWALL Y UPGRADE ==========

  closePaywall(): void {
    this.showPaywall = false;
  }

  upgradeToPremium(): void {
    if (this.isUpgrading) return;

    const premiumPlan = this.availablePlans.find((p) => p.slug === 'premium');

    if (!premiumPlan) {
      console.error('❌ Plan premium no encontrado');
      alert('Plan premium no disponible en este momento');
      return;
    }

    this.isUpgrading = true;

    this.subscriptionService
      .createCheckout('premium', 'monthly')
      .pipe(finalize(() => (this.isUpgrading = false)))
      .subscribe({
        next: (response) => {
          if (response?.checkout_url) {
            console.log('🔄 Redirigiendo a Stripe...');
            window.location.href = response.checkout_url;
          } else {
            console.error('❌ No se recibió checkout_url:', response);
            alert('Error: No se pudo generar la URL de pago');
          }
        },
        error: (error) => {
          console.error('❌ Error creating checkout:', error);
          alert(
            `Error al procesar el upgrade: ${
              error.message || 'Intenta de nuevo'
            }`
          );
        },
      });
  }

  // ========== MÉTODOS DE UI ==========

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

  // ========== ESTILOS Y LABELS ==========

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

  // ========== TRACK BY FUNCTIONS ==========

  trackByPoint(index: number, point: LanguageAnalysisPoint): string {
    return point.id;
  }

  trackByWord(index: number, word: DictionaryWord): string {
    return word.word;
  }

  trackByFilter(index: number, filter: any): string {
    return filter.key;
  }

  // ========== MÉTODOS DE UTILIDAD ==========

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

  // ========== GETTERS PARA EL TEMPLATE ==========

  get subscriptionStatusText(): string {
    return this.subscriptionService.getStatusText(
      this.subscriptionStatus?.status || ''
    );
  }

  get planName(): string {
    if (this.isTrialActive) return 'Prueba Gratuita';
    return this.subscriptionStatus?.subscription?.plan?.name || 'Básico';
  }

  get premiumPlan(): SubscriptionPlan | undefined {
    return this.availablePlans.find((plan) => plan.slug === 'premium');
  }

  // ========== DEBUG ==========

  logCurrentState(): void {
    console.log('🔍 Estado actual del análisis:', {
      isPremium: this.isPremium,
      isTrialActive: this.isTrialActive,
      canAccessPremiumFeatures: this.canAccessPremiumFeatures,
      currentPlanSlug: this.currentPlanSlug,
      subscriptionStatus: this.subscriptionStatus,
      userProfile: this.userProfile,
    });
  }
}
