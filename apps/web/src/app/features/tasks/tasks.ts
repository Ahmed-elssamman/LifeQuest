import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { Api, errorMessage, Goal, Page, Project, Task, Toasts } from '@lifequest/data-access';
import { LocalizedDatePipe, Preferences } from '@lifequest/utilities';
import { EmptyState, ErrorState, Icon, PageHeader, Pagination, Skeleton } from '@lifequest/ui';
import { applyServerValidation, FormField, DiscardChanges, UnsavedForm } from '@lifequest/forms';
@Component({
  selector: 'lq-tasks',
  imports: [
    LocalizedDatePipe,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    PageHeader,
    EmptyState,
    ErrorState,
    Skeleton,
    Icon,
    Pagination,
    FormField,
    UnsavedForm,
  ],
  templateUrl: './tasks.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksPage {
  private readonly api = inject(Api);
  private readonly fb = inject(FormBuilder);
  private readonly toasts = inject(Toasts);
  private readonly route = inject(ActivatedRoute);
  readonly discard = inject(DiscardChanges);
  readonly i18n = inject(Preferences);
  readonly projectId = this.route.snapshot.queryParamMap.get('project');
  readonly resource = this.api.resource<Page<Task>>(
    'tasks' + (this.projectId ? '?projectId=' + encodeURIComponent(this.projectId) : ''),
  );
  readonly goals = this.api.resource<Page<Goal>>('goals?limit=100');
  readonly editing = signal<Task | null>(null);
  readonly projects = this.api.resource<Page<Project>>('projects?limit=100');
  readonly open = signal(false);
  readonly saving = signal(false);
  readonly busy = signal('');
  readonly error = signal('');
  readonly filter = signal('ALL');
  readonly search = signal('');
  readonly visible = computed(() => this.resource.data()?.items ?? []);
  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    projectId: [''],
    goalId: [''],
    parentId: [''],
    labels: [''],
    startDate: [''],
    priority: ['MEDIUM'],
    dueDate: [''],
    estimatedMinutes: [25],
  });
  create() {
    this.editing.set(null);
    this.form.reset({ projectId: this.projectId ?? '', priority: 'MEDIUM', estimatedMinutes: 25 });
    this.error.set('');
    this.open.set(true);
  }
  edit(task: Task) {
    this.editing.set(task);
    this.form.reset({
      ...task,
      projectId: task.projectId ?? '',
      goalId: task.goalId ?? '',
      parentId: task.parentId ?? '',
      labels: task.labels.join(', '),
      startDate: task.startDate?.slice(0, 10) ?? '',
      dueDate: task.dueDate?.slice(0, 10) ?? '',
      estimatedMinutes: task.estimatedMinutes ?? 25,
    });
    this.error.set('');
    this.open.set(true);
  }
  async subtask() {
    const parent = this.editing();
    if (!parent || (this.form.dirty && !(await this.discard.confirm()))) return;
    this.create();
    this.form.patchValue({
      parentId: parent.id,
      projectId: parent.projectId ?? '',
      goalId: parent.goalId ?? '',
    });
  }
  async save() {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set('');
    const values = this.form.getRawValue();
    try {
      const input = {
        ...values,
        parentId: values.parentId || null,
        projectId: values.projectId || null,
        dueDate: values.dueDate || null,
        goalId: values.goalId || null,
        startDate: values.startDate || null,
        labels: values.labels
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
      };
      const editing = this.editing();
      if (editing) await this.api.patch(`tasks/${editing.id}`, input);
      else await this.api.post('tasks', input);
      this.form.markAsPristine();
      this.open.set(false);
      this.toasts.success(this.i18n.t('Your next step is ready.', 'خطوتك التالية جاهزة.'));
      await this.resource.load();
    } catch (error) {
      applyServerValidation(this.form, error);
      this.error.set(errorMessage(error));
    } finally {
      this.saving.set(false);
    }
  }
  async toggle(task: Task) {
    if (this.busy()) return;
    this.busy.set(task.id);
    try {
      const result = await this.api.patch<{ awarded: number }>(`tasks/${task.id}`, {
        status: task.status === 'COMPLETED' ? 'ACTIVE' : 'COMPLETED',
      });
      if (result.awarded)
        this.toasts.success(
          this.i18n.t('One step forward.', 'خطوة للأمام.'),
          `+${result.awarded} XP`,
        );
      await this.resource.load();
    } catch (error) {
      this.toasts.error(error);
    } finally {
      this.busy.set('');
    }
  }
  setFilter(status: string) {
    this.filter.set(status);
    this.find();
  }
  find(page = 1) {
    void this.resource.load(
      `tasks?page=${page}&search=${encodeURIComponent(this.search())}&status=${this.filter()}${this.projectId ? '&projectId=' + encodeURIComponent(this.projectId) : ''}`,
    );
  }
}
