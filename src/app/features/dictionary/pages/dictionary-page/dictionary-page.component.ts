// dictionary-page.component.ts - MY LEARNING SIMPLIFICADO
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

interface ProgressCategory {
  name: string;
  progress: number;
  level: string;
  levelClass: string;
  color: string;
  icon: string;
}

interface SavedCorrection {
  id: string;
  mistake: string;
  correction: string;
  explanation: string;
  category: string;
  date: string;
  practiced_count: number;
}

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

  // ========== NAVIGATION STATE ==========
  showDictionaryView = signal(false);
  showCorrectionsView = signal(false);
  searchMode = signal(false);
  selectedWord = signal<UserDictionaryEntry | null>(null);

  // ========== DICTIONARY STATE (existing) ==========
  filter = signal<'all' | WordStatus>('all');
  words = signal<UserDictionaryEntry[]>([]);
  isLoading = signal(false);
  searchTerm = signal('');
  currentPage = signal(1);
  sortBy = signal('recent');
  itemsPerPage = 12;

  private cacheKey = '';

  constructor() {
    this.loadUserPreferences();
  }

  // ========== SEARCH AND FILTER STATE ==========
  dictionarySearch = signal('');
  correctionsSearch = signal('');
  activeDictionaryFilter = signal('all');
  activeCorrectionFilter = signal('all');

  // ========== FILTER OPTIONS ==========
  dictionaryFilters = [
    { key: 'all', label: 'Todas' },
    { key: 'active', label: 'Dominadas' },
    { key: 'passive', label: 'Aprendiendo' },
    { key: 'recent', label: 'Recientes' },
    { key: 'frequent', label: 'Más usadas' },
  ];

  correctionCategories = [
    { key: 'all', label: 'Todas', icon: 'fas fa-list' },
    { key: 'grammar', label: 'Gramática', icon: 'fas fa-spell-check' },
    { key: 'vocabulary', label: 'Vocabulario', icon: 'fas fa-book-open' },
    { key: 'phrasal_verb', label: 'Phrasal Verbs', icon: 'fas fa-link' },
    { key: 'expression', label: 'Expresiones', icon: 'fas fa-comments' },
  ];

  // ========== COMPUTED INSIGHTS ==========
  getWeeklyNewWords = computed(() => 3);
  getPendingPractice = computed(
    () => this.dummyCorrections().filter((c) => c.practiced_count < 3).length
  );

  // ========== COMPUTED PREVIEWS WITH FILTERS ==========
  filteredDictionaryPreview = computed(() => {
    let filtered = this.words();

    // Apply filter
    const filter = this.activeDictionaryFilter();
    if (filter === 'active') {
      filtered = filtered.filter((w) => w.status === 'active');
    } else if (filter === 'passive') {
      filtered = filtered.filter((w) => w.status === 'passive');
    } else if (filter === 'recent') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter((w) => new Date(w.created_at) >= weekAgo);
    } else if (filter === 'frequent') {
      filtered = filtered.filter((w) => (w.usage_count || 0) >= 3);
    }

    // Apply search
    const search = this.dictionarySearch().toLowerCase().trim();
    if (search) {
      filtered = filtered.filter(
        (word) =>
          word.word.toLowerCase().includes(search) ||
          word.meaning.toLowerCase().includes(search)
      );
    }

    // Sort and limit
    return filtered
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 9);
  });

  filteredCorrectionsPreview = computed(() => {
    let filtered = this.dummyCorrections();

    // Apply category filter
    const categoryFilter = this.activeCorrectionFilter();
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((c) => c.category === categoryFilter);
    }

    // Apply search
    const search = this.correctionsSearch().toLowerCase().trim();
    if (search) {
      filtered = filtered.filter(
        (correction) =>
          correction.mistake.toLowerCase().includes(search) ||
          correction.correction.toLowerCase().includes(search) ||
          correction.explanation.toLowerCase().includes(search)
      );
    }

    return filtered.slice(0, 8);
  });

  // ========== FILTER METHODS ==========
  setDictionaryFilter(filter: string): void {
    this.activeDictionaryFilter.set(filter);
  }

  setCorrectionFilter(category: string): void {
    this.activeCorrectionFilter.set(category);
  }

  getCorrectionCategoryCount(category: string): number {
    if (category === 'all') return this.dummyCorrections().length;
    return this.dummyCorrections().filter((c) => c.category === category)
      .length;
  }

  // ========== SEARCH HANDLERS ==========
  onDictionarySearchChange(): void {
    // Filtering handled by computed
  }

  onCorrectionsSearchChange(): void {
    // Filtering handled by computed
  }

  // ========== CATEGORY INSIGHTS ==========
  getCategoryInsight(category: ProgressCategory): string {
    const insights = {
      'Context Awareness': '3 conversaciones analizadas',
      Grammar: 'Mejora en present perfect',
      Vocabulary: '5 palabras nuevas esta semana',
      'Phrasal Verbs': 'Practica "look up", "give up"',
      Collocations: 'Trabaja combinaciones naturales',
      Expressions: 'Dominas expresiones básicas',
    };
    return (
      insights[category.name as keyof typeof insights] || 'Progreso constante'
    );
  }

  // ========== WORD UTILITY METHODS ==========
  getWordMasteryLevel(word: UserDictionaryEntry): string {
    const usageCount = word.usage_count || 0;
    if (usageCount >= 10) return 'Experto';
    if (usageCount >= 5) return 'Avanzado';
    if (usageCount >= 2) return 'Intermedio';
    return 'Principiante';
  }

  // ========== TRACK BY FUNCTIONS ==========
  trackByFilter(index: number, filter: any): string {
    return filter.key;
  }

  trackByCorrectionCategory(index: number, category: any): string {
    return category.key;
  }
  totalWords = computed(() => this.words().length || 23);
  activeWords = computed(
    () => this.words().filter((w) => w.status === 'active').length || 15
  );
  studyStreak = computed(() => 7); // dummy
  savedCorrections = computed(() => 12); // dummy
  weeklyGoal = computed(() => 85); // dummy

  grammarCorrections = computed(() => 5); // dummy
  vocabularyCorrections = computed(() => 4); // dummy

  recentWords = computed(() => {
    if (this.words().length > 0) {
      return this.words().slice(0, 5);
    }
    // Dummy data si no hay palabras reales
    return [
      { id: '1', word: 'exciting', status: 'active' },
      { id: '2', word: 'challenging', status: 'passive' },
      { id: '3', word: 'amazed', status: 'active' },
    ] as any[];
  });

  progressCategories = computed((): ProgressCategory[] => [
    {
      name: 'Context Awareness',
      progress: 80,
      level: 'Avanzado',
      levelClass: 'text-blue-600',
      color: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
      icon: 'fas fa-user-tie',
    },
    {
      name: 'Grammar',
      progress: 70,
      level: 'Intermedio',
      levelClass: 'text-purple-600',
      color: 'linear-gradient(135deg, #EC4899, #BE185D)',
      icon: 'fas fa-spell-check',
    },
    {
      name: 'Vocabulary',
      progress: 85,
      level: 'Avanzado',
      levelClass: 'text-blue-600',
      color: 'linear-gradient(135deg, #F59E0B, #D97706)',
      icon: 'fas fa-book-open',
    },
    {
      name: 'Phrasal Verbs',
      progress: 30,
      level: 'Básico',
      levelClass: 'text-amber-600',
      color: 'linear-gradient(135deg, #6366F1, #4F46E5)',
      icon: 'fas fa-link',
    },
    {
      name: 'Collocations',
      progress: 50,
      level: 'Intermedio',
      levelClass: 'text-purple-600',
      color: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
      icon: 'fas fa-puzzle-piece',
    },
    {
      name: 'Expressions',
      progress: 70,
      level: 'Intermedio',
      levelClass: 'text-purple-600',
      color: 'linear-gradient(135deg, #10B981, #059669)',
      icon: 'fas fa-comments',
    },
  ]);

  dummyCorrections = computed((): SavedCorrection[] => [
    {
      id: '1',
      mistake: 'I am very exciting about the trip',
      correction: 'I am very excited about the trip',
      explanation:
        'Use "excited" (adjective) to describe how you feel, not "exciting" (describes something that causes excitement)',
      category: 'vocabulary',
      date: 'Hace 2 días',
      practiced_count: 3,
    },
    {
      id: '2',
      mistake: 'I have been lived here for 5 years',
      correction: 'I have lived here for 5 years',
      explanation:
        'Present perfect uses "have + past participle", not "have been + past participle" for this context',
      category: 'grammar',
      date: 'Hace 5 días',
      practiced_count: 1,
    },
    {
      id: '3',
      mistake: 'I need to look up for this information',
      correction: 'I need to look up this information',
      explanation:
        'The phrasal verb "look up" means to search for information. Don\'t add extra prepositions',
      category: 'phrasal_verb',
      date: 'Ayer',
      practiced_count: 5,
    },
    {
      id: '4',
      mistake: 'Can you borrow me your book?',
      correction: 'Can you lend me your book?',
      explanation:
        'Use "lend" when giving something to someone, "borrow" when taking something from someone',
      category: 'vocabulary',
      date: 'Hace 1 semana',
      practiced_count: 2,
    },
    {
      id: '5',
      mistake: 'I am working hardly to finish this project',
      correction: 'I am working hard to finish this project',
      explanation:
        '"Hard" is both an adjective and adverb. "Hardly" means "barely" or "scarcely", not intensely',
      category: 'vocabulary',
      date: 'Hace 10 días',
      practiced_count: 0,
    },
    {
      id: '6',
      mistake: 'The weather is enough hot today',
      correction: 'The weather is hot enough today',
      explanation:
        'In English, "enough" comes after adjectives and before nouns',
      category: 'grammar',
      date: 'Hace 3 días',
      practiced_count: 7,
    },
  ]);

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
  }

  ngOnDestroy(): void {
    this.saveUserPreferences();
  }

  // ========== NAVIGATION METHODS ==========
  openDictionaryView(): void {
    this.showDictionaryView.set(true);
  }

  closeDictionaryView(): void {
    this.showDictionaryView.set(false);
  }

  openCorrectionsView(): void {
    this.showCorrectionsView.set(true);
  }

  closeCorrectionsView(): void {
    this.showCorrectionsView.set(false);
  }

  // ========== EXISTING DICTIONARY METHODS ==========
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

  handleWordAdded(): void {
    this.loadWordsFromBackend(true);
    this.searchMode.set(false);
  }

  onSelectWord(word: UserDictionaryEntry): void {
    this.selectedWord.set(word);
  }

  // ========== UTILITY METHODS FOR CORRECTIONS ==========
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
  trackByCategory(index: number, category: ProgressCategory): string {
    return category.name;
  }

  trackByWord(index: number, word: any): string {
    return word.id;
  }

  trackByCorrection(index: number, correction: SavedCorrection): string {
    return correction.id;
  }

  trackByWordId(index: number, word: UserDictionaryEntry): string {
    return word.id;
  }

  // ========== EXISTING DICTIONARY COMPUTED PROPERTIES ==========
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
    this.currentPage.set(1);
    this.saveUserPreferences();
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

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Métodos de utilidad para el template del diccionario completo
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

  getMasteryLevel(word: UserDictionaryEntry): string {
    const usageCount = word.usage_count || 0;
    const daysSinceCreated = this.getDaysSinceCreated(word);

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

  getMasteryPercentage(word: UserDictionaryEntry): number {
    const usageCount = word.usage_count || 0;
    const daysSinceCreated = this.getDaysSinceCreated(word);

    return this.calculateMasteryScore(usageCount, daysSinceCreated);
  }

  private calculateMasteryScore(
    usageCount: number,
    daysSinceCreated: number
  ): number {
    const usageWeight = 0.7;
    const timeWeight = 0.3;

    const usageScore = Math.min(Math.log(usageCount + 1) * 25, 100);
    const timeScore = Math.min(daysSinceCreated * 2, 100);

    const combinedScore = usageScore * usageWeight + timeScore * timeWeight;

    return Math.round(Math.min(combinedScore, 100));
  }

  private getDaysSinceCreated(word: UserDictionaryEntry): number {
    const created = new Date(word.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
