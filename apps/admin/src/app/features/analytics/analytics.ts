import { PlanningInsights } from './planning-insights';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Api } from '@lifequest/data-access';
import { Preferences } from '@lifequest/utilities';
import { ErrorState, PageHeader, Skeleton, StatCard } from '@lifequest/ui';
import { Overview } from '../../models';
@Component({
  selector: 'lq-admin-analytics',
  imports: [PlanningInsights, PageHeader, ErrorState, Skeleton, StatCard],
  template: `<lq-page-header
      [eyebrow]="i18n.t('USEFUL SIGNALS, RESPECTFUL DATA', 'إشارات مفيدة، وبيانات محترمة')"
      [title]="i18n.t('Understand what helps people grow.', 'افهم ما يساعد الناس على النمو.')"
      [description]="
        i18n.t(
          'Aggregate product activity. No journals, moods, or private habit details.',
          'نشاط إجمالي للمنتج. بدون يوميات أو مزاج أو تفاصيل عادات خاصة.'
        )
      "
    />
    @if (resource.loading() && !resource.data()) {
      <lq-skeleton />
    } @else if (resource.error()) {
      <lq-error [message]="resource.error()" (retry)="resource.load()" />
    } @else if (resource.data(); as data) {
      <div class="mb-6 grid gap-4 sm:grid-cols-3">
        <lq-stat
          [label]="i18n.t('Active in 30 days', 'نشط خلال 30 يوماً')"
          [value]="data.activeUsers"
          icon="users"
        /><lq-stat
          [label]="i18n.t('Returning people', 'مستخدمون عائدون')"
          [value]="data.returningUsers"
          icon="refresh"
        /><lq-stat
          [label]="i18n.t('Habit actions in 30 days', 'خطوات عادات خلال 30 يوماً')"
          [value]="data.habitCompletions"
          icon="sprout"
        />
      </div>
      <section class="card p-6">
        <h2 class="mb-6 text-lg font-semibold">
          {{ i18n.t('Meaningful product events', 'أحداث المنتج ذات المعنى') }}
        </h2>
        <div class="space-y-5">
          @for (event of data.events; track event.name) {
            <div>
              <div class="mb-2 flex justify-between text-xs">
                <span>{{ i18n.label(event.name) }}</span
                ><span class="font-semibold text-brand">{{ event._count }}</span>
              </div>
              <div class="h-2 rounded-full bg-line">
                <div
                  class="h-2 origin-left rounded-full bg-brand"
                  [style.transform]="'scaleX(' + event._count / max(data) + ')'"
                ></div>
              </div>
            </div>
          } @empty {
            <p class="text-xs text-muted">
              {{
                i18n.t(
                  'Events will appear as people use LifeQuest.',
                  'ستظهر الأحداث مع استخدام رحلة التوازن.'
                )
              }}
            </p>
          }
        </div>
        <p class="mt-6 text-[10px] leading-6 text-muted">
          {{
            i18n.t(
              'Counts are aggregated from internal events. No third-party behavioral tracking is used.',
              'تُجمع الأعداد من الأحداث الداخلية. لا يُستخدم تتبع سلوكي من طرف ثالث.'
            )
          }}
        </p>
      </section>
    }
    <section
      id="planning-insights"
      [attr.aria-label]="i18n.t('Planning insights', 'إحصاءات التخطيط')"
    >
      @defer (on viewport) {
        <lq-planning-insights />
      } @placeholder {
        <div class="mt-6"><lq-skeleton /></div>
      }
    </section>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAnalyticsPage {
  private readonly api = inject(Api);
  readonly i18n = inject(Preferences);
  readonly resource = this.api.resource<Overview>('admin/overview');
  max(data: Overview) {
    return Math.max(1, ...data.events.map((item) => item._count));
  }
}
