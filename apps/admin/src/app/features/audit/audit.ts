import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Api, Page } from '@lifequest/data-access';
import { LocalizedDatePipe, Preferences } from '@lifequest/utilities';
import { AccessibleTable, ErrorState, PageHeader, Pagination, Skeleton } from '@lifequest/ui';
import { Audit } from '../../models';
const actionLabels: Record<string, [string, string]> = {
  REWARD_CREATED: ['Reward created', 'إنشاء مكافأة'],
  REWARD_UPDATED: ['Reward updated', 'تحديث مكافأة'],
  REWARD_REDEEMED: ['Reward redeemed', 'استبدال مكافأة'],
  REWARD_REFUNDED: ['Reward returned', 'إرجاع مكافأة'],
  REWARD_FEEDBACK_RECORDED: ['Reward feedback recorded', 'تسجيل تقييم مكافأة'],
  ACHIEVEMENT_CREATED: ['Achievement created', 'إنشاء إنجاز'],
  ACHIEVEMENT_UPDATED: ['Achievement updated', 'تحديث إنجاز'],
  HELP_CREATED: ['Help article created', 'إنشاء مقال مساعدة'],
  HELP_UPDATED: ['Help article updated', 'تحديث مقال مساعدة'],
  ANNOUNCEMENT_CREATED: ['Announcement created', 'إنشاء إعلان'],
  ANNOUNCEMENT_UPDATED: ['Announcement updated', 'تحديث إعلان'],
  SETTING_UPDATED: ['Setting updated', 'تحديث إعداد'],
  QUEST_TEMPLATE_CREATED: ['Quest template created', 'إنشاء نموذج مهمة'],
  QUEST_TEMPLATE_UPDATED: ['Quest template updated', 'تحديث نموذج مهمة'],
  CHALLENGE_MODERATED: ['Challenge moderated', 'الإشراف على تحدٍ'],
  CHALLENGE_CANCELLED: ['Challenge cancelled', 'إلغاء تحدٍ'],
  USER_ROLE_CHANGED: ['User role changed', 'تغيير دور مستخدم'],
  USER_STATUS_CHANGED: ['User status changed', 'تغيير حالة مستخدم'],
  FEEDBACK_UPDATED: ['Feedback updated', 'تحديث ملاحظة'],
  DATA_EXPORTED: ['Account data exported', 'تصدير بيانات الحساب'],
  ACCOUNT_DELETED: ['Account deleted', 'حذف حساب'],
};
const entityLabels: Record<string, [string, string]> = {
  Reward: ['Reward', 'مكافأة'],
  RewardRedemption: ['Reward redemption', 'استبدال مكافأة'],
  Achievement: ['Achievement', 'إنجاز'],
  HelpArticle: ['Help article', 'مقال مساعدة'],
  Announcement: ['Announcement', 'إعلان'],
  SystemSetting: ['System setting', 'إعداد النظام'],
  QuestTemplate: ['Quest template', 'نموذج مهمة'],
  Challenge: ['Challenge', 'تحدٍ'],
  User: ['User', 'مستخدم'],
  Feedback: ['Feedback', 'ملاحظة'],
};
@Component({
  selector: 'lq-admin-audit',
  imports: [
    LocalizedDatePipe,
    TableModule,
    AccessibleTable,
    PageHeader,
    ErrorState,
    Skeleton,
    Pagination,
  ],
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
                <span class="badge bg-brand-soft text-brand">{{ actionLabel(item.action) }}</span>
              </td>
              <td>
                <span class="text-xs">{{ entityLabel(item.entity) }}</span
                ><span class="mt-1 block max-w-40 truncate text-[10px] text-muted">{{
                  item.entityId
                }}</span>
              </td>
              <td class="max-w-40 truncate text-[10px] text-muted">
                {{ item.actorId || i18n.t('System', 'النظام') }}
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
  actionLabel(value: string) {
    const label = actionLabels[value];
    return label
      ? this.i18n.t(...label)
      : this.i18n.t(value.replaceAll('_', ' ').toLowerCase(), 'إجراء آخر');
  }
  entityLabel(value: string) {
    const label = entityLabels[value];
    return label ? this.i18n.t(...label) : this.i18n.t(value, 'سجل آخر');
  }
  page(page: number) {
    void this.resource.load(`admin/audit-logs?page=${page}`);
  }
}
