import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Overlays } from '../../../../libs/ui/src/overlays';
@Component({
  selector: 'lq-root',
  imports: [RouterOutlet, Overlays],
  template: '<router-outlet />@defer (on idle) { <lq-overlays /> }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
