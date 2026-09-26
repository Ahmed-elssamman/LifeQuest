import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Api } from '@lifequest/data-access';
import { Preferences } from '@lifequest/utilities';
import { ErrorState, Icon, PageHeader, Skeleton, StatCard } from '@lifequest/ui';
import { Health } from '../../models';
@Component({
  selector: 'lq-admin-health',
  imports: [DatePipe, PageHeader, ErrorState, Skeleton, Icon, StatCard],
  template: `<lq-page-header
      [eyebrow]="i18n.t('KEEP THE FOUNDATIONS HEALTHY', 'حافظ على أساس صحي')"
      [title]="i18n.t('A pulse on the system.', 'نبض النظام.')"
      [description]="
        i18n.t(
          'Live application and database connectivity checks.',
          'فحوص مباشرة للتطبيق واتصال قاعدة البيانات.'
        )
      "
      ><button class="btn btn-secondary" (click)="resource.load()">
        <lq-icon name="refresh" [size]="16" />{{ i18n.t('Check now', 'افحص الآن') }}
      </button></lq-page-header
    >
    @if (resource.loading() && !resource.data()) {
      <lq-skeleton />
    } @else if (resource.error()) {
      <lq-error [message]="resource.error()" (retry)="resource.load()" />
    } @else if (resource.data(); as data) {
      <section class="mb-6 flex items-center gap-4 rounded-2xl bg-mint p-7 text-mint-ink">
        <lq-icon name="circle-check" [size]="36" />
        <div>
          <h2 class="text-lg font-semibold">
            {{ i18n.t('Application is responding.', 'التطبيق يستجيب.') }}
          </h2>
          <p class="mt-2 text-xs">
            {{ i18n.t('Database connectivity verified at', 'تم التحقق من الاتصال في') }}
            {{ data.timestamp | date: 'h:mm:ss a' }}
          </p>
        </div>
      </section>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <lq-stat
          [label]="i18n.t('Database', 'قاعدة البيانات')"
          [value]="data.database"
          icon="activity"
        /><lq-stat
          [label]="i18n.t('Version', 'الإصدار')"
          [value]="data.version"
          icon="flag"
        /><lq-stat
          [label]="i18n.t('Environment', 'البيئة')"
          [value]="data.environment"
          icon="shield"
        /><lq-stat
          [label]="i18n.t('Uptime', 'وقت التشغيل')"
          [value]="data.uptime"
          suffix="s"
          icon="sun"
        />
      </div>
    }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminHealthPage {
  private readonly api = inject(Api);
  readonly i18n = inject(Preferences);
  readonly resource = this.api.resource<Health>('admin/health');
}
