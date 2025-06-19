// dictionary-page.component.ts - VERSIÓN MEJORADA
import {
  Component,
  OnInit,
  OnDestroy,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WordDetailsComponent } from '../../components/word-details/word-details.component';
import { DictionarySearchPanelComponent } from '../../components/dictionary-search-panel/dictionary-search-panel.component';
import { DictionaryService } from '../../services/dictionary.service';
import { AuthService } from '../../../../core/services/auth.service';
import {
  UserDictionaryEntry,
  WordDefinition,
  WordStatus,
} from '../../../../core/models/user-dictionary.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-dictionary-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    WordDetailsComponent,
    DictionarySearchPanelComponent,
  ],
  templateUrl: './dictionary-page.component.html',
  styleUrls: ['./dictionary-page.component.css'],
})
export class DictionaryPageComponent implements OnInit, OnDestroy {
  private dictionaryService = inject(DictionaryService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Estados principales
  searchMode = signal(false);
  selectedWord = signal<UserDictionaryEntry | null>(null);
  filter = signal<'all' | WordStatus>('all');
  words = signal<UserDictionaryEntry[]>([]);
  isLoading = signal(false);

  // Estados de UI
  searchTerm = signal('');
  currentPage = signal(1);
  sortBy = signal('recent');
  itemsPerPage = 12;

  // Cache y responsive
  private cacheKey = '';
  private resizeListener: () => void;

  constructor() {
    this.resizeListener = () => {
      // Ajustar items per page según pantalla
      this.itemsPerPage =
        window.innerWidth < 768 ? 6 : window.innerWidth < 1024 ? 9 : 12;
    };
    window.addEventListener('resize', this.resizeListener);

    // Cargar preferencias del usuario
    this.loadUserPreferences();
  }

  // Computed properties principales
  activeWordCount = computed(
    () => this.words().filter((w) => w.status === 'active').length
  );

  passiveWordCount = computed(
    () => this.words().filter((w) => w.status === 'passive').length
  );

  totalWordCount = computed(
    () => this.activeWordCount() + this.passiveWordCount()
  );

  // Filtrado y búsqueda
  filteredWords = computed(() => {
    let filtered = this.words();

    // Filtro por estado
    if (this.filter() !== 'all') {
      filtered = filtered.filter((word) => word.status === this.filter());
    }

    // Filtro por búsqueda
    const searchTerm = this.searchTerm().toLowerCase().trim();
    if (searchTerm) {
      filtered = filtered.filter(
        (word) =>
          word.word.toLowerCase().includes(searchTerm) ||
          word.meaning.toLowerCase().includes(searchTerm)
      );
    }

    return this.sortWords(filtered);
  });

  // Paginación
  totalPages = computed(() =>
    Math.ceil(this.filteredWords().length / this.itemsPerPage)
  );

  paginatedWords = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredWords().slice(start, end);
  });

  // Estadísticas computadas para el dashboard
  mostUsedWord = computed(() => {
    if (this.words().length === 0) return null;
    return this.words().reduce((max, word) =>
      (word.usage_count || 0) > (max?.usage_count || 0) ? word : max
    );
  });

  mostUsedWordCount = computed(() => this.mostUsedWord()?.usage_count || 0);

  forgottenWordsCount = computed(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.words().filter((word) => {
      const lastUsed = new Date(word.updated_at || word.created_at);
      return lastUsed < thirtyDaysAgo && word.status === 'passive';
    }).length;
  });

  weeklyProgress = computed(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const newWordsThisWeek = this.words().filter((word) => {
      const created = new Date(word.created_at);
      return created >= weekAgo;
    }).length;

    const goal = 5; // Meta semanal
    return Math.min(Math.round((newWordsThisWeek / goal) * 100), 100);
  });

  studyStreak = computed(() => {
    // Calcular racha de estudio basada en actividad reciente
    const today = new Date();
    let streak = 0;

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const hasActivity = this.words().some((word) => {
        const wordDate = new Date(word.created_at);
        return wordDate.toDateString() === date.toDateString();
      });

      if (hasActivity) {
        streak++;
      } else if (i > 0) {
        break; // Romper racha si no hay actividad
      }
    }

    return streak;
  });

  get userId(): string | null {
    return this.authService.currentUserId;
  }

  ngOnInit(): void {
    if (!this.userId) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.cacheKey = `user_words_${this.userId}`;
    this.loadWordsFromCache();
    this.loadWordsFromBackend();

    this.dictionaryService.refresh$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.loadWordsFromBackend(true));

    // Ajustar items per page inicial
    this.resizeListener();
  }

  ngOnDestroy(): void {
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
    this.saveUserPreferences();
  }

  // Métodos de carga de datos
  private loadUserPreferences(): void {
   

    const savedSortBy = localStorage.getItem('dictionary_sort_by');
    if (savedSortBy) {
      this.sortBy.set(savedSortBy);
    }
  }

  private saveUserPreferences(): void {
    localStorage.setItem('dictionary_sort_by', this.sortBy());
  }

  loadWordsFromCache(): void {
    const cached = localStorage.getItem(this.cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as UserDictionaryEntry[];
        this.words.set(parsed);
      } catch (e) {
        console.error('Error parsing dictionary cache:', e);
        localStorage.removeItem(this.cacheKey);
      }
    }
  }

  loadWordsFromBackend(forceLoading: boolean = false): void {
    if (!this.userId) return;

    if (forceLoading || this.words().length === 0) {
      this.isLoading.set(true);
    }

    this.dictionaryService.getUserWords().subscribe({
      next: (words) => {
        this.words.set(words);
        this.saveWordsToCache(words);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading words:', error);
        this.isLoading.set(false);
      },
    });
  }

  private saveWordsToCache(words: UserDictionaryEntry[]): void {
    try {
      localStorage.setItem(this.cacheKey, JSON.stringify(words));
    } catch (e) {
      console.error('Error saving words to cache:', e);
    }
  }

  // Métodos de ordenamiento
  private sortWords(words: UserDictionaryEntry[]): UserDictionaryEntry[] {
    const sortBy = this.sortBy();

    return [...words].sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return a.word.localeCompare(b.word);
        case 'most_used':
          return (b.usage_count || 0) - (a.usage_count || 0);
        case 'least_used':
          return (a.usage_count || 0) - (b.usage_count || 0);
        case 'recent':
        default:
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
      }
    });
  }

  updateSort(): void {
    // El sorting se maneja automáticamente en filteredWords computed
    this.currentPage.set(1);
    this.saveUserPreferences();
  }

  // ========== MÉTODOS NUEVOS PARA MOSTRAR INFORMACIÓN ÚTIL ==========

  /**
   * Obtiene texto descriptivo de cuándo fue la última vez que se usó la palabra
   */
  getLastUsedText(word: UserDictionaryEntry): string {
    const lastUsed = new Date(word.updated_at || word.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastUsed.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `${diffDays}d`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)}sem`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)}m`;

    return `${Math.ceil(diffDays / 365)}a`;
  }

  /**
   * Calcula el nivel de dominio basado en el uso de la palabra
   */
  getMasteryLevel(word: UserDictionaryEntry): string {
    const usageCount = word.usage_count || 0;
    const daysSinceCreated = this.getDaysSinceCreated(word);

    // Algoritmo que considera uso y tiempo
    const masteryScore = this.calculateMasteryScore(
      usageCount,
      daysSinceCreated
    );

    if (masteryScore >= 80) return 'Dominada';
    if (masteryScore >= 60) return 'Avanzado';
    if (masteryScore >= 40) return 'Intermedio';
    if (masteryScore >= 20) return 'Básico';
    return 'Nuevo';
  }

  /**
   * Obtiene la clase CSS para el nivel de dominio
   */
  getMasteryLevelClass(word: UserDictionaryEntry): string {
    const level = this.getMasteryLevel(word);

    switch (level) {
      case 'Dominada':
        return 'text-emerald-600';
      case 'Avanzado':
        return 'text-blue-600';
      case 'Intermedio':
        return 'text-purple-600';
      case 'Básico':
        return 'text-amber-600';
      default:
        return 'text-gray-600';
    }
  }

  /**
   * Obtiene la clase CSS para la barra de progreso de dominio
   */
  getMasteryBarClass(word: UserDictionaryEntry): string {
    const level = this.getMasteryLevel(word);

    switch (level) {
      case 'Dominada':
        return 'bg-gradient-to-r from-emerald-500 to-emerald-600';
      case 'Avanzado':
        return 'bg-gradient-to-r from-blue-500 to-blue-600';
      case 'Intermedio':
        return 'bg-gradient-to-r from-purple-500 to-purple-600';
      case 'Básico':
        return 'bg-gradient-to-r from-amber-500 to-amber-600';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
  }

  /**
   * Calcula el porcentaje de dominio para la barra de progreso
   */
  getMasteryPercentage(word: UserDictionaryEntry): number {
    const usageCount = word.usage_count || 0;
    const daysSinceCreated = this.getDaysSinceCreated(word);

    return this.calculateMasteryScore(usageCount, daysSinceCreated);
  }

  /**
   * Calcula un score de dominio basado en uso y tiempo
   */
  private calculateMasteryScore(
    usageCount: number,
    daysSinceCreated: number
  ): number {
    // Factores de peso
    const usageWeight = 0.7;
    const timeWeight = 0.3;

    // Score basado en uso (logarítmico para evitar que números altos dominen)
    const usageScore = Math.min(Math.log(usageCount + 1) * 25, 100);

    // Score basado en tiempo (palabras más antiguas que se siguen usando tienen mayor score)
    const timeScore = Math.min(daysSinceCreated * 2, 100);

    // Score combinado
    const combinedScore = usageScore * usageWeight + timeScore * timeWeight;

    return Math.round(Math.min(combinedScore, 100));
  }

  /**
   * Obtiene los días transcurridos desde que se creó la palabra
   */
  private getDaysSinceCreated(word: UserDictionaryEntry): number {
    const created = new Date(word.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Obtiene información de tendencia de uso de la palabra
   */
  getUsageTrend(
    word: UserDictionaryEntry
  ): 'increasing' | 'stable' | 'decreasing' {
    // Simplificado - en una implementación real compararías el uso reciente vs histórico
    const usageCount = word.usage_count || 0;
    const daysSinceUpdated = this.getDaysSinceUpdated(word);

    if (daysSinceUpdated < 7 && usageCount > 3) return 'increasing';
    if (daysSinceUpdated > 30) return 'decreasing';
    return 'stable';
  }

  /**
   * Obtiene los días transcurridos desde la última actualización
   */
  private getDaysSinceUpdated(word: UserDictionaryEntry): number {
    const updated = new Date(word.updated_at || word.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - updated.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Obtiene el icono de tendencia para mostrar en la UI
   */
  getTrendIcon(word: UserDictionaryEntry): string {
    const trend = this.getUsageTrend(word);

    switch (trend) {
      case 'increasing':
        return 'fas fa-trending-up text-emerald-500';
      case 'decreasing':
        return 'fas fa-trending-down text-red-500';
      default:
        return 'fas fa-minus text-gray-400';
    }
  }

  /**
   * Obtiene recomendaciones para la palabra
   */
  getWordRecommendation(word: UserDictionaryEntry): string {
    const daysSinceUpdated = this.getDaysSinceUpdated(word);
    const usageCount = word.usage_count || 0;
    const masteryLevel = this.getMasteryLevel(word);

    if (daysSinceUpdated > 30 && word.status === 'passive') {
      return 'Necesita repaso';
    }

    if (usageCount === 0) {
      return 'Usar en conversación';
    }

    if (masteryLevel === 'Nuevo' || masteryLevel === 'Básico') {
      return 'Practicar más';
    }

    if (masteryLevel === 'Dominada') {
      return '¡Bien dominada!';
    }

    return 'Seguir practicando';
  }

  // ========== MÉTODOS ORIGINALES CONTINUADOS ==========

  // Métodos de eventos del usuario
  handleWordAdded(): void {
    this.loadWordsFromBackend(true);
    this.searchMode.set(false);
  }

  handleWordUpdated(updatedWord: UserDictionaryEntry): void {
    const currentWords = this.words();
    const updatedWords = currentWords.map((word) =>
      word.id === updatedWord.id ? updatedWord : word
    );
    this.words.set(updatedWords);
    this.saveWordsToCache(updatedWords);
  }

  onSelectWord(word: UserDictionaryEntry): void {
    this.selectedWord.set(word);
  }

  onFilterChange(filter: 'all' | WordStatus): void {
    this.filter.set(filter);
    this.currentPage.set(1);
    this.selectedWord.set(null);
  }

  onSearchChange(): void {
    this.currentPage.set(1);
  }

  // Métodos de paginación
  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
      this.scrollToTop();
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
      this.scrollToTop();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.scrollToTop();
    }
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Métodos de utilidad
  clearSearch(): void {
    this.searchTerm.set('');
    this.currentPage.set(1);
  }

  refreshWords(): void {
    this.loadWordsFromBackend(true);
  }



  // Métodos de utilidad para templates
  trackByWordId(index: number, word: UserDictionaryEntry): string {
    return word.id;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.ceil(diffDays / 7)} semanas`;

    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  // Métodos de exportación y configuración
  exportWords(): void {
    const words = this.words();
    const dataStr = JSON.stringify(words, null, 2);
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `mi-diccionario-${
      new Date().toISOString().split('T')[0]
    }.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

}
