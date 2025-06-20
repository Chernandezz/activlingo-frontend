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
import { tap, shareReplay, switchMap, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/user`;

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

  // ========== PERFIL ==========

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/profile`);
  }

  updateProfile(data: UpdateProfileRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/profile`, data);
  }

  // ========== LOGROS ==========

  getAchievements(): Observable<{
    achievements: Achievement[];
    total_unlocked: number;
  }> {
    return this.http.get<{
      achievements: Achievement[];
      total_unlocked: number;
    }>(`${this.apiUrl}/achievements`);
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
