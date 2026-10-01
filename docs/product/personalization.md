# Progressive personalization

MIRHAL asks for one life area to start. A first goal, a small recurring action and a preferred time are optional; the three-step onboarding submits through the existing `POST /onboarding` contract. Profiles start private. Users can change sharing in Settings and adjust goals, habits and schedules later. A partially completed walkthrough is not submitted; sign-in and direct private-route access return an unfinished account to onboarding.

If account creation succeeds but verification mail temporarily fails, onboarding displays an inline instruction to resend from Settings. The notice remains visible after entering the app until dismissed. It does not block a form action.

The present system stores explicit area choices in `UserLifeArea`, a preferred routine and visibility in `Profile`, and actual work in owned goal, task, habit, check-in, quest and reward records. These are enough for simple user-facing defaults. No personality score or invisible profile inference runs during onboarding.

Reward recommendations derive transparent, limited preference signals from the user's own favorites, non-refunded redemptions and optional ratings. The deterministic scorer returns up to four suggestions with translated reasons. Low ratings lower category affinity. Signals remain scoped to that user and are cleared through account erasure. Religious, health, mood and journal content are not recommendation inputs. The scorer reads bounded candidate/history sets and runs only on the Rewards page.

The first-page Today selector is a current-work convenience. It prioritizes a high-priority due task, then an incomplete scheduled habit, then ordinary due work. Phase 5 may move the selector to a bounded server aggregation if users have enough backlog that first-page selection produces poor results. It must remain explainable and avoid extra dashboard queries.
