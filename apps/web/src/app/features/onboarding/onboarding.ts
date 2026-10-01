import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Api, Area, errorMessage, User } from '@lifequest/data-access';
import { AuthStore } from '@lifequest/auth';
import { Preferences } from '@lifequest/utilities';
import { Icon, Logo, Progress } from '@lifequest/ui';
import { applyServerValidation, FormField } from '@lifequest/forms';
@Component({
  selector: 'lq-onboarding',
  imports: [ReactiveFormsModule, Icon, Logo, Progress, FormField],
  templateUrl: './onboarding.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingPage {
  private readonly api = inject(Api);
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthStore);
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
      title: 'Let’s make this your own.',
      ar: 'لنجعلها رحلتك الخاصة.',
      text: 'A balanced life looks different for everyone. A few small choices will help us find your starting point.',
      textAr: 'الحياة المتوازنة تختلف من شخص لآخر. اختيارات صغيرة تساعدنا على إيجاد نقطة بدايتك.',
      icon: 'compass',
    },
    {
      title: 'What matters to you?',
      ar: 'ما الذي يهمك؟',
      text: 'Choose the parts of life you would like to nurture. You can always change these later.',
      textAr: 'اختر جوانب الحياة التي تود الاهتمام بها. يمكنك تغييرها لاحقاً.',
      icon: 'heart',
    },
    {
      title: 'A direction worth taking.',
      ar: 'اتجاه يستحق الرحلة.',
      text: 'What is one meaningful thing you would like to work toward?',
      textAr: 'ما الشيء الواحد ذو المعنى الذي تود السعي نحوه؟',
      icon: 'target',
    },
    {
      title: 'Start wonderfully small.',
      ar: 'ابدأ صغيراً بشكل رائع.',
      text: 'Choose a habit that takes just a few minutes. Small is a great place to begin.',
      textAr: 'اختر عادة تستغرق دقائق قليلة. الصغر بداية رائعة.',
      icon: 'sprout',
    },
    {
      title: 'Find your natural rhythm.',
      ar: 'اعثر على إيقاعك الطبيعي.',
      text: 'When do you usually have a little space for yourself?',
      textAr: 'متى تجد عادة مساحة صغيرة لنفسك؟',
      icon: 'sun',
    },
    {
      title: 'Your journey. Your boundaries.',
      ar: 'رحلتك. حدودك.',
      text: 'Your reflections and habit details stay private. You choose what friends can see.',
      textAr: 'تأملاتك وتفاصيل عاداتك تظل خاصة. أنت تختار ما يراه أصدقاؤك.',
      icon: 'shield',
    },
    {
      title: 'You’re ready for your first step.',
      ar: 'أنت جاهز لخطوتك الأولى.',
      text: 'No perfect plans needed. Just a little intention and room to grow.',
      textAr: 'لا حاجة لخطط مثالية. فقط قليل من النية ومساحة للنمو.',
      icon: 'sparkles',
    },
  ];
  readonly previousStep = (step: number) => step - 1;
  toggle(id: string) {
    this.selected.update((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  }
  async next() {
    if (this.step() < 6) {
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
      await this.router.navigate(['/dashboard']);
    } catch (error) {
      applyServerValidation(this.form, error);
      this.error.set(errorMessage(error));
    } finally {
      this.busy.set(false);
    }
  }
}
