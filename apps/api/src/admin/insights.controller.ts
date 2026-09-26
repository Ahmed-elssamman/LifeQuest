import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Database } from '../common/database';
import { Roles } from '../common/http';
import { activityMetrics } from './activity-metrics';
@ApiTags('Administration insights')
@Roles('SUPER_ADMIN', 'ADMIN', 'ANALYST')
@Controller('admin/insights')
export class InsightsController {
  constructor(@Inject(Database) private readonly db: Database) {}
  @Get() async overview() {
    const where = { user: { status: 'ACTIVE' as const } };
    const [goals, projects, tasks, habits, experiments, adherence] = await Promise.all([
      this.db.goal.groupBy({ by: ['status'], where, _count: true }),
      this.db.project.groupBy({ by: ['status'], where, _count: true }),
      this.db.task.groupBy({ by: ['status'], where, _count: true }),
      this.db.habit.groupBy({ by: ['status'], where, _count: true }),
      this.db.habitExperiment.count({
        where: { createdAt: { gte: new Date(Date.now() - 30 * 86400000) }, habit: where },
      }),
      activityMetrics(this.db),
    ]);
    return {
      periodDays: 30,
      planning: [
        { kind: 'goals', statuses: goals },
        { kind: 'projects', statuses: projects },
        { kind: 'tasks', statuses: tasks },
      ],
      habits,
      experiments,
      ...adherence,
    };
  }
}
