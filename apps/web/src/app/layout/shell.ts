import { Avatar } from '@lifequest/ui';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { Toasts } from '@lifequest/data-access';
import { AuthStore } from '@lifequest/auth';
import { LocalizedDatePipe, Preferences } from '@lifequest/utilities';
import { Icon, Logo } from '@lifequest/ui';
@Component({
  selector: 'lq-shell',
  imports: [
    Avatar,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    LocalizedDatePipe,
    NgTemplateOutlet,
    DrawerModule,
    Icon,
    Logo,
  ],
  templateUrl: './shell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shell {
  readonly auth = inject(AuthStore);
  readonly i18n = inject(Preferences);
  private readonly router = inject(Router);
  private readonly toasts = inject(Toasts);
  readonly menuOpen = signal(false);
  readonly moreOpen = signal(false);
  readonly today = new Date();
  readonly navigation = [
    {
      label: 'YOUR JOURNEY',
      ar: 'رحلتك',
      items: [
        { path: '/dashboard', title: 'Home', ar: 'الرئيسية', icon: 'home' },
        { path: '/today', title: 'Today', ar: 'اليوم', icon: 'calendar' },
        { path: '/journey', title: 'My journey', ar: 'رحلتي', icon: 'map' },
        { path: '/rewards', title: 'Rewards', ar: 'المكافآت', icon: 'gift' },
        { path: '/challenges', title: 'Challenges', ar: 'التحديات', icon: 'swords' },
      ],
    },
  ];
  readonly more = [
    { path: '/habits', title: 'Habits', ar: 'العادات', icon: 'sprout' },
    { path: '/goals', title: 'Goals', ar: 'الأهداف', icon: 'target' },
    { path: '/projects', title: 'Projects', ar: 'المشروعات', icon: 'folder' },
    { path: '/tasks', title: 'Tasks', ar: 'المهام', icon: 'tasks' },
    { path: '/quests', title: 'Weekly quests', ar: 'المهام الأسبوعية', icon: 'flag' },
    { path: '/habit-lab', title: 'Habit Lab', ar: 'مختبر العادات', icon: 'flask' },
    { path: '/analytics', title: 'Insights', ar: 'الرؤى', icon: 'chart' },
    { path: '/achievements', title: 'Achievements', ar: 'الإنجازات', icon: 'award' },
    { path: '/friends', title: 'Friends', ar: 'الأصدقاء', icon: 'users' },
  ];
  readonly bottom = [
    { path: '/dashboard', title: 'Home', ar: 'الرئيسية', icon: 'home' },
    { path: '/today', title: 'Today', ar: 'اليوم', icon: 'calendar' },
    { path: '/journey', title: 'Journey', ar: 'رحلتي', icon: 'map' },
    { path: '/rewards', title: 'Rewards', ar: 'المكافآت', icon: 'gift' },
    { path: '/challenges', title: 'Challenges', ar: 'التحديات', icon: 'swords' },
  ];
  async logout() {
    try {
      await this.auth.logout();
      await this.router.navigate(['/auth/login']);
    } catch (error) {
      this.toasts.error(error);
    }
  }
}
