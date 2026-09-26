import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Api } from '@lifequest/data-access';
import { ErrorState, Progress, Skeleton } from '@lifequest/ui';
import { Preferences } from '@lifequest/utilities';
interface StatusCount {
  status: string;
  _count: number;
}
interface Insights {
  periodDays: number;
  planning: { kind: string; statuses: StatusCount[] }[];
  habits: StatusCount[];
  experiments: number;
  habitCompletionRate: number;
  scheduledActions: number;
  completedScheduledActions: number;
}
@Component({
  selector: 'lq-planning-insights',
  imports: [ErrorState, Progress, Skeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@if (resource.loading() && !resource.data()) {
      <lq-skeleton />
    } @else if (resource.error()) {
      <lq-error [message]="resource.error()" (retry)="resource.load()" />
    } @else if (resource.data(); as data) {
      <section class="card mt-6 p-6">
        <h2 class="text-lg font-semibold">
          {{ i18n.t('Small actions, healthier routines', 'خطوات صغيرة وروتين أفضل') }}
        </h2>
        <p class="my-4 text-xs leading-6 text-muted">
          {{
            i18n.t(
              'Completion across current active schedules in the last 30 days. A pause is a useful adjustment, not a failure.',
              'الإنجاز وفق الجداول النشطة الحالية خلال 30 يوماً. التوقف تعديل مفيد وليس فشلاً.'
            )
          }}
        </p>
        <div class="mb-3 flex justify-between text-sm">
          <span>{{ i18n.t('Scheduled habit adherence', 'الالتزام بالعادات المجدولة') }}</span
          ><strong>{{ data.habitCompletionRate }}%</strong>
        </div>
        <lq-progress
          [value]="data.habitCompletionRate"
          [label]="i18n.t('Habit adherence', 'الالتزام بالعادات')"
        />
        <div class="mt-5 flex flex-wrap gap-3">
          @for (item of data.habits; track item.status) {
            <span class="badge bg-brand-soft text-brand"
              >{{ status(item.status) }} · {{ item._count }}</span
            >
          }
        </div>
        <p class="mt-5 text-xs text-muted">
          {{ data.experiments }}
          {{
            i18n.t(
              'Habit Lab experiments in the last 30 days',
              'تجربة في مختبر العادات خلال 30 يوماً'
            )
          }}
        </p>
      </section>
      <section class="mt-6">
        <h2 class="mb-4 text-lg font-semibold">
          {{ i18n.t('From intentions to outcomes', 'من النوايا إلى النتائج') }}
        </h2>
        <div class="grid gap-4 md:grid-cols-3">
          @for (group of data.planning; track group.kind) {
            <article class="card p-5">
              <h3 class="mb-4 text-sm font-semibold">
                {{
                  i18n.t(
                    group.kind,
                    group.kind === 'goals'
                      ? 'الأهداف'
                      : group.kind === 'projects'
                        ? 'المشاريع'
                        : 'المهام'
                  )
                }}
              </h3>
              @for (item of group.statuses; track item.status) {
                <div class="flex min-h-10 justify-between gap-3 text-xs">
                  <span class="text-muted">{{ status(item.status) }}</span
                  ><strong>{{ item._count }}</strong>
                </div>
              } @empty {
                <p class="text-xs leading-6 text-muted">
                  {{ i18n.t('New intentions will appear here.', 'ستظهر النوايا الجديدة هنا.') }}
                </p>
              }
            </article>
          }
        </div>
      </section>
    }`,
})
export class PlanningInsights {
  readonly i18n = inject(Preferences);
  readonly resource = inject(Api).resource<Insights>('admin/insights');
  status(value: string) {
    return this.i18n.label(value);
  }
}
