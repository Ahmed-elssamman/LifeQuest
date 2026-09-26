import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { Api, errorMessage, Toasts } from '@lifequest/data-access';
import { AuthStore } from '@lifequest/auth';
import { Preferences } from '@lifequest/utilities';
import { Icon } from '@lifequest/ui';
import { applyServerValidation, FormField } from '@lifequest/forms';
@Component({
  selector: 'lq-security-settings',
  imports: [DatePipe, ReactiveFormsModule, DialogModule, Icon, FormField],
  templateUrl: './security.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecuritySettings {
  private readonly api = inject(Api);
  private readonly fb = inject(FormBuilder);
  private readonly toasts = inject(Toasts);
  private readonly router = inject(Router);
  readonly auth = inject(AuthStore);
  readonly i18n = inject(Preferences);
  readonly capabilities = this.api.resource<{ emailDelivery: boolean }>('auth/capabilities');
  readonly sessions =
    this.api.resource<{ id: string; createdAt: string; expiresAt: string }[]>('account/sessions');
  readonly deleting = signal(false);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly form = this.fb.nonNullable.group({
    password: ['', Validators.required],
    confirmation: ['', Validators.pattern(/^DELETE$/)],
  });
  async export() {
    this.busy.set(true);
    try {
      const data = await this.api.post('account/export');
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
      );
      const a = document.createElement('a');
      a.href = url;
      a.download = 'lifequest-my-journey.json';
      a.click();
      URL.revokeObjectURL(url);
      this.toasts.success(
        this.i18n.t('Your journey, ready to take with you.', 'رحلتك جاهزة لتأخذها معك.'),
      );
    } catch (error) {
      this.toasts.error(error);
    } finally {
      this.busy.set(false);
    }
  }
  async logoutAll() {
    await this.api.post('auth/logout-all');
    this.auth.user.set(null);
    await this.router.navigate(['/auth/login']);
  }
  async verify() {
    try {
      await this.api.post('auth/resend-verification');
      this.toasts.success(
        this.i18n.t('Check your email for the verification link.', 'تحقق من بريدك لرابط التأكيد.'),
      );
    } catch (error) {
      this.toasts.error(error);
    }
  }
  async remove() {
    if (this.form.invalid) return;
    this.busy.set(true);
    try {
      await this.api.post('account/delete', this.form.getRawValue());
      this.auth.user.set(null);
      await this.router.navigate(['/']);
    } catch (error) {
      applyServerValidation(this.form, error);
      this.error.set(errorMessage(error));
    } finally {
      this.busy.set(false);
    }
  }
}
