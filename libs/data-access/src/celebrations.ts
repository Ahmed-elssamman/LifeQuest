import { Injectable, signal } from '@angular/core';

export interface LevelMilestone {
  number: number;
  title: string;
  titleAr: string;
}

/** Presentation only: the API is the sole authority for a newly earned level. */
@Injectable({ providedIn: 'root' })
export class Celebrations {
  readonly level = signal<LevelMilestone | null>(null);
  receive(result: unknown) {
    if (!result || typeof result !== 'object' || !('levelUp' in result)) return;
    const level = result.levelUp;
    if (
      level &&
      typeof level === 'object' &&
      'number' in level &&
      typeof level.number === 'number' &&
      'title' in level &&
      typeof level.title === 'string' &&
      'titleAr' in level &&
      typeof level.titleAr === 'string'
    )
      this.level.set({ number: level.number, title: level.title, titleAr: level.titleAr });
  }
  dismiss() {
    this.level.set(null);
  }
}
