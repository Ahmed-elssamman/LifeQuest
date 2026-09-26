import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Api, errorMessage, Toasts } from '@lifequest/data-access';
import { Preferences } from '@lifequest/utilities';
import { Icon } from '@lifequest/ui';
import { applyServerValidation, FormField } from '@lifequest/forms';
@Component({
  selector: 'lq-check-in',
  imports: [ReactiveFormsModule, Icon, FormField],
  templateUrl: './check-in.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckInForm {
  readonly done = input(false);
  readonly saved = output<void>();
  readonly i18n = inject(Preferences);
  private readonly api = inject(Api);
  private readonly toasts = inject(Toasts);
  private readonly fb = inject(FormBuilder);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly success = signal(false);
  readonly expanded = signal(false);
  readonly form = this.fb.nonNullable.group({
    mood: [3],
    energy: [3],
    majorWin: [''],
    difficulty: [''],
    reflection: [''],
    recoveryIntention: [''],
  });
  readonly moods = [
    { value: 1, en: 'Heavy', ar: 'ثقيل', face: '◔' },
    { value: 2, en: 'Low', ar: 'منخفض', face: '◑' },
    { value: 3, en: 'Okay', ar: 'جيد', face: '◕' },
    { value: 4, en: 'Good', ar: 'سعيد', face: '☀' },
    { value: 5, en: 'Bright', ar: 'مشرق', face: '✦' },
  ];
  async save() {
    this.busy.set(true);
    this.error.set('');
    try {
      const result = await this.api.post<{ awarded: number }>('check-ins', this.form.getRawValue());
      this.success.set(true);
      this.toasts.success(
        this.i18n.t('Thank you for showing up for yourself.', 'شكراً لاهتمامك بنفسك.'),
        result.awarded ? `+${result.awarded} XP` : undefined,
      );
      this.saved.emit();
    } catch (error) {
      applyServerValidation(this.form, error);
      this.error.set(errorMessage(error));
    } finally {
      this.busy.set(false);
    }
  }
}
