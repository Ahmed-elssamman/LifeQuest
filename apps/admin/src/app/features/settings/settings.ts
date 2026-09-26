import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Api, Toasts } from '@lifequest/data-access';
import { Preferences } from '@lifequest/utilities';
import { PageHeader } from '@lifequest/ui';
import { FormField } from '@lifequest/forms';
@Component({
  selector: 'lq-admin-settings',
  imports: [ReactiveFormsModule, PageHeader, FormField],
  template: `<lq-page-header
      [eyebrow]="i18n.t('SMALL, DELIBERATE CONTROLS', 'ضوابط صغيرة ومدروسة')"
      [title]="i18n.t('Product configuration.', 'إعدادات المنتج.')"
      [description]="
        i18n.t(
          'Public support settings. Secrets belong in server environment configuration.',
          'إعدادات الدعم العامة. الأسرار مكانها إعدادات بيئة الخادم.'
        )
      "
    />
    <section class="card max-w-3xl p-6">
      <form [formGroup]="form" (ngSubmit)="save()">
        <lq-field id="system-key" [label]="i18n.t('Setting', 'الإعداد')"
          ><select id="system-key" class="field" formControlName="key">
            <option value="support_email">{{ i18n.t('Support email', 'بريد الدعم') }}</option>
            <option value="maintenance_message">
              {{ i18n.t('Maintenance message', 'رسالة الصيانة') }}
            </option>
            <option value="registration_notice">
              {{ i18n.t('Registration notice', 'إشعار التسجيل') }}
            </option>
          </select></lq-field
        ><lq-field id="system-value" [label]="i18n.t('Value', 'القيمة')">
          <textarea
            id="system-value"
            class="field"
            rows="3"
            formControlName="value"
          ></textarea></lq-field
        ><button class="btn btn-primary" type="submit" [disabled]="saving()">
          {{ i18n.t('Save configuration', 'حفظ الإعداد') }}
        </button>
      </form>
      <div class="mt-7 space-y-3 border-t border-line pt-5">
        @for (setting of resource.data(); track setting.key) {
          <button
            class="block w-full rounded-xl bg-canvas p-4 text-start"
            (click)="form.patchValue({ key: setting.key, value: setting.value })"
          >
            <p class="text-xs font-medium">{{ setting.description }}</p>
            <p class="mt-2 text-xs leading-6 text-muted">
              {{ setting.value || i18n.t('Not set', 'غير محدد') }}
            </p>
          </button>
        }
      </div>
    </section>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSettingsPage {
  private readonly api = inject(Api);
  private readonly fb = inject(FormBuilder);
  private readonly toasts = inject(Toasts);
  readonly i18n = inject(Preferences);
  readonly resource =
    this.api.resource<{ key: string; value: string; description: string }[]>('admin/settings');
  readonly saving = signal(false);
  readonly form = this.fb.nonNullable.group({ key: ['support_email'], value: [''] });
  async save() {
    this.saving.set(true);
    try {
      const input = this.form.getRawValue();
      await this.api.patch(`admin/settings/${input.key}`, { value: input.value });
      this.toasts.success(
        this.i18n.t('Configuration updated and audited.', 'تم تحديث الإعداد وتسجيله.'),
      );
      await this.resource.load();
    } catch (error) {
      this.toasts.error(error);
    } finally {
      this.saving.set(false);
    }
  }
}
