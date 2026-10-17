import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Api, Area, errorMessage, User } from '@lifequest/data-access';
import { AuthStore } from '@lifequest/auth';
import { Preferences } from '@lifequest/utilities';
import { ErrorState, Icon, Logo, Progress, Skeleton } from '@lifequest/ui';
import { applyServerValidation, FormField } from '@lifequest/forms';
@Component({
  selector: 'lq-onboarding',
  imports: [ReactiveFormsModule, ErrorState, Icon, Logo, Progress, Skeleton, FormField],
  templateUrl: './onboarding.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingPage {
  private readonly api = inject(Api);
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  readonly i18n = inject(Preferences);
  readonly areas = this.api.resource<Area[]>('life-areas');
  readonly selected = signal<string[]>([]);
  readonly step = signal(0);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly form = this.fb.nonNullable.group({
    goal: [''],
    habit: [''],
    preferredRoutine: ['morning'],
    profileVisibility: ['PRIVATE'],
  });
  readonly steps = [
    {
      title: 'What would you like to improve?',
      ar: 'ما الذي تريد تحسينه؟',
      text: 'Choose one part of life to begin with. You can add or change areas later.',
      textAr: 'اختر جانباً واحداً من حياتك لتبدأ به. يمكنك إضافة مجالات أخرى أو تغييرها لاحقاً.',
      icon: 'heart',
    },
    {
      title: 'What matters most right now?',
      ar: 'ما الأهم بالنسبة لك الآن؟',
      text: 'A direction or one small repeated action is enough. Both can wait until later.',
      textAr: 'يكفي أن تختار اتجاهاً أو خطوة صغيرة تكررها. يمكنك تركهما إلى وقت لاحق أيضاً.',
      icon: 'target',
    },
    {
      title: 'When does a small step fit?',
      ar: 'متى تناسبك خطوة صغيرة؟',
      text: 'Choose a time that usually works. You can change it whenever life changes.',
      textAr: 'اختر وقتاً يناسبك عادةً. يمكنك تغييره متى تغيّرت ظروفك.',
      icon: 'sun',
    },
  ];
  readonly previousStep = (step: number) => step - 1;
  toggle(id: string) {
    this.selected.update((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  }
  skipDetails() {
    this.form.patchValue({ goal: '', habit: '' });
    this.step.set(2);
  }
  async next() {
    if (this.busy() || !this.selected().length) return;
    this.error.set('');
    if (this.step() < this.steps.length - 1) {
      this.step.update((step) => step + 1);
      return;
    }
    this.busy.set(true);
    try {
      const values = this.form.getRawValue();
      await this.api.post('onboarding', {
        areaIds: this.selected(),
        ...values,
        goal: values.goal.trim() || undefined,
        habit: values.habit.trim() || undefined,
      });
      const user = await this.api.get<User>('auth/me');
      this.auth.setUser(user);
      await this.router.navigate(['/today']);
    } catch (error) {
      applyServerValidation(this.form, error);
      this.error.set(errorMessage(error));
    } finally {
      this.busy.set(false);
    }
  }
}
