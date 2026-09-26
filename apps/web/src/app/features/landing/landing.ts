import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon, Logo } from '@lifequest/ui';
import { Preferences } from '@lifequest/utilities';
@Component({
  selector: 'lq-landing',
  imports: [RouterLink, Icon, Logo],
  templateUrl: './landing.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPage {
  readonly i18n = inject(Preferences);
  readonly pillars = [
    {
      icon: 'target',
      title: 'A direction that matters',
      ar: 'اتجاه يهمك',
      text: 'Turn meaningful goals into projects, tasks, and small daily actions.',
      textAr: 'حوّل أهدافك المهمة إلى مشروعات ومهام وخطوات يومية صغيرة.',
    },
    {
      icon: 'sprout',
      title: 'A rhythm that fits your life',
      ar: 'إيقاع يناسب حياتك',
      text: 'Build habits with room for busy days, tiny steps, and fresh starts.',
      textAr: 'ابنِ عادات تتسع للأيام المزدحمة والخطوات الصغيرة والبدايات الجديدة.',
    },
    {
      icon: 'users',
      title: 'A journey worth sharing',
      ar: 'رحلة تستحق المشاركة',
      text: 'Grow alongside friends with private, fair, and encouraging challenges.',
      textAr: 'تطور مع أصدقائك من خلال تحديات خاصة وعادلة ومشجعة.',
    },
  ];
}
