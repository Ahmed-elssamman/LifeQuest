type QuestStep = {
  id: string;
  title: string;
  completedAt: string | null;
};
type ActiveQuest = {
  id: string;
  title: string;
  deadline: string;
  completedAt: string | null;
  items: QuestStep[];
};

export function selectNextAction<
  T extends { priority: string },
  H extends { completedToday: boolean },
  Q extends ActiveQuest = ActiveQuest,
>(
  tasks: readonly T[],
  habits: readonly H[],
  quests: readonly Q[] = [],
):
  | { kind: 'task'; task: T }
  | { kind: 'habit'; habit: H }
  | { kind: 'quest'; quest: Q; item: QuestStep }
  | null {
  const priorityTask = tasks.find((task) => task.priority === 'HIGH');
  if (priorityTask) return { kind: 'task', task: priorityTask };
  const habit = habits.find((item) => !item.completedToday);
  if (habit) return { kind: 'habit', habit };
  const task = tasks[0];
  if (task) return { kind: 'task', task };
  const quest = quests
    .filter((item) => !item.completedAt && new Date(item.deadline).getTime() >= Date.now())
    .sort(
      (a, b) =>
        new Date(a.deadline).getTime() - new Date(b.deadline).getTime() || a.id.localeCompare(b.id),
    )
    .find((item) => item.items.some((step) => !step.completedAt));
  const item = quest?.items.find((step) => !step.completedAt);
  return quest && item ? { kind: 'quest', quest, item } : null;
}
