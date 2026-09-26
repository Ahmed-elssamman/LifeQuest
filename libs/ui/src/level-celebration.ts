import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Celebrations } from '@lifequest/data-access';
import { Preferences } from '@lifequest/utilities';
import { Icon } from './icon';

@Component({
  selector: 'lq-level-celebration',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@if (celebrations.level(); as level) {
    <aside
      class="fixed end-4 top-24 z-50 w-80 max-w-[calc(100vw-2rem)] animate-enter rounded-2xl border border-brand/30 bg-surface p-5 shadow-lg"
      role="status"
      aria-live="polite"
    >
      <div class="flex items-start justify-between gap-3">
        <span
          class="flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand"
          aria-hidden="true"
          ><lq-icon name="sparkles" [size]="28"
        /></span>
        <button
          class="icon-button"
          [attr.aria-label]="i18n.t('Dismiss celebration', 'إغلاق الاحتفال')"
          (click)="celebrations.dismiss()"
        >
          <lq-icon name="x" [size]="18" />
        </button>
      </div>
      <p class="eyebrow mb-2 mt-4">
        {{ i18n.t('A NEW CHAPTER', 'فصل جديد') }} · {{ level.number }}
      </p>
      <h2 class="text-xl font-semibold">{{ i18n.t(level.title, level.titleAr) }}</h2>
      <p class="mt-3 text-sm leading-6 text-muted">
        {{
          i18n.t(
            'Every small step brought you here. Take a moment to enjoy your progress.',
            'كل خطوة صغيرة أوصلتك إلى هنا. خذ لحظة لتستمتع بتقدمك.'
          )
        }}
      </p>
      <a
        class="btn btn-secondary mt-4 w-full"
        routerLink="/achievements"
        (click)="celebrations.dismiss()"
        >{{ i18n.t('See my progress', 'شاهد تقدمي') }}<lq-icon name="arrow-right" [size]="16"
      /></a>
    </aside>
  }`,
})
export class LevelCelebration {
  readonly celebrations = inject(Celebrations);
  readonly i18n = inject(Preferences);
}
