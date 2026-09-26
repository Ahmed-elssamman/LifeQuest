import { clamp, percent } from './progress';
export interface ScoreEvidence {
  date: string;
  value: number;
  xp: number;
}
export interface ScoreInput {
  evidence: ScoreEvidence[];
  expectedDays: number;
  baseline: number | null;
  target: number;
  dailyCap: number;
  lowerIsBetter: boolean;
}
export interface ScoreResult {
  score: number;
  progress: number;
  streak: number;
}
export interface ScoreStrategy {
  calculate(input: ScoreInput): number;
}
const total = (input: ScoreInput) =>
  input.evidence.reduce((sum, event) => sum + Math.min(input.dailyCap, event.value), 0);
export class XpScoreStrategy implements ScoreStrategy {
  calculate(input: ScoreInput) {
    return input.evidence.reduce((sum, item) => sum + Math.min(input.dailyCap, item.xp), 0);
  }
}
export class ConsistencyScoreStrategy implements ScoreStrategy {
  calculate(input: ScoreInput) {
    return percent(new Set(input.evidence.map((item) => item.date)).size, input.expectedDays);
  }
}
export class ImprovementScoreStrategy implements ScoreStrategy {
  calculate(input: ScoreInput) {
    if (
      input.baseline === null ||
      input.baseline <= 0 ||
      input.expectedDays <= 0 ||
      !input.evidence.length ||
      (input.lowerIsBetter &&
        new Set(input.evidence.map((item) => item.date)).size < input.expectedDays)
    )
      return 0;
    const current = total(input) / input.expectedDays;
    return clamp(
      ((input.lowerIsBetter ? input.baseline - current : current - input.baseline) /
        input.baseline) *
        100,
      -100,
      100,
    );
  }
}
export class TargetScoreStrategy implements ScoreStrategy {
  calculate(input: ScoreInput) {
    return percent(total(input), input.target);
  }
}
export class StreakScoreStrategy implements ScoreStrategy {
  calculate(input: ScoreInput) {
    const days = [...new Set(input.evidence.map((item) => item.date))].sort();
    let best = 0,
      streak = 0,
      previous = 0;
    for (const date of days) {
      const time = new Date(date).getTime();
      streak = time - previous === 86_400_000 ? streak + 1 : 1;
      best = Math.max(best, streak);
      previous = time;
    }
    return best;
  }
}
export class ScoringEngine {
  readonly version = 1;
  private readonly strategies: Record<string, ScoreStrategy> = {
    SCORE: new XpScoreStrategy(),
    CONSISTENCY: new ConsistencyScoreStrategy(),
    IMPROVEMENT: new ImprovementScoreStrategy(),
    TARGET: new TargetScoreStrategy(),
    STREAK: new StreakScoreStrategy(),
    COOPERATIVE: new TargetScoreStrategy(),
  };
  calculate(mode: string, input: ScoreInput): ScoreResult {
    const strategy = this.strategies[mode];
    if (!strategy) throw new Error('Unsupported scoring strategy');
    if (
      input.evidence.some(
        (item) =>
          !Number.isFinite(item.value) ||
          item.value < 0 ||
          !Number.isFinite(item.xp) ||
          item.xp < 0,
      ) ||
      input.target <= 0 ||
      input.dailyCap <= 0 ||
      input.expectedDays < 0
    )
      throw new Error('Invalid scoring evidence');
    const byDay = new Map<string, ScoreEvidence>();
    for (const item of input.evidence) {
      const previous = byDay.get(item.date);
      byDay.set(item.date, {
        date: item.date,
        value: Math.min(input.dailyCap, (previous?.value ?? 0) + item.value),
        xp: Math.min(input.dailyCap, (previous?.xp ?? 0) + item.xp),
      });
    }
    const normalized = {
      ...input,
      evidence: [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date)),
    };
    const score = Math.round(strategy.calculate(normalized) * 100) / 100;
    return {
      score,
      progress: mode === 'SCORE' || mode === 'STREAK' ? percent(score, input.target) : clamp(score),
      streak: new StreakScoreStrategy().calculate(normalized),
    };
  }
}
