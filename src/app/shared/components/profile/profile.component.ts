import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import {
  UserService,
} from '../../../core/services/user.service';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { UpdateProfileRequest, UserProfileResponse } from '../../../core/models/profile.model';
import { SubscriptionPlan } from '../../../core/models/subscription.model';
import { UserStats } from '../../../core/models/user.model';
import { Achievement } from '../../../core/models/achievement.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  activeTab: string = 'settings';
  user: any = null;
  profileData: UserProfileResponse | null = null;
  availablePlans: SubscriptionPlan[] = [];

  isUpgrading = false;
  isCanceling = false;
  isLoading = true;

  editForm = {
    name: '',
    email: '',
    language: 'es',
    learning_goal: 'conversation',
    difficulty_level: 'intermediate',
    notifications: {
      daily_reminders: true,
      achievements: true,
      product_updates: false,
    },
  };

  userStats: UserStats = {
    total_conversations: 0,
    current_streak: 0,
    longest_streak: 0,
    total_words_learned: 0,
    average_session_minutes: 0,
    join_date: '',
  };

  achievements: Achievement[] = [];

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private subscriptionService: SubscriptionService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.fragment.subscribe((fragment) => {
      this.activeTab = fragment || 'settings';
    });

    this.loadUserData();
  }

  private loadUserData(): void {
    this.user = this.authService.currentUser;
    this.isLoading = true;


    if (this.user) {
      // ✅ CARGAR DATOS DE PERFIL PRIMERO
      this.userService.getFullProfile().subscribe({
        next: (response) => {

          // ✅ EXTRAER LOS DATOS CORRECTAMENTE
          if (response.success && response.profile) {
            this.profileData = response.profile;

            // ✅ MAPEAR ESTADÍSTICAS
            if (this.profileData.stats) {
              this.userStats = {
                total_conversations: this.profileData.stats.total_conversations,
                current_streak: this.profileData.stats.current_streak,
                longest_streak: this.profileData.stats.longest_streak,
                total_words_learned: this.profileData.stats.total_words_learned,
                average_session_minutes:
                  this.profileData.stats.average_session_minutes,
                join_date: this.profileData.stats.join_date,
              };
            }

            // ✅ MAPEAR FORMULARIO
            if (this.profileData.user) {
              this.editForm = {
                name: this.profileData.user.name || '',
                email: this.profileData.user.email || '',
                language: 'es',
                learning_goal: 'conversation',
                difficulty_level: 'intermediate',
                notifications: {
                  daily_reminders: true,
                  achievements: true,
                  product_updates: false,
                },
              };
            }
          }

          // ✅ CARGAR PLANES DISPONIBLES
          this.loadAvailablePlans();

          // ✅ CARGAR LOGROS
          this.loadAchievements();

          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ Error loading profile:', error);
          this.isLoading = false;
        },
      });
    } else {
      console.warn('⚠️ No authenticated user found');
      this.isLoading = false;
    }
  }

  private loadAvailablePlans(): void {
    this.subscriptionService.getAvailablePlans().subscribe({
      next: (data) => {
        this.availablePlans = data.plans.filter(
          (plan) => !['trial'].includes(plan.slug)
        );
      },
      error: (error) => {
        console.error('❌ Error loading plans:', error);
        this.availablePlans = [];
      },
    });
  }

  private loadAchievements(): void {
    this.userService.getAchievements().subscribe({
      next: (achievementData) => {
        this.achievements = achievementData.achievements || [];
      },
      error: (error) => {
        this.achievements = [];
      },
    });
  }

  private calculateLevelProgress(): number {
    const conversations = this.userStats.total_conversations;
    const currentLevelBase = Math.floor(conversations / 10) * 10;
    const nextLevelBase = currentLevelBase + 10;
    const progress =
      ((conversations - currentLevelBase) /
        (nextLevelBase - currentLevelBase)) *
      100;
    return Math.min(progress, 100);
  }

  async upgradeSubscription(planSlug: string): Promise<void> {
    if (this.isUpgrading) return;
    this.isUpgrading = true;

    try {
      const response = await this.subscriptionService
        .createUpgradeSession(planSlug, 'monthly')
        .toPromise();
      if (response?.checkout_url) {
        window.location.href = response.checkout_url;
      }
    } catch (error) {
      alert('Error al procesar el upgrade. Por favor intenta de nuevo.');
    } finally {
      this.isUpgrading = false;
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
        .cancelSubscription()
        .toPromise();
      if (response?.success) {
        const endDate = response.ends_at
          ? this.formatDate(response.ends_at)
          : 'el final del período';
        alert(`Suscripción cancelada. Mantendrás el acceso hasta ${endDate}`);
        this.loadUserData();
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      alert('Error al cancelar la suscripción. Por favor intenta de nuevo.');
    } finally {
      this.isCanceling = false;
    }
  }

  getCurrentPlan(): SubscriptionPlan | null {
    return this.profileData?.subscription?.plan || null;
  }

  isCurrentPlan(planSlug: string): boolean {
    const currentPlan = this.getCurrentPlan();
    return currentPlan?.slug === planSlug;
  }

  canUpgradeTo(planSlug: string): boolean {
    const currentPlan = this.getCurrentPlan();
    if (!currentPlan) return true;
    return this.subscriptionService.canUpgradeTo(currentPlan.slug, planSlug);
  }

  getSubscriptionStatus(): string {
    const subscription = this.profileData?.subscription;
    if (!subscription) return 'Prueba gratuita';

    if (subscription.status === 'trial') return 'Prueba gratuita';

    return this.subscriptionService.getStatusText(subscription.status || '');
  }

  isSubscriptionCanceled(): boolean {
    return this.subscriptionService.isSubscriptionCanceled(
      this.profileData?.subscription?.status || ''
    );
  }

  isOnTrial(): boolean {
    const subscription = this.profileData?.subscription;
    return !subscription || subscription.status === 'trial';
  }

  getTrialDaysRemaining(): number {
    const subscription = this.profileData?.subscription;
    if (!subscription?.trial_ends_at) return 3;

    try {
      const trialEnd = new Date(subscription.trial_ends_at);
      const now = new Date();
      const diffTime = trialEnd.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return Math.max(0, diffDays);
    } catch {
      return 3;
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  getUserInitials(): string {
    const name = this.profileData?.user?.name;
    const email = this.profileData?.user?.email;

    if (name && name.trim() !== '') {
      return name
        .split(' ')
        .map((word: string) => word.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }

    if (email) {
      return email.charAt(0).toUpperCase();
    }

    return 'U';
  }

  getDisplayName(): string {
    const name = this.profileData?.user?.name;
    const email = this.profileData?.user?.email;

    if (name && name.trim() !== '') {
      return name;
    }

    if (email) {
      const username = email.split('@')[0];
      return username;
    }

    return 'Usuario';
  }

  getStreakIcon(): string {
    if (this.userStats.current_streak >= 30) return 'fas fa-crown';
    if (this.userStats.current_streak >= 7) return 'fas fa-fire';
    return 'fas fa-calendar-check';
  }

  getStreakColor(): string {
    if (this.userStats.current_streak >= 30) return 'text-yellow-500';
    if (this.userStats.current_streak >= 7) return 'text-orange-500';
    return 'text-blue-500';
  }

  getJoinedDaysAgo(): number {
    if (!this.userStats.join_date) return 0;
    try {
      const join_date = new Date(this.userStats.join_date);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - join_date.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  }

  getUnlockedAchievements(): Achievement[] {
    const unlocked = this.achievements.filter((a) => a.unlocked);
    return unlocked;
  }

  getLockedAchievements(): Achievement[] {
    const locked = this.achievements.filter((a) => !a.unlocked);
    return locked;
  }

  getAchievementProgress(achievement: Achievement): number {
    if (!achievement.current_progress || !achievement.target_value) return 0;
    return Math.min(
      (achievement.current_progress / achievement.target_value) * 100,
      100
    );
  }

  formatDate(dateString: string): string {
    if (!dateString) {
      return 'Fecha no disponible';
    }

    try {
      const formatted = new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      return formatted;
    } catch (error) {
      console.error('❌ Error formatting date:', error);
      return 'Fecha no válida';
    }
  }

  getPlanBadgeColor(): string {
    if (this.isOnTrial()) {
      return 'bg-gradient-to-r from-green-400 to-green-600 text-white';
    }

    const plan = this.getCurrentPlan();
    if (!plan) return 'bg-gray-100 text-gray-700';

    switch (plan.slug) {
      case 'premium':
        return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white';
      case 'premium_yearly':
        return 'bg-gradient-to-r from-purple-400 to-purple-600 text-white';
      case 'pro':
        return 'bg-gradient-to-r from-purple-400 to-purple-600 text-white';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  getPlanName(): string {
    if (this.isOnTrial()) {
      return 'Prueba Gratuita';
    }

    const plan = this.getCurrentPlan();
    return plan?.name || 'Básico';
  }
}