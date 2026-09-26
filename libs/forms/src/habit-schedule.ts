import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Preferences } from '@lifequest/utilities';
import { FormField } from './field';

@Component({
  selector: 'lq-habit-schedule',
  imports: [ReactiveFormsModule, FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lq-field [id]="prefix() + '-frequency'" [label]="i18n.t('Rhythm', 'الإيقاع')">
      <select [id]="prefix() + '-frequency'" class="field" [formControl]="frequency()">
        <option value="DAILY">{{ i18n.t('Every day', 'كل يوم') }}</option>
        <option value="WEEKLY">{{ i18n.t('A few times a week', 'عدة مرات أسبوعياً') }}</option>
        <option value="CUSTOM">{{ i18n.t('Selected days', 'أيام محددة') }}</option>
      </select>
    </lq-field>
    @if (frequency().value === 'CUSTOM') {
      <fieldset class="mb-5">
        <legend class="field-label">{{ i18n.t('Choose your days', 'اختر أيامك') }}</legend>
        <div class="flex flex-wrap gap-2">
          @for (day of weekdays; track $index) {
            <button
              type="button"
              class="btn text-xs"
              [class]="scheduleDays().value.includes($index) ? 'btn-primary' : 'btn-secondary'"
              [attr.aria-pressed]="scheduleDays().value.includes($index)"
              (click)="toggleDay($index)"
            >
              {{ i18n.t(day.en, day.ar) }}
            </button>
          }
        </div>
        @if (!scheduleDays().value.length) {
          <p role="status" class="mt-2 text-xs text-muted">
            {{
              i18n.t(
                'Choose at least one day to continue.',
                'اختر يوماً واحداً على الأقل للمتابعة.'
              )
            }}
          </p>
        }
      </fieldset>
    }
    @if (frequency().value === 'WEEKLY') {
      <lq-field [id]="prefix() + '-weekly'" [label]="i18n.t('Days per week', 'أيام في الأسبوع')">
        <input
          [id]="prefix() + '-weekly'"
          class="field"
          type="number"
          min="1"
          max="7"
          [formControl]="weeklyTarget()"
        />
      </lq-field>
    }
  `,
})
export class HabitScheduleFields {
  readonly i18n = inject(Preferences);
  readonly prefix = input.required<string>();
  readonly frequency = input.required<FormControl<string>>();
  readonly scheduleDays = input.required<FormControl<number[]>>();
  readonly weeklyTarget = input.required<FormControl<number>>();
  readonly weekdays = [
    { en: 'Sun', ar: 'الأحد' },
    { en: 'Mon', ar: 'الإثنين' },
    { en: 'Tue', ar: 'الثلاثاء' },
    { en: 'Wed', ar: 'الأربعاء' },
    { en: 'Thu', ar: 'الخميس' },
    { en: 'Fri', ar: 'الجمعة' },
    { en: 'Sat', ar: 'السبت' },
  ];
  toggleDay(day: number) {
    const control = this.scheduleDays();
    control.setValue(
      control.value.includes(day)
        ? control.value.filter((value) => value !== day)
        : [...control.value, day].sort(),
    );
    control.markAsDirty();
  }
}
