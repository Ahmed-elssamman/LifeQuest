import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Preferences } from '@lifequest/utilities';
import { Celebrations } from '@lifequest/data-access';
import { LevelCelebration } from '../../../../libs/ui/src/level-celebration';
import { RouterOutlet } from '@angular/router';
import { Overlays } from '../../../../libs/ui/src/overlays';
@Component({
  selector: 'lq-root',
  imports: [RouterOutlet, Overlays, LevelCelebration],
  template:
    '<router-outlet />@defer (on idle) { <lq-overlays /> } @defer (when celebrations.level()) { <lq-level-celebration /> }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  readonly celebrations = inject(Celebrations);
  private readonly preferences = inject(Preferences);
  private readonly document = inject(DOCUMENT);
  constructor() {
    effect(() => {
      const english = this.preferences.language() === 'en';
      this.document.title = english ? 'MIRHAL | Your Life. Your Journey.' : 'مِرحال | حياتك، رحلتك';
      this.document
        .querySelector('meta[name="description"]')
        ?.setAttribute(
          'content',
          english
            ? 'MIRHAL helps you find your next step, see your progress, and grow at your own pace.'
            : 'مِرحال يساعدك على اختيار خطوتك التالية، ومتابعة تقدمك، والنمو وفق وتيرتك.',
        );
    });
  }
}
