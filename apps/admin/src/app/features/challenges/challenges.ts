import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { Api, Page, Toasts } from '@lifequest/data-access';
import { AuthStore } from '@lifequest/auth';
import { Preferences } from '@lifequest/utilities';
import { EmptyState, ErrorState, Icon, PageHeader, Pagination, Skeleton } from '@lifequest/ui';
import { AdminChallenge } from '../../models';
@Component({
  selector: 'lq-admin-challenges',
  imports: [
    DatePipe,
    FormsModule,
    DialogModule,
    PageHeader,
    EmptyState,
    ErrorState,
    Skeleton,
    Icon,
    Pagination,
  ],
  template: `<lq-page-header
      [eyebrow]="i18n.t('FAIR PLAY. THOUGHTFUL MODERATION.', 'عدالة. وإشراف مدروس.')"
      [title]="i18n.t('Keep shared journeys healthy.', 'حافظ على رحلات مشتركة صحية.')"
      [description]="
        i18n.t(
          'Inspect lifecycle and participation without exposing private behavioral details.',
          'راجع دورة التحدي والمشاركة دون كشف تفاصيل السلوك الخاصة.'
        )
      "
    />
    <form class="mb-6 flex flex-wrap items-end gap-3" (ngSubmit)="page(1)">
      <div class="min-w-0 flex-1">
        <label class="field-label" for="challenge-search">{{
          i18n.t('Find a challenge', 'ابحث عن تحدٍ')
        }}</label>
        <input
          id="challenge-search"
          name="search"
          class="field"
          [ngModel]="search()"
          (ngModelChange)="search.set($event)"
          maxlength="160"
        />
      </div>
      <div>
        <label class="field-label" for="challenge-status">{{ i18n.t('Status', 'الحالة') }}</label>
        <select
          id="challenge-status"
          name="status"
          class="field"
          [ngModel]="status()"
          (ngModelChange)="status.set($event); page(1)"
        >
          <option value="">{{ i18n.t('All stages', 'كل المراحل') }}</option>
          @for (stage of statuses; track stage) {
            <option [value]="stage">{{ i18n.label(stage) }}</option>
          }
        </select>
      </div>
      <button class="btn btn-secondary" type="submit">{{ i18n.t('Search', 'بحث') }}</button>
    </form>
    @if (resource.loading() && !resource.data()) {
      <lq-skeleton />
    } @else if (resource.error()) {
      <lq-error [message]="resource.error()" (retry)="resource.load()" />
    } @else {
      <div class="grid gap-5 md:grid-cols-2">
        @for (item of resource.data()?.items; track item.id) {
          <article class="card p-6">
            <div class="mb-4 flex justify-between">
              <span class="badge bg-brand-soft text-brand">{{ i18n.label(item.mode) }}</span
              ><span class="badge bg-canvas text-muted">{{ i18n.label(item.status) }}</span>
            </div>
            <h2 class="text-lg font-semibold">{{ item.title }}</h2>
            <p class="mt-3 text-xs text-muted">
              {{ item._count.participants }} {{ i18n.t('participants', 'مشاركين') }} ·
              {{ item.startDate | date: 'MMM d' }} – {{ item.endDate | date: 'MMM d' }}
            </p>
            @if (
              !['COMPLETED', 'CANCELLED'].includes(item.status) && auth.user()?.role !== 'ANALYST'
            ) {
              <button
                class="btn btn-secondary mt-5 w-full text-xs"
                (click)="selected.set(item); reason.set('')"
              >
                <lq-icon name="shield" [size]="15" />{{
                  i18n.t('Moderate challenge', 'الإشراف على التحدي')
                }}
              </button>
            }
          </article>
        } @empty {
          <lq-empty
            icon="swords"
            [title]="i18n.t('No shared journeys yet.', 'لا توجد رحلات مشتركة بعد.')"
            [description]="
              i18n.t(
                'Challenges will appear as people connect.',
                'ستظهر التحديات مع تواصل المستخدمين.'
              )
            "
          />
        }
      </div>
    }
    @if (resource.data(); as data) {
      <lq-pagination
        [page]="data.page"
        [total]="data.total"
        [limit]="data.limit"
        (change)="page($event)"
      />
    }
    <p-dialog
      [closeAriaLabel]="i18n.t('Close', 'إغلاق')"
      [header]="i18n.t('Cancel with a clear reason', 'إلغاء بسبب واضح')"
      [visible]="!!selected()"
      (visibleChange)="!$event && selected.set(null)"
      [modal]="true"
      [style]="{ width: '32rem' }"
      ><p class="mb-4 text-xs leading-6 text-muted">
        {{
          i18n.t(
            'This stops the challenge for all participants. The reason is retained in the audit trail.',
            'يوقف هذا التحدي لكل المشاركين. يُحفظ السبب في سجل التدقيق.'
          )
        }}
      </p>
      <label class="field-label" for="moderation-reason">{{
        i18n.t('Reason (at least 10 characters)', 'السبب (10 أحرف على الأقل)')
      }}</label
      ><textarea
        id="moderation-reason"
        class="field"
        rows="4"
        [ngModel]="reason()"
        (ngModelChange)="reason.set($event)"
      ></textarea
      ><button
        class="btn btn-primary mt-5 w-full"
        [disabled]="busy() || reason().length < 10"
        (click)="cancel()"
      >
        {{ i18n.t('Cancel and record reason', 'إلغاء وتسجيل السبب') }}
      </button></p-dialog
    >`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminChallengesPage {
  private readonly api = inject(Api);
  private readonly toasts = inject(Toasts);
  readonly i18n = inject(Preferences);
  readonly auth = inject(AuthStore);
  readonly resource = this.api.resource<Page<AdminChallenge>>('admin/challenges');
  readonly search = signal('');
  readonly status = signal('');
  readonly statuses = [
    'DRAFT',
    'INVITED',
    'ACCEPTED',
    'SCHEDULED',
    'ACTIVE',
    'COMPLETED',
    'CANCELLED',
  ];
  readonly selected = signal<AdminChallenge | null>(null);
  readonly reason = signal('');
  readonly busy = signal(false);
  page(page: number) {
    const query = new URLSearchParams({ page: String(page), search: this.search() });
    if (this.status()) query.set('status', this.status());
    void this.resource.load('admin/challenges?' + query);
  }
  async cancel() {
    const selected = this.selected();
    if (!selected) return;
    this.busy.set(true);
    try {
      await this.api.post(`admin/challenges/${selected.id}/cancel`, { reason: this.reason() });
      this.selected.set(null);
      this.toasts.success(this.i18n.t('Moderation recorded.', 'تم تسجيل الإشراف.'));
      await this.resource.load();
    } catch (error) {
      this.toasts.error(error);
    } finally {
      this.busy.set(false);
    }
  }
}
