import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { Api, Page } from '@lifequest/data-access';
import { Preferences } from '@lifequest/utilities';
import { AccessibleTable, ErrorState, PageHeader, Pagination, Skeleton } from '@lifequest/ui';
import { Audit } from '../../models';
@Component({
  selector: 'lq-admin-audit',
  imports: [DatePipe, TableModule, AccessibleTable, PageHeader, ErrorState, Skeleton, Pagination],
  template: `<lq-page-header
      [eyebrow]="i18n.t('ACCOUNTABILITY BY DESIGN', 'المساءلة أساس التصميم')"
      [title]="i18n.t('A history that stays honest.', 'سجل يحافظ على الأمانة.')"
      [description]="
        i18n.t(
          'Sensitive actions are recorded here permanently. This history cannot be silently edited.',
          'تُسجل الإجراءات الحساسة هنا بشكل دائم. لا يمكن تعديل هذا التاريخ بصمت.'
        )
      "
    />
    @if (resource.loading() && !resource.data()) {
      <lq-skeleton />
    } @else if (resource.error()) {
      <lq-error [message]="resource.error()" (retry)="resource.load()" />
    } @else if (resource.data(); as data) {
      <div class="card overflow-hidden">
        <p-table
          [lqTableLabel]="i18n.t('Scrollable records', 'سجلات قابلة للتمرير')"
          [value]="data.items"
          [scrollable]="true"
          [tableStyle]="{ 'min-width': '42rem' }"
          ><ng-template #header
            ><tr>
              <th>{{ i18n.t('When', 'التوقيت') }}</th>
              <th>{{ i18n.t('Action', 'الإجراء') }}</th>
              <th>{{ i18n.t('Record', 'السجل') }}</th>
              <th>{{ i18n.t('Actor', 'المنفذ') }}</th>
            </tr></ng-template
          ><ng-template #body let-item
            ><tr>
              <td class="text-xs text-muted">{{ item.createdAt | date: 'MMM d, h:mm:ss a' }}</td>
              <td>
                <span class="badge bg-brand-soft text-brand">{{
                  item.action.replaceAll('_', ' ')
                }}</span>
              </td>
              <td>
                <span class="text-xs">{{ item.entity }}</span
                ><span class="mt-1 block max-w-40 truncate text-[10px] text-muted">{{
                  item.entityId
                }}</span>
              </td>
              <td class="max-w-40 truncate text-[10px] text-muted">
                {{ item.actorId || 'System' }}
              </td>
            </tr></ng-template
          ><ng-template #emptymessage
            ><tr>
              <td colspan="4" class="!p-10 text-center text-sm text-muted">
                {{
                  i18n.t(
                    'Sensitive actions will appear here as the product is managed.',
                    'ستظهر الإجراءات الحساسة هنا مع إدارة المنتج.'
                  )
                }}
              </td>
            </tr></ng-template
          ></p-table
        >
      </div>
      <lq-pagination [page]="data.page" [total]="data.total" (change)="page($event)" />
    }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAuditPage {
  private readonly api = inject(Api);
  readonly i18n = inject(Preferences);
  readonly resource = this.api.resource<Page<Audit>>('admin/audit-logs');
  page(page: number) {
    void this.resource.load(`admin/audit-logs?page=${page}`);
  }
}
