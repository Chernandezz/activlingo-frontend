// src/app/pages/profile/profile.component.ts - COMPLETAMENTE RENOVADO
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { SubscriptionService } from '../../../core/services/subscription.service';

import {
  Achievement,
  UpdateProfileRequest,
  UserProfile,
  UserStats,
} from '../../../core/models/user.model';
import {
  SubscriptionPlan,
  SubscriptionStatus,
} from '../../../core/models/subscription.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  // ========== ESTADO ==========
  activeTab: string = 'settings';
  isLoading = true;
  isUpgrading = false;
  isCanceling = false;

  // ========== DATOS ==========
  profile: UserProfile | null = null;
  subscriptionStatus: SubscriptionStatus | null = null;
  availablePlans: SubscriptionPlan[] = [];
  achievements: Achievement[] = [];

  // ========== FORMULARIO ==========
  editForm: UpdateProfileRequest = {
    name: '',
    language: 'es',
    learning_goal: 'conversation',
    difficulty_level: 'intermediate',
    notifications: {
      daily_reminders: true,
      achievements: true,
      product_updates: false,
    },
  };

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private subscriptionService: SubscriptionService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Configurar tab desde URL
    this.route.fragment.subscribe((fragment) => {
      this.activeTab = fragment || 'overview';
    });

    this.loadAllData();
  }

  // ========== CARGA DE DATOS ==========

  private loadAllData(): void {
    // Solo mostrar loading si no hay datos en cache
    const hasCache = localStorage.getItem('activlingo_profile_cache');
    if (!hasCache) {
      this.isLoading = true;
    }

    this.userService.getProfile().subscribe({
      next: (profile) => {
        console.log('✅ Perfil cargado:', profile);
        this.profile = profile;
        this.populateForm();
        this.loadSubscriptionStatus();
      },
      error: (error) => {
        console.error('❌ Error cargando perfil:', error);
        this.isLoading = false;
      },
    });
  }

  private loadSubscriptionStatus(): void {
    // Solo mostrar loading si no hay cache de suscripción
    const hasSubscriptionCache = localStorage.getItem(
      'activlingo_subscription_cache'
    );

    this.subscriptionService.getStatus().subscribe({
      next: (status) => {
        console.log('✅ Estado de suscripción:', status);
        this.subscriptionStatus = status;
        this.loadPlans();
      },
      error: (error) => {
        console.error('❌ Error cargando suscripción:', error);
        this.loadPlans();
      },
    });
  }

  private loadPlans(): void {
    this.subscriptionService.getPlans().subscribe({
      next: (plans) => {
        console.log('✅ Planes disponibles:', plans);
        this.availablePlans = plans.filter((plan) => plan.slug !== 'trial');
        this.loadAchievements();
      },
      error: (error) => {
        console.error('❌ Error cargando planes:', error);
        this.loadAchievements();
      },
    });
  }

  private loadAchievements(): void {
    this.userService.getAchievements().subscribe({
      next: (data) => {
        console.log('✅ Logros cargados (posiblemente desde cache):', data);
        this.achievements = data.achievements;
      },
      error: (error) => {
        console.error('❌ Error cargando logros:', error);
        this.achievements = [];
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  private populateForm(): void {
    if (this.profile?.user) {
      this.editForm = {
        ...this.editForm,
        name: this.profile.user.name || '',
      };
    }
  }

  // ========== ACCIONES DE SUSCRIPCIÓN ==========

  async upgradeSubscription(planSlug: string): Promise<void> {
    if (this.isUpgrading) return;

    this.isUpgrading = true;

    try {
      const response = await this.subscriptionService
        .createCheckout(planSlug, 'monthly')
        .pipe(finalize(() => (this.isUpgrading = false)))
        .toPromise();

      if (response?.checkout_url) {
        window.location.href = response.checkout_url;
      } else {
        this.showError('No se pudo generar la URL de pago');
      }
    } catch (error: any) {
      console.error('❌ Error en upgrade:', error);
      this.showError(error.message || 'Error al procesar el upgrade');
    }
  }

  async cancelSubscription(): Promise<void> {
    if (this.isCanceling) return;

    const confirmed = confirm(
      '¿Estás seguro de que quieres cancelar tu suscripción? Mantendrás el acceso hasta el final del período actual.'
    );

    if (!confirmed) return;

    this.isCanceling = true;

    try {
      const response = await this.subscriptionService
        .cancel()
        .pipe(finalize(() => (this.isCanceling = false)))
        .toPromise();

      if (response?.message) {
        const endDate = response.ends_at
          ? this.formatDate(response.ends_at)
          : 'el final del período';
        alert(`Suscripción cancelada. Mantendrás el acceso hasta ${endDate}`);
        this.loadSubscriptionStatus();
      }
    } catch (error: any) {
      console.error('❌ Error cancelando suscripción:', error);
      this.showError(error.message || 'Error al cancelar la suscripción');
    }
  }

  // ========== GETTERS PARA LA UI ==========

  get currentPlan(): any {
    return this.subscriptionStatus?.subscription?.plan || null;
  }

  get userStats(): UserStats {
    return (
      this.profile?.stats || {
        total_conversations: 0,
        current_streak: 0,
        longest_streak: 0,
        total_words_learned: 0,
        join_date: '',
        last_activity: '',
        conversations_this_month: 0,
        words_learned_this_month: 0,
      }
    );
  }

  get subscriptionStatusText(): string {
    const status = this.subscriptionStatus?.status || 'no_subscription';
    return this.subscriptionService.getStatusText(status);
  }

  get isOnTrial(): boolean {
    return this.subscriptionStatus?.status === 'trial';
  }

  get isCanceledSubscription(): boolean {
    return this.subscriptionService.isCanceled(
      this.subscriptionStatus?.status || ''
    );
  }

  get canUpgradeSubscription(): boolean {
    return this.subscriptionStatus?.can_upgrade || false;
  }

  get canCancelSubscription(): boolean {
    return this.subscriptionStatus?.can_cancel || false;
  }

  get trialDaysRemaining(): number {
    const endDate = this.subscriptionStatus?.subscription?.ends_at;
    return endDate
      ? this.subscriptionService.calculateTrialDaysRemaining(endDate)
      : 0;
  }

  get unlockedAchievements(): Achievement[] {
    return this.achievements.filter((a) => a.unlocked);
  }

  get lockedAchievements(): Achievement[] {
    return this.achievements.filter((a) => !a.unlocked);
  }

  // ========== UTILIDADES DE UI ==========

  isCurrentPlan(planSlug: string): boolean {
    return this.currentPlan?.slug === planSlug;
  }

  canUpgradeToPlan(planSlug: string): boolean {
    if (!this.currentPlan) return true;
    return this.subscriptionService.canUpgradeTo(
      this.currentPlan.slug,
      planSlug
    );
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  getUserInitials(): string {
    return this.userService.getUserInitials(
      this.profile?.user?.name,
      this.profile?.user?.email
    );
  }

  getDisplayName(): string {
    return this.userService.getDisplayName(
      this.profile?.user?.name,
      this.profile?.user?.email
    );
  }

  getPlanBadgeColor(): string {
    const planSlug = this.isOnTrial
      ? 'trial'
      : this.currentPlan?.slug || 'basic';
    return this.subscriptionService.getPlanBadgeColor(planSlug);
  }

  getPlanName(): string {
    if (this.isOnTrial) return 'Prueba Gratuita';
    return this.currentPlan?.name || 'Básico';
  }

  getStreakIcon(): string {
    return this.userService.getStreakIcon(this.userStats.current_streak);
  }

  getStreakColor(): string {
    return this.userService.getStreakColor(this.userStats.current_streak);
  }

  getJoinedDaysAgo(): number {
    return this.userService.calculateDaysAgo(this.userStats.join_date);
  }

  getAchievementProgress(achievement: Achievement): number {
    if (!achievement.current_progress || !achievement.target_value) return 0;
    return Math.min(
      (achievement.current_progress / achievement.target_value) * 100,
      100
    );
  }

  formatDate(dateString: string): string {
    return this.userService.formatDate(dateString);
  }

  formatPrice(price: number, currency: string = 'USD'): string {
    return this.subscriptionService.formatPrice(price, currency);
  }

  getBillingIntervalText(interval: string): string {
    return this.subscriptionService.getBillingIntervalText(interval);
  }

  // ========== UTILIDADES ==========

  private showError(message: string): void {
    alert(message);
  }
}
