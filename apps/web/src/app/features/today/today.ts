import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Api, CheckIn, Habit, Page, Task, Toasts } from '@lifequest/data-access';
import { Preferences } from '@lifequest/utilities';
import {
  ErrorState,
  HabitRow,
  Icon,
  PageHeader,
  Pagination,
  Progress,
  SectionTitle,
  Skeleton,
} from '@lifequest/ui';
import { CheckInForm } from './check-in';
@Component({
  selector: 'lq-today',
  imports: [
    RouterLink,
    PageHeader,
    Pagination,
    ErrorState,
    Skeleton,
    Icon,
    Progress,
    SectionTitle,
    HabitRow,
    CheckInForm,
  ],
  templateUrl: './today.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodayPage {
  private readonly api = inject(Api);
  private readonly toasts = inject(Toasts);
  readonly i18n = inject(Preferences);
  readonly habits = this.api.resource<Page<Habit> & { date: string; completedCount: number }>(
    'habits?today=true&limit=10',
  );
  readonly tasks = this.api.resource<Page<Task>>('tasks?today=true&limit=8');
  readonly checkIns = this.api.resource<CheckIn[]>('check-ins');
  readonly busy = signal('');
  readonly scheduled = computed(() => this.habits.data()?.items ?? []);
  readonly scheduledCount = computed(() => this.habits.data()?.total ?? 0);
  readonly completeCount = computed(() => this.habits.data()?.completedCount ?? 0);
  readonly checkedIn = computed(
    () =>
      this.checkIns.data()?.some((item) => item.date.slice(0, 10) === this.habits.data()?.date) ??
      false,
  );
  readonly todayTasks = computed(() => this.tasks.data()?.items ?? []);
  habitPage(page: number) {
    void this.habits.load(`habits?today=true&limit=10&page=${page}`);
  }
  taskPage(page: number) {
    void this.tasks.load(`tasks?today=true&limit=8&page=${page}`);
  }
  async complete(id: string, minimum: boolean) {
    if (this.busy()) return;
    this.busy.set(id);
    try {
      const result = await this.api.post<{ awarded: number }>(`habits/${id}/complete`, { minimum });
      this.toasts.success(
        this.i18n.t('A little win, recorded.', 'إنجاز صغير، تم تسجيله.'),
        `+${result.awarded} XP`,
      );
      await this.habits.load();
    } catch (error) {
      this.toasts.error(error);
    } finally {
      this.busy.set('');
    }
  }
  async completeTask(id: string) {
    try {
      const result = await this.api.patch<{ awarded: number }>(`tasks/${id}`, {
        status: 'COMPLETED',
      });
      this.toasts.success(
        this.i18n.t('One less thing on your mind.', 'شيء أقل يشغل بالك.'),
        `+${result.awarded} XP`,
      );
      await this.tasks.load();
    } catch (error) {
      this.toasts.error(error);
    }
  }
}
