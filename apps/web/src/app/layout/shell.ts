import { Avatar } from '@lifequest/ui';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { AuthStore } from '@lifequest/auth';
import { Preferences } from '@lifequest/utilities';
import { Icon, Logo } from '@lifequest/ui';
@Component({
  selector: 'lq-shell',
  imports: [
    Avatar,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    DatePipe,
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
  readonly menuOpen = signal(false);
  readonly today = new Date();
  readonly navigation = [
    {
      label: 'YOUR DAY',
      ar: 'يومك',
      items: [
        { path: '/dashboard', title: 'Overview', ar: 'الرئيسية', icon: 'home' },
        { path: '/today', title: 'Today', ar: 'اليوم', icon: 'calendar' },
        { path: '/habits', title: 'Habits', ar: 'العادات', icon: 'sprout' },
        { path: '/quests', title: 'Weekly quests', ar: 'المهام الأسبوعية', icon: 'flag' },
      ],
    },
    {
      label: 'YOUR BIGGER PICTURE',
      ar: 'صورتك الأكبر',
      items: [
        { path: '/goals', title: 'Goals', ar: 'الأهداف', icon: 'target' },
        { path: '/projects', title: 'Projects', ar: 'المشروعات', icon: 'folder' },
        { path: '/tasks', title: 'Tasks', ar: 'المهام', icon: 'tasks' },
        { path: '/journey', title: 'My journey', ar: 'رحلتي', icon: 'map' },
        { path: '/analytics', title: 'Insights', ar: 'الرؤى', icon: 'chart' },
      ],
    },
    {
      label: 'GROW & CONNECT',
      ar: 'تطور وتواصل',
      items: [
        { path: '/challenges', title: 'Challenges', ar: 'التحديات', icon: 'swords' },
        { path: '/friends', title: 'Friends', ar: 'الأصدقاء', icon: 'users' },
        { path: '/rewards', title: 'Reward shop', ar: 'المكافآت', icon: 'gift' },
        { path: '/achievements', title: 'Achievements', ar: 'الإنجازات', icon: 'award' },
      ],
    },
  ];
  readonly bottom = [
    { path: '/dashboard', title: 'Home', ar: 'الرئيسية', icon: 'home' },
    { path: '/today', title: 'Today', ar: 'اليوم', icon: 'calendar' },
    { path: '/habits', title: 'Habits', ar: 'العادات', icon: 'sprout' },
    { path: '/quests', title: 'Quests', ar: 'المهام', icon: 'flag' },
    { path: '/challenges', title: 'Challenges', ar: 'التحديات', icon: 'swords' },
  ];
  async logout() {
    await this.auth.logout();
    await this.router.navigate(['/auth/login']);
  }
}
