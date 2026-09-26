export const clamp = (value: number, min = 0, max = 100): number =>
  Math.min(max, Math.max(min, Number.isFinite(value) ? value : 0));
export const percent = (value: number, target: number): number =>
  target > 0 ? clamp((value / target) * 100) : 0;
export function goalProgress(goal: {
  strategy: string;
  manualProgress: number;
  numericValue: number;
  numericTarget: number | null;
  projects?: { tasks: { status: string }[] }[];
  milestones?: { completed: boolean }[];
}): number {
  switch (goal.strategy) {
    case 'NUMERIC':
      return percent(goal.numericValue, goal.numericTarget ?? 0);
    case 'PROJECT': {
      const projects = goal.projects ?? [];
      return projects.length
        ? projects.reduce((sum, project) => sum + projectProgress(project.tasks), 0) /
            projects.length
        : 0;
    }
    case 'MILESTONE': {
      const milestones = goal.milestones ?? [];
      return percent(milestones.filter((m) => m.completed).length, milestones.length);
    }
    default:
      return clamp(goal.manualProgress);
  }
}
export function projectProgress(tasks: { status: string }[]): number {
  const relevant = tasks.filter((task) => task.status !== 'ARCHIVED');
  return percent(relevant.filter((task) => task.status === 'COMPLETED').length, relevant.length);
}
export const JOURNEY_WEIGHTS = {
  habits: 0.3,
  quests: 0.2,
  goals: 0.15,
  checkIns: 0.15,
  projects: 0.1,
  recovery: 0.1,
} as const;
export type JourneyFactors = Record<keyof typeof JOURNEY_WEIGHTS, number>;
export function journeyScore(factors: JourneyFactors) {
  const contributions = (Object.keys(JOURNEY_WEIGHTS) as (keyof JourneyFactors)[]).map((key) => ({
    key,
    value: clamp(factors[key]),
    weight: JOURNEY_WEIGHTS[key],
    contribution: clamp(factors[key]) * JOURNEY_WEIGHTS[key],
  }));
  return {
    score: Math.round(contributions.reduce((sum, item) => sum + item.contribution, 0)),
    contributions,
  };
}
export function levelProgress(
  xp: number,
  levels: { number: number; title: string; titleAr: string; minXp: number }[],
) {
  const sorted = [...levels].sort((a, b) => a.minXp - b.minXp);
  const current = sorted.filter((level) => level.minXp <= xp).at(-1) ?? sorted[0];
  const next = sorted.find((level) => level.minXp > xp);
  return {
    current,
    next,
    progress: current && next ? percent(xp - current.minXp, next.minXp - current.minXp) : 100,
    remaining: next ? Math.max(0, next.minXp - xp) : 0,
  };
}
