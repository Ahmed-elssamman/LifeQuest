import { Directive, ElementRef, afterRenderEffect, inject, input } from '@angular/core';

/** PrimeNG 19's scroll container needs a named keyboard focus target. */
@Directive({ selector: 'p-table[lqTableLabel]' })
export class AccessibleTable {
  readonly lqTableLabel = input.required<string>();
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  constructor() {
    afterRenderEffect(() => {
      const container = this.host.nativeElement.querySelector<HTMLElement>(
        '.p-datatable-table-container',
      );
      if (!container) return;
      container.tabIndex = 0;
      container.setAttribute('role', 'region');
      container.setAttribute('aria-label', this.lqTableLabel());
    });
  }
}
