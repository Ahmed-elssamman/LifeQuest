import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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
}
