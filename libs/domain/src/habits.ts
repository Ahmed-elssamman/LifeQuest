export function localDate(now: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}
export function dateOnly(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}
export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}
export interface HabitSchedule {
  frequency: string;
  scheduleDays: number[];
  weeklyTarget: number;
  startDate: Date;
}
export function isScheduled(habit: HabitSchedule, day: Date): boolean {
  if (day < dateOnly(habit.startDate.toISOString().slice(0, 10))) return false;
  return habit.frequency !== 'CUSTOM' || habit.scheduleDays.includes(day.getUTCDay());
}
export function habitAdherence(
  habit: HabitSchedule,
  logs: { date: Date }[],
  start: Date,
  end: Date,
): number {
  let expected = 0;
  let completed = 0;
  const dates = new Set(logs.map((log) => log.date.toISOString().slice(0, 10)));
  for (let day = new Date(start); day <= end; day = addDays(day, 1)) {
    if (isScheduled(habit, day)) {
      expected++;
      if (dates.has(day.toISOString().slice(0, 10))) completed++;
    }
  }
  if (habit.frequency === 'WEEKLY') expected = Math.ceil((expected / 7) * habit.weeklyTarget);
  return expected ? Math.min(100, Math.round((completed / expected) * 100)) : 0;
}
export function currentStreak(habit: HabitSchedule, logs: { date: Date }[], today: Date): number {
  const dates = new Set(logs.map((log) => log.date.toISOString().slice(0, 10)));
  if (habit.frequency === 'WEEKLY') {
    let streak = 0;
    const monday = addDays(today, -((today.getUTCDay() + 6) % 7));
    for (let week = 0; addDays(monday, -week * 7 + 6) >= habit.startDate; week++) {
      const start = addDays(monday, -week * 7);
      const count = [...dates].filter(
        (date) => dateOnly(date) >= start && dateOnly(date) < addDays(start, 7),
      ).length;
      if (count >= habit.weeklyTarget) streak++;
      else if (week > 0) break;
    }
    return streak;
  }
  let streak = 0;
  for (
    let day = new Date(today), count = 0;
    day >= habit.startDate;
    day = addDays(day, -1), count++
  ) {
    if (!isScheduled(habit, day)) continue;
    if (dates.has(day.toISOString().slice(0, 10))) streak++;
    else if (count !== 0) break;
  }
  return streak;
}
export function habitXp(difficulty: string, minimum: boolean): number {
  const full = difficulty === 'HARD' ? 40 : difficulty === 'MEDIUM' ? 30 : 20;
  return minimum ? Math.ceil(full / 2) : full;
}

/** Suggest recovery only after an eligible commitment was missed, never for a rest day. */
export function needsRecovery(habit: HabitSchedule, logs: { date: Date }[], today: Date): boolean {
  if (!isScheduled(habit, today)) return false;
  const dates = new Set(logs.map((log) => log.date.toISOString().slice(0, 10)));
  if (dates.has(today.toISOString().slice(0, 10))) return false;
  if (habit.frequency === 'WEEKLY') {
    const monday = addDays(today, -((today.getUTCDay() + 6) % 7));
    const previousMonday = addDays(monday, -7);
    // A first partial week is a starting point, not a missed commitment.
    if (habit.startDate > previousMonday) return false;
    const completed = [...dates].filter((date) => {
      const day = dateOnly(date);
      return day >= previousMonday && day < monday;
    }).length;
    return completed < habit.weeklyTarget;
  }
  for (let offset = 1; offset <= 7; offset++) {
    const previous = addDays(today, -offset);
    if (previous < habit.startDate) return false;
    if (isScheduled(habit, previous)) return !dates.has(previous.toISOString().slice(0, 10));
  }
  return false;
}

/** Notice a repeated pattern without treating rest days or a new habit as failures. */
export function repeatedMisses(habit: HabitSchedule, logs: { date: Date }[], today: Date): boolean {
  const dates = new Set(logs.map((log) => log.date.toISOString().slice(0, 10)));
  if (habit.frequency === 'WEEKLY') {
    const monday = addDays(today, -((today.getUTCDay() + 6) % 7));
    let missed = 0;
    for (let week = 1; week <= 3; week++) {
      const start = addDays(monday, -week * 7);
      if (start < habit.startDate) return false;
      const completed = [...dates].filter((date) => {
        const day = dateOnly(date);
        return day >= start && day < addDays(start, 7);
      }).length;
      if (completed < habit.weeklyTarget) missed++;
    }
    return missed >= 2;
  }
  let scheduled = 0;
  let missed = 0;
  for (let offset = 1; offset <= 21 && scheduled < 3; offset++) {
    const day = addDays(today, -offset);
    if (day < habit.startDate) break;
    if (!isScheduled(habit, day)) continue;
    scheduled++;
    if (!dates.has(day.toISOString().slice(0, 10))) missed++;
  }
  return scheduled === 3 && missed >= 2;
}
