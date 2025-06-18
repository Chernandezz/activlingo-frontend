import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import {
  UserProfileResponse,
  UserService,
  UpdateProfileRequest,
} from '../../../core/services/user.service';
import { SubscriptionService } from '../../../core/services/subscription.service';

interface UserStats {
  totalChats: number;
  currentStreak: number;
  longestStreak: number;
  totalWords: number;
  averageSession: number;
  joinDate: string;
  level: string;
  nextLevelProgress: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlocked_at?: string;
  current_progress?: number;
  target_value?: number;
}

interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  price: number;
  currency: string;
  billing_interval: string;
  features: string[];
  max_conversations: number;
  max_words_per_day: number;
  priority_support: boolean;
  stripe_price_id?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  user: any = null;
  profileData: UserProfileResponse | null = null;
  availablePlans: SubscriptionPlan[] = [];

  isEditing = false;
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
    totalChats: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalWords: 0,
    averageSession: 0,
    joinDate: '',
    level: 'Nuevo',
    nextLevelProgress: 0,
  };

  achievements: Achievement[] = [];
  activeTab = 'overview';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private subscriptionService: SubscriptionService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  private loadUserData(): void {
    this.user = this.authService.currentUser;
    this.isLoading = true;

    console.log('🔍 Current user from auth:', this.user);

    if (this.user) {
      // ✅ CARGAR DATOS DE PERFIL PRIMERO
      this.userService.getFullProfile().subscribe({
        next: (response) => {
          console.log('📊 Full response received:', response);
          
          // ✅ EXTRAER LOS DATOS CORRECTAMENTE
          if (response.success && response.profile) {
            this.profileData = response.profile;
            console.log('✅ Profile data extracted:', this.profileData);
            
            // ✅ MAPEAR ESTADÍSTICAS
            if (this.profileData.stats) {
              this.userStats = {
                totalChats: this.profileData.stats.total_conversations,
                currentStreak: this.profileData.stats.current_streak,
                longestStreak: this.profileData.stats.longest_streak,
                totalWords: this.profileData.stats.total_words_learned,
                averageSession: this.profileData.stats.average_session_minutes,
                joinDate: this.profileData.stats.join_date,
                level: this.userService.getLevel(this.profileData.stats.total_conversations),
                nextLevelProgress: this.calculateLevelProgress(),
              };
              console.log('📈 User stats mapped:', this.userStats);
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
              console.log('📝 Edit form populated:', this.editForm);
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
        console.log('📋 Plans data received:', data);
        // ✅ Filtrar planes - excluir "trial" y "basic"
        this.availablePlans = data.plans.filter(
          (plan) => !['trial', 'basic'].includes(plan.slug)
        );
        console.log('💰 Available plans after filter:', this.availablePlans);
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
        console.log('🏆 Achievements data:', achievementData);
        this.achievements = achievementData.achievements || [];
        console.log('🏆 Processed achievements:', this.achievements);
      },
      error: (error) => {
        console.error('❌ Error loading achievements:', error);
        this.achievements = [];
      },
    });
  }

  private calculateLevelProgress(): number {
    const conversations = this.userStats.totalChats;
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
      console.error('Error upgrading subscription:', error);
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
    if (!subscription?.trial_ends_at) return 7;

    try {
      const trialEnd = new Date(subscription.trial_ends_at);
      const now = new Date();
      const diffTime = trialEnd.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return Math.max(0, diffDays);
    } catch {
      return 7;
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing && this.profileData) {
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

  saveProfile(): void {
    if (!this.profileData) return;

    const updateData: UpdateProfileRequest = {
      name: this.editForm.name,
      language: this.editForm.language,
      learning_goal: this.editForm.learning_goal,
      difficulty_level: this.editForm.difficulty_level,
      notifications: this.editForm.notifications,
    };

    this.userService.updateProfile(updateData).subscribe({
      next: (response) => {
        if (this.profileData) {
          this.profileData.user.name = this.editForm.name;
        }
        this.isEditing = false;
        console.log('Perfil actualizado exitosamente');
      },
      error: (error) => {
        console.error('Error updating profile:', error);
      },
    });
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

    console.log('🔍 getDisplayName - name:', name, 'email:', email);

    if (name && name.trim() !== '') {
      console.log('✅ Using name:', name);
      return name;
    }

    if (email) {
      const username = email.split('@')[0];
      console.log('✅ Using email username:', username);
      return username;
    }

    console.log('⚠️ Using fallback: Usuario');
    return 'Usuario';
  }

  getStreakIcon(): string {
    if (this.userStats.currentStreak >= 30) return 'fas fa-crown';
    if (this.userStats.currentStreak >= 7) return 'fas fa-fire';
    return 'fas fa-calendar-check';
  }

  getStreakColor(): string {
    if (this.userStats.currentStreak >= 30) return 'text-yellow-500';
    if (this.userStats.currentStreak >= 7) return 'text-orange-500';
    return 'text-blue-500';
  }

  getLevelProgress(): number {
    return this.userStats.nextLevelProgress;
  }

  getJoinedDaysAgo(): number {
    if (!this.userStats.joinDate) return 0;
    try {
      const joinDate = new Date(this.userStats.joinDate);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - joinDate.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  }

  getUnlockedAchievements(): Achievement[] {
    const unlocked = this.achievements.filter((a) => a.unlocked);
    console.log('🔓 Getting unlocked achievements:', unlocked);
    return unlocked;
  }

  getLockedAchievements(): Achievement[] {
    const locked = this.achievements.filter((a) => !a.unlocked);
    console.log('🔒 Getting locked achievements:', locked);
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
    console.log('📅 Formatting date:', dateString);

    if (!dateString) {
      console.log('⚠️ No date string provided');
      return 'Fecha no disponible';
    }

    try {
      const formatted = new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      console.log('✅ Formatted date:', formatted);
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