import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { Preferences } from '@lifequest/utilities';
import { Icon } from './icon';
@Component({
  selector: 'lq-pagination',
  imports: [Icon],
  template:
    '@if (total() > limit()) { <nav class="mt-6 flex items-center justify-between gap-3" [attr.aria-label]="i18n.t(\'Pagination\',\'الصفحات\')"><span class="text-xs text-muted">{{ total() }} {{ i18n.t(\'items\',\'عنصر\') }}</span><div class="flex items-center gap-3"><button class="icon-button border border-line" [disabled]="page() <= 1" (click)="change.emit(page()-1)" [attr.aria-label]="i18n.t(\'Previous page\',\'الصفحة السابقة\')"><lq-icon name="arrow-left" [size]="17" /></button><span class="text-xs">{{ page() }} / {{ pages() }}</span><button class="icon-button border border-line" [disabled]="page() >= pages()" (click)="change.emit(page()+1)" [attr.aria-label]="i18n.t(\'Next page\',\'الصفحة التالية\')"><lq-icon name="arrow-right" [size]="17" /></button></div></nav> }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pagination {
  readonly page = input(1);
  readonly total = input(0);
  readonly limit = input(25);
  readonly change = output<number>();
  readonly i18n = inject(Preferences);
  pages() {
    return Math.ceil(this.total() / this.limit());
  }
}
