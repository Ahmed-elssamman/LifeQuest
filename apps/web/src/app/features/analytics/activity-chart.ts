import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
@Component({
  selector: 'lq-activity-chart',
  template: `<figure>
    <svg viewBox="0 0 700 180" role="img" [attr.aria-label]="label()" class="w-full">
      <line x1="12" y1="145" x2="690" y2="145" stroke="currentColor" class="text-line" />
      @for (day of bars(); track day.date) {
        <rect
          [attr.x]="day.x"
          [attr.y]="145 - day.height"
          width="13"
          [attr.height]="day.height"
          rx="4"
          class="fill-brand/75"
        >
          <title>{{ day.date }}: {{ day.habits }}</title>
        </rect>
        @if (day.checkIn) {
          <circle [attr.cx]="day.x + 6.5" cy="160" r="2.5" fill="#267755" />
        }
      }
    </svg>
    <figcaption class="mt-1 flex justify-between text-[10px] text-muted">
      <span>{{ items()[0]?.date }}</span
      ><span>{{ items()[items().length - 1]?.date }}</span>
    </figcaption>
  </figure>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityChart {
  readonly items = input.required<{ date: string; habits: number; checkIn: boolean }[]>();
  readonly label = input(
    'Habit actions over the last 28 days. Green dots indicate daily check-ins.',
  );
  readonly bars = computed(() => {
    const max = Math.max(1, ...this.items().map((item) => item.habits));
    return this.items().map((item, i) => ({
      ...item,
      x: 14 + i * (670 / Math.max(1, this.items().length)),
      height: (item.habits / max) * 120,
    }));
  });
}
