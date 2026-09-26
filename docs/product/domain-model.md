# Domain model

A goal is an outcome. Projects are bodies of work toward it; tasks are concrete work items, optionally nested and labelled. Goal progress chooses exactly one strategy: manual, numeric, milestones or linked projects. Habits represent repeated behavior and may support a goal, but task completion and habit adherence are separate concepts.

Configurable LifeArea data starts with Faith/الدين, Body/الجسد, Growth/التطوير and Mind/النفس. Do not branch business behavior on those names. Seasons contain phases by year/month, user progress and monthly reflections, rather than hardcoded calendar logic.

Habit logs record actual behavior for a scheduled local calendar day and are idempotent. Daily check-ins record energy, mood, wins, friction and recovery intentions. Habit Lab stores diagnoses and experiments and can reduce a target, adjust a minimum action/time, pause or archive a habit. Small minimum actions are valid.

Weekly quests contain concrete progress items, a deadline, purpose, life area and server-calculated XP reward. Journey analytics aggregate habits, goals, projects, quests, check-ins and recovery, with transparent weighted contributions. The score is a derived view, not primary data.

Identity entities include User, Profile, Session, AuthToken and UserLifeArea. Planning entities include Goal, Project, Task and Milestone. Behavior entities include Habit, HabitLog, HabitExperiment and DailyCheckIn. Journey entities include WeeklyQuest, QuestProgress, Season, SeasonPhase, UserProgress and MonthJourney.

Progression uses XPTransaction, Level, Achievement, UserAchievement, Reward and RewardRedemption. Social uses Friendship, Challenge, ChallengeRule, ChallengeMetric, ChallengeParticipant, ChallengeHabitSnapshot and ChallengeScore. Operations use Notification, Feedback, FeedbackReply, FeedbackAttachment, AuditLog, AnalyticsEvent, HelpArticle, Announcement and SystemSetting.

Habit Lab can atomically change target, schedule, weekly frequency, preferred time, minimum action and commitment alongside its learning record. KEEP records the reflection without changing the plan. Recovery prompts check the last scheduled commitment; custom rest days and a new habit's first partial week are not misses. The lab is paginated and protects unsaved experiments.

Goals, projects and tasks enforce ordered dates in the API and PostgreSQL migration 005. Reparenting a project with task links to another goal requires explicit reconciliation of those links.
