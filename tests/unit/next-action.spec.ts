import { describe, expect, it } from 'vitest';
import { selectNextAction } from '../../apps/web/src/app/features/today/next-action';

describe('Today next action', () => {
  const habit = { id: 'habit', completedToday: false };

  it('chooses a high-priority due task before a scheduled habit', () => {
    const tasks = [
      { id: 'normal', priority: 'MEDIUM' },
      { id: 'urgent', priority: 'HIGH' },
    ];
    expect(selectNextAction(tasks, [habit])).toEqual({ kind: 'task', task: tasks[1] });
  });

  it('chooses an incomplete habit before ordinary due work', () => {
    expect(selectNextAction([{ id: 'task', priority: 'MEDIUM' }], [habit])).toEqual({
      kind: 'habit',
      habit,
    });
  });

  it('falls back to due work when scheduled habits are done', () => {
    const task = { id: 'task', priority: 'MEDIUM' };
    expect(selectNextAction([task], [{ ...habit, completedToday: true }])).toEqual({
      kind: 'task',
      task,
    });
  });

  it('shows no action after the available daily work is complete', () => {
    expect(selectNextAction([], [{ ...habit, completedToday: true }])).toBeNull();
  });

  it('offers the first unfinished step from the nearest active quest when daily work is clear', () => {
    const quests = [
      {
        id: 'later',
        title: 'Later',
        deadline: new Date(Date.now() + 86400000 * 3).toISOString(),
        completedAt: null,
        items: [{ id: 'later-step', title: 'Later step', completedAt: null }],
      },
      {
        id: 'soon',
        title: 'Soon',
        deadline: new Date(Date.now() + 86400000).toISOString(),
        completedAt: null,
        items: [
          { id: 'done', title: 'Done', completedAt: new Date().toISOString() },
          { id: 'next', title: 'Next step', completedAt: null },
        ],
      },
    ];
    expect(selectNextAction([], [], quests)).toEqual({
      kind: 'quest',
      quest: quests[1],
      item: quests[1]?.items[1],
    });
    expect(selectNextAction([{ id: 'task', priority: 'LOW' }], [], quests)?.kind).toBe('task');
  });

  it('does not suggest expired or finished quests', () => {
    const expired = {
      id: 'expired',
      title: 'Past',
      deadline: new Date(Date.now() - 86400000).toISOString(),
      completedAt: null,
      items: [{ id: 'step', title: 'Step', completedAt: null }],
    };
    expect(selectNextAction([], [], [expired])).toBeNull();
    expect(
      selectNextAction(
        [],
        [],
        [
          {
            ...expired,
            deadline: new Date(Date.now() + 86400000).toISOString(),
            completedAt: new Date().toISOString(),
          },
        ],
      ),
    ).toBeNull();
  });
});
