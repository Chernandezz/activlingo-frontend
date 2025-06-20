// src/app/core/services/user.service.ts - CON ESTADO REACTIVO
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, timer, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  UserProfile,
  UserStats,
  Achievement,
  UpdateProfileRequest,
} from '../models/user.model';
import { tap, shareReplay, switchMap, catchError, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/user`;

  private readonly STORAGE_KEYS = {
    PROFILE: 'activlingo_profile_cache',
    ACHIEVEMENTS: 'activlingo_achievements_cache',
  };

  // ========== CACHE SYSTEM ==========
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
  private profileCache: { data: UserProfile; timestamp: number } | null = null;
  private achievementsCache: { data: Achievement[]; timestamp: number } | null =
    null;

  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  private achievementsFullSubject = new BehaviorSubject<Achievement[] | null>(
    null
  );

  public userProfile$ = this.userProfileSubject.asObservable();
  public achievementsFull$ = this.achievementsFullSubject.asObservable();

  // ========== MÉTODOS MODIFICADOS ==========

  // REEMPLAZAR el método getProfile existente:
  getProfile(): Observable<UserProfile> {
    // 1. Intentar cargar desde cache en memoria
    if (this.profileCache && this.isCacheValid(this.STORAGE_KEYS.PROFILE)) {
      this.userProfileSubject.next(this.profileCache.data);
      return of(this.profileCache.data);
    }

    // 2. Intentar cargar desde localStorage
    try {
      const cached = localStorage.getItem(this.STORAGE_KEYS.PROFILE);
      if (cached && this.isCacheValid(this.STORAGE_KEYS.PROFILE)) {
        const { data } = JSON.parse(cached);
        this.profileCache = { data, timestamp: Date.now() };
        this.userProfileSubject.next(data);

        // Refresh en background (sin loading)
        this.loadProfileFromServer(false).subscribe();

        return of(data);
      }
    } catch (error) {
      console.warn('Error reading profile cache:', error);
    }

    // 3. Si no hay cache, cargar desde servidor
    return this.loadProfileFromServer(true);
  }

  // REEMPLAZAR el método getAchievements existente:
  getAchievements(): Observable<{
    achievements: Achievement[];
    total_unlocked: number;
  }> {
    // Si tenemos cache válido, devolverlo inmediatamente
    if (
      this.achievementsCache &&
      this.isCacheValidByTimestamp(this.achievementsCache.timestamp)
    ) {
      const achievements = this.achievementsCache.data;
      this.achievementsFullSubject.next(achievements);
      return of({
        achievements,
        total_unlocked: achievements.filter((a) => a.unlocked).length,
      });
    }

    // Si no, cargar desde servidor
    return this.loadAchievementsFromServer();
  }

  // AGREGAR estos métodos nuevos:
  private loadProfileFromServer(showLoading = true): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/profile`).pipe(
      tap((profile) => {
        // Guardar en memoria
        this.profileCache = { data: profile, timestamp: Date.now() };

        // Guardar en localStorage
        localStorage.setItem(
          this.STORAGE_KEYS.PROFILE,
          JSON.stringify({
            data: profile,
            timestamp: Date.now(),
          })
        );

        this.userProfileSubject.next(profile);
      }),
      shareReplay(1)
    );
  }

  private loadAchievementsFromServer(): Observable<{
    achievements: Achievement[];
    total_unlocked: number;
  }> {
    return this.http
      .get<{ achievements: Achievement[]; total_unlocked: number }>(
        `${this.apiUrl}/achievements`
      )
      .pipe(
        tap((data) => {
          this.achievementsCache = {
            data: data.achievements,
            timestamp: Date.now(),
          };
          this.achievementsFullSubject.next(data.achievements);
        }),
        shareReplay(1)
      );
  }

  private isCacheValid(storageKey: string): boolean {
    try {
      const cached = localStorage.getItem(storageKey);
      if (!cached) return false;

      const { timestamp } = JSON.parse(cached);
      return Date.now() - timestamp < this.CACHE_DURATION;
    } catch {
      return false;
    }
  }
  private isCacheValidByTimestamp(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  preloadUserData(): Observable<void> {
    return this.loadProfileFromServer().pipe(
      switchMap(() => this.loadAchievementsFromServer()),
      map(() => void 0),
      catchError(() => of(void 0))
    );
  }

  clearCache(): void {
    this.profileCache = null;
    this.achievementsCache = null;
    this.userProfileSubject.next(null);
    this.achievementsFullSubject.next(null);

    // Limpiar localStorage
    localStorage.removeItem(this.STORAGE_KEYS.PROFILE);
    localStorage.removeItem(this.STORAGE_KEYS.ACHIEVEMENTS);
  }

  // ========== ESTADO REACTIVO ==========
  private userStatsSubject = new BehaviorSubject<UserStats | null>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  // Observables públicos
  public userStats$ = this.userStatsSubject.asObservable();
  public isLoading$ = this.isLoadingSubject.asObservable();

  constructor(private http: HttpClient) {
    // Auto-refresh cada 5 minutos (opcional)
    timer(0, 300000)
      .pipe(switchMap(() => this.loadStatsIfNeeded()))
      .subscribe();
  }

  // ========== ESTADÍSTICAS REACTIVAS ==========

  getStats(): Observable<UserStats> {
    // Si ya tenemos stats, las devolvemos inmediatamente
    const currentStats = this.userStatsSubject.value;
    if (currentStats) {
      return of(currentStats);
    }

    // Si no, cargar desde el servidor
    return this.loadStatsFromServer();
  }

  private loadStatsFromServer(): Observable<UserStats> {
    this.isLoadingSubject.next(true);

    return this.http.get<UserStats>(`${this.apiUrl}/stats`).pipe(
      tap((stats) => {
        this.userStatsSubject.next(stats);
        this.isLoadingSubject.next(false);
      }),
      catchError((error) => {
        console.error('Error loading stats:', error);
        this.isLoadingSubject.next(false);
        return of(this.getDefaultStats());
      }),
      shareReplay(1)
    );
  }

  private loadStatsIfNeeded(): Observable<UserStats> {
    // Solo cargar si no hay stats o si han pasado más de 1 minuto
    const currentStats = this.userStatsSubject.value;
    if (!currentStats) {
      return this.loadStatsFromServer();
    }
    return of(currentStats);
  }

  // ========== MÉTODOS PARA ACTUALIZAR STATS ==========

  /**
   * Llama esto cuando se completa una conversación
   */
  onConversationCompleted(): void {
    this.refreshStats();
  }

  /**
   * Llama esto cuando se aprende una nueva palabra
   */
  onWordLearned(): void {
    this.refreshStats();
  }

  /**
   * Fuerza la recarga de estadísticas
   */
  refreshStats(): void {
    this.loadStatsFromServer().subscribe();
  }

  /**
   * Actualiza una estadística específica sin recargar todo
   */
  updateStatistic(field: keyof UserStats, value: number): void {
    const currentStats = this.userStatsSubject.value;
    if (currentStats) {
      const updatedStats = { ...currentStats, [field]: value };
      this.userStatsSubject.next(updatedStats);
    }
  }

  /**
   * Incrementa una estadística específica
   */
  incrementStatistic(field: keyof UserStats, increment: number = 1): void {
    const currentStats = this.userStatsSubject.value;
    if (currentStats && typeof currentStats[field] === 'number') {
      const currentValue = currentStats[field] as number;
      const updatedStats = {
        ...currentStats,
        [field]: currentValue + increment,
      };
      this.userStatsSubject.next(updatedStats);
    }
  }

  private getDefaultStats(): UserStats {
    return {
      total_conversations: 0,
      current_streak: 0,
      longest_streak: 0,
      total_words_learned: 0,
      join_date: new Date().toISOString(),
      last_activity: new Date().toISOString(),
      conversations_this_month: 0,
      words_learned_this_month: 0,
    };
  }

  updateProfile(data: UpdateProfileRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/profile`, data);
  }

  // ========== ONBOARDING ==========

  markOnboardingCompleted(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/onboarding-seen`,
      {}
    );
  }

  // ========== UTILIDADES ==========

  formatDate(dateString: string): string {
    if (!dateString) return 'Fecha no disponible';

    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Fecha inválida';
    }
  }

  calculateDaysAgo(dateString: string): number {
    if (!dateString) return 0;

    try {
      const date = new Date(dateString);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - date.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  }

  getUserLevel(totalConversations: number): string {
    if (totalConversations < 10) return 'Principiante';
    if (totalConversations < 50) return 'Intermedio';
    if (totalConversations < 100) return 'Avanzado';
    return 'Experto';
  }

  getLevelProgress(totalConversations: number): number {
    const currentLevelBase = Math.floor(totalConversations / 10) * 10;
    const nextLevelBase = currentLevelBase + 10;
    const progress =
      ((totalConversations - currentLevelBase) /
        (nextLevelBase - currentLevelBase)) *
      100;
    return Math.min(progress, 100);
  }

  getStreakIcon(streak: number): string {
    if (streak >= 30) return 'fas fa-crown';
    if (streak >= 7) return 'fas fa-fire';
    return 'fas fa-calendar-check';
  }

  getStreakColor(streak: number): string {
    if (streak >= 30) return 'text-yellow-500';
    if (streak >= 7) return 'text-orange-500';
    return 'text-blue-500';
  }

  getUserInitials(name?: string, email?: string): string {
    if (name?.trim()) {
      return name
        .split(' ')
        .map((word) => word.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }

    if (email) {
      return email.charAt(0).toUpperCase();
    }

    return 'U';
  }

  getDisplayName(name?: string, email?: string): string {
    if (name?.trim()) {
      return name;
    }

    if (email) {
      return email.split('@')[0];
    }

    return 'Usuario';
  }
}
