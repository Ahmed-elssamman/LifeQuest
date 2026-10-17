export interface Overview {
  habitCompletionRate: number;
  scheduledActions: number;
  completedScheduledActions: number;
  users: number;
  activeUsers: number;
  newUsers: number;
  returningUsers: number;
  activeHabits: number;
  habitCompletions: number;
  activeChallenges: number;
  completedChallenges: number;
  xpIssued: number;
  rewardsRedeemed: number;
  feedbackVolume: number;
  periodDays: number;
  feedback: { status: string; category: string; _count: number }[];
  events: { name: string; _count: number }[];
}
export interface AdminUser {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  lastActiveAt: string;
  profile: { displayName: string; language?: string; timezone?: string };
  _count: Record<string, number>;
}
export interface AdminChallenge {
  id: string;
  title: string;
  mode: string;
  status: string;
  startDate: string;
  endDate: string;
  _count: { participants: number };
}
export interface Audit {
  id: string;
  actorId: string | null;
  action: string;
  entity: string;
  entityId: string;
  createdAt: string;
  metadata: Record<string, unknown> | null;
}
export interface Health {
  status: string;
  database: string;
  email: { provider: string; status: 'configured' | 'disabled' | 'incomplete' };
  version: string;
  environment: string;
  uptime: number;
  timestamp: string;
}
