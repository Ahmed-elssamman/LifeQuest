import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DatePipe, KeyValuePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { Api, Toasts } from '@lifequest/data-access';
import { AuthStore } from '@lifequest/auth';
import { Preferences } from '@lifequest/utilities';
import { ErrorState, Icon, PageHeader, Skeleton } from '@lifequest/ui';
import { AdminUser } from '../../models';
@Component({
  selector: 'lq-admin-user-detail',
  imports: [RouterLink, DatePipe, KeyValuePipe, PageHeader, ErrorState, Skeleton, Icon],
  template: `<lq-page-header
      [eyebrow]="i18n.t('PRIVACY-RESPECTING SUPPORT', 'دعم يحترم الخصوصية')"
      [title]="
        resource.data()?.profile?.displayName ?? i18n.t('An explorer’s account', 'حساب مستكشف')
      "
      [description]="
        i18n.t(
          'Account access and aggregate activity. Private reflections and habit details are not included.',
          'صلاحيات الحساب والنشاط الإجمالي. لا تشمل التأملات الخاصة وتفاصيل العادات.'
        )
      "
      ><a routerLink="/users" class="btn btn-secondary"
        ><lq-icon name="arrow-left" [size]="16" />{{ i18n.t('All people', 'كل المستخدمين') }}</a
      ></lq-page-header
    >
    @if (resource.loading() && !resource.data()) {
      <lq-skeleton />
    } @else if (resource.error()) {
      <lq-error [message]="resource.error()" (retry)="resource.load()" />
    } @else if (resource.data(); as user) {
      <section class="card mb-6 p-6">
        <div class="flex flex-wrap items-center justify-between gap-5">
          <div>
            <p class="text-sm font-semibold">{{ user.email }}</p>
            <p class="mt-2 text-xs text-muted">
              {{ i18n.t('Joined', 'انضم') }} {{ user.createdAt | date: 'longDate' }} ·
              {{ user.profile.timezone }}
            </p>
            <span class="badge mt-3 bg-brand-soft text-brand"
              >{{ i18n.label(user.role) }} · {{ i18n.label(user.status) }}</span
            >
          </div>
          @if (['SUPER_ADMIN', 'ADMIN'].includes(auth.user()?.role ?? '')) {
            <button class="btn btn-secondary text-xs" (click)="changeStatus(user)">
              {{
                user.status === 'ACTIVE'
                  ? i18n.t('Suspend account', 'تعليق الحساب')
                  : i18n.t('Reactivate account', 'تفعيل الحساب')
              }}
            </button>
          }
        </div>
        @if (auth.user()?.role === 'SUPER_ADMIN') {
          <label class="field-label mt-6" for="staff-role">{{
            i18n.t('Account role', 'دور الحساب')
          }}</label
          ><select
            id="staff-role"
            #role
            class="field max-w-sm"
            [value]="user.role"
            (change)="changeRole(user, role.value)"
          >
            @for (item of roles; track item) {
              <option [value]="item">{{ item.replaceAll('_', ' ') }}</option>
            }
          </select>
        }
      </section>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        @for (item of user._count | keyvalue; track item.key) {
          <div class="card p-5">
            <p class="eyebrow">{{ item.key }}</p>
            <p class="mt-3 text-3xl font-semibold">{{ item.value }}</p>
          </div>
        }
      </div>
    }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUserDetailPage {
  private readonly api = inject(Api);
  private readonly route = inject(ActivatedRoute);
  private readonly toasts = inject(Toasts);
  private readonly confirm = inject(ConfirmationService);
  readonly auth = inject(AuthStore);
  readonly i18n = inject(Preferences);
  readonly resource = this.api.resource<AdminUser>(
    `admin/users/${this.route.snapshot.paramMap.get('id')}`,
  );
  readonly roles = [
    'USER',
    'SUPER_ADMIN',
    'ADMIN',
    'MODERATOR',
    'SUPPORT',
    'CONTENT_MANAGER',
    'ANALYST',
  ];
  changeStatus(user: AdminUser) {
    this.confirm.confirm({
      header: this.i18n.t('Update account access', 'تحديث وصول الحساب'),
      message: this.i18n.t(
        'This action will end existing sessions and be recorded in the audit trail.',
        'سينهي هذا الإجراء الجلسات الحالية ويُسجل في سجل التدقيق.',
      ),
      accept: () =>
        void this.update(user.id, { status: user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' }),
    });
  }
  changeRole(user: AdminUser, role: string) {
    this.confirm.confirm({
      header: this.i18n.t('Change account role', 'تغيير دور الحساب'),
      message: this.i18n.t(
        `Assign ${role.replaceAll('_', ' ')} access? This changes permissions.`,
        `تعيين صلاحية ${role}؟ سيغير هذا الأذونات.`,
      ),
      accept: () => void this.update(user.id, { role }),
    });
  }
  async update(id: string, input: unknown) {
    try {
      await this.api.patch(`admin/users/${id}`, input);
      this.toasts.success(this.i18n.t('Access updated and audited.', 'تم تحديث الوصول وتسجيله.'));
      await this.resource.load();
    } catch (error) {
      this.toasts.error(error);
    }
  }
}
