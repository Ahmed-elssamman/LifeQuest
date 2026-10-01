import { Pagination } from '@lifequest/ui';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService } from 'primeng/api';
import {
  Api,
  Page,
  errorMessage,
  Redemption,
  Reward,
  Toasts,
  XpSummary,
} from '@lifequest/data-access';
import { Preferences } from '@lifequest/utilities';
import { EmptyState, ErrorState, Icon, PageHeader, SectionTitle, Skeleton } from '@lifequest/ui';
import { applyServerValidation, FormField, DiscardChanges, UnsavedForm } from '@lifequest/forms';
@Component({
  selector: 'lq-rewards',
  imports: [
    Pagination,
    DatePipe,
    ReactiveFormsModule,
    DialogModule,
    PageHeader,
    EmptyState,
    ErrorState,
    Skeleton,
    Icon,
    SectionTitle,
    FormField,
    UnsavedForm,
  ],
  templateUrl: './rewards.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RewardsPage {
  private readonly api = inject(Api);
  private readonly fb = inject(FormBuilder);
  private readonly toasts = inject(Toasts);
  private readonly confirm = inject(ConfirmationService);
  readonly discard = inject(DiscardChanges);
  readonly i18n = inject(Preferences);
  readonly resource = this.api.resource<Page<Reward>>('rewards');
  readonly xp = this.api.resource<XpSummary>('xp');
  readonly history = this.api.resource<Page<Redemption>>('redemptions');
  readonly open = signal(false);
  readonly busy = signal('');
  readonly saving = signal(false);
  readonly error = signal('');
  private readonly keys = new Map<string, string>();
  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    cost: [150, [Validators.required, Validators.min(50)]],
    icon: ['gift'],
    category: ['personal'],
  });
  create() {
    this.form.reset({ cost: 150, icon: 'gift', category: 'personal' });
    this.error.set('');
    this.open.set(true);
  }
  page(page: number) {
    void this.resource.load(`rewards?page=${page}`);
  }
  historyPage(page: number) {
    void this.history.load(`redemptions?page=${page}`);
  }
  async save() {
    if (this.form.invalid) return;
    this.saving.set(true);
    try {
      await this.api.post('rewards', this.form.getRawValue());
      this.form.markAsPristine();
      this.open.set(false);
      this.toasts.success(
        this.i18n.t('Something good to look forward to.', 'شيء جميل تتطلع إليه.'),
      );
      await this.resource.load();
    } catch (error) {
      applyServerValidation(this.form, error);
      this.error.set(errorMessage(error));
    } finally {
      this.saving.set(false);
    }
  }
  confirmRedeem(reward: Reward) {
    this.confirm.confirm({
      header: this.i18n.t('You’ve earned a little joy.', 'استحققت قليلاً من الفرح.'),
      message: this.i18n.t(
        `Spend ${reward.cost} XP on ${reward.title}? You can undo this within five minutes.`,
        `استخدم ${reward.cost} نقطة مقابل ${reward.title}؟ يمكنك التراجع خلال خمس دقائق.`,
      ),
      acceptLabel: this.i18n.t('Enjoy this reward', 'استمتع بالمكافأة'),
      rejectLabel: this.i18n.t('Not yet', 'ليس الآن'),
      accept: () => void this.redeem(reward),
    });
  }
  async redeem(reward: Reward) {
    if (this.busy()) return;
    this.busy.set(reward.id);
    const key = this.keys.get(reward.id) ?? crypto.randomUUID();
    this.keys.set(reward.id, key);
    try {
      await this.api.post(`rewards/${reward.id}/redeem`, { idempotencyKey: key });
      this.keys.delete(reward.id);
      this.toasts.success(
        this.i18n.t('This one is for you. Enjoy.', 'هذه لك. استمتع.'),
        reward.title,
      );
      await Promise.all([this.xp.load(), this.history.load()]);
    } catch (error) {
      this.toasts.error(error);
    } finally {
      this.busy.set('');
    }
  }
  refundable(redemption: Redemption) {
    return !redemption.refundedAt && Date.now() - new Date(redemption.createdAt).getTime() < 300000;
  }
  async refund(id: string) {
    try {
      await this.api.post(`redemptions/${id}/refund`);
      this.toasts.success(this.i18n.t('XP returned to your balance.', 'عادت النقاط إلى رصيدك.'));
      await Promise.all([this.xp.load(), this.history.load()]);
    } catch (error) {
      this.toasts.error(error);
    }
  }
}
