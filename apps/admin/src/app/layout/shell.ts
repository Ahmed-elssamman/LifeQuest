import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { AuthStore } from '@lifequest/auth';
import { Preferences } from '@lifequest/utilities';
import { Icon, Logo } from '@lifequest/ui';
@Component({
  selector: 'lq-admin-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, NgTemplateOutlet, DrawerModule, Icon, Logo],
  templateUrl: './shell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminShell {
  readonly auth = inject(AuthStore);
  readonly i18n = inject(Preferences);
  private readonly router = inject(Router);
  readonly open = signal(false);
  readonly groups = [
    {
      title: 'WORKSPACE',
      ar: 'مساحة العمل',
      items: [
        { path: 'overview', title: 'Overview', ar: 'نظرة عامة', icon: 'home', roles: [] },
        {
          path: 'users',
          title: 'People',
          ar: 'المستخدمون',
          icon: 'users',
          roles: ['SUPER_ADMIN', 'ADMIN', 'SUPPORT'],
        },
        {
          path: 'analytics',
          title: 'Activity insights',
          ar: 'رؤى النشاط',
          icon: 'chart',
          roles: ['SUPER_ADMIN', 'ADMIN', 'ANALYST'],
        },
        {
          path: 'challenges',
          title: 'Challenges',
          ar: 'التحديات',
          icon: 'swords',
          roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'ANALYST'],
        },
        {
          path: 'feedback',
          title: 'Feedback inbox',
          ar: 'صندوق الملاحظات',
          icon: 'message',
          roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT'],
        },
      ],
    },
    {
      title: 'PRODUCT & CONTENT',
      ar: 'المنتج والمحتوى',
      items: [
        {
          path: 'quests',
          title: 'Weekly quests',
          ar: 'المهام الأسبوعية',
          icon: 'flag',
          roles: ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER'],
        },
        {
          path: 'content/rewards',
          title: 'Rewards',
          ar: 'المكافآت',
          icon: 'gift',
          roles: ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER'],
        },
        {
          path: 'content/achievements',
          title: 'Achievements',
          ar: 'الإنجازات',
          icon: 'award',
          roles: ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER'],
        },
        {
          path: 'content/help',
          title: 'Help content',
          ar: 'محتوى المساعدة',
          icon: 'help',
          roles: ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER'],
        },
        {
          path: 'content/announcements',
          title: 'Announcements',
          ar: 'الإعلانات',
          icon: 'bell',
          roles: ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER'],
        },
      ],
    },
    {
      title: 'OPERATIONS',
      ar: 'العمليات',
      items: [
        {
          path: 'audit-logs',
          title: 'Audit trail',
          ar: 'سجل التدقيق',
          icon: 'shield',
          roles: ['SUPER_ADMIN', 'ADMIN', 'ANALYST'],
        },
        { path: 'health', title: 'System health', ar: 'صحة النظام', icon: 'activity', roles: [] },
        {
          path: 'settings',
          title: 'Configuration',
          ar: 'الإعدادات',
          icon: 'settings',
          roles: ['SUPER_ADMIN', 'ADMIN'],
        },
      ],
    },
  ];
  allowed(roles: string[]) {
    return !roles.length || roles.includes(this.auth.user()?.role ?? '');
  }
  async logout() {
    await this.auth.logout();
    await this.router.navigate(['/auth/login']);
  }
}
