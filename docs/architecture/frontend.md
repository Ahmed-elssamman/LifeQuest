# Frontend

`apps/web/src/app/app.routes.ts` and the separate admin route file define lazy standalone features. Root components host the router and deferred overlays. Feature state uses Angular signals/computed values; forms use typed reactive controls. RxJS is used for HTTP and session refresh streams. Components use OnPush.

`libs/ui` supplies icons, page/section headers, cards/styles, progress, skeletons, errors, empty states and pagination. `libs/forms` supplies field labels and help/error rendering. Tailwind tokens in `libs/ui/src/styles.css` define surfaces, ink, spacing primitives and motion. PrimeNG provides dialogs, confirmation, toast, drawers, tooltips and operational tables. The theme imports only used component presets.

`libs/data-access` owns typed response models, credentials-aware HTTP, safe errors and resource state. Remote resources reject stale responses when filters race, preserve previous data after errors and expose retry. Configurable life areas are cached for five minutes; private responses are not cached globally.

`libs/utilities` applies English/Arabic, LTR/RTL, light/dark/system themes and reduced motion. Every feature should keep its prose bilingual. `libs/auth` owns session state and route guards. Frontend guards improve navigation; server RBAC remains the security boundary.

Use a focused feature component and template when adding a route. Reuse composable primitives; do not add a universal entity editor for customer workflows. For long collections, filter and paginate on the server. Check dialogs at 320px and keyboard focus. A named label must reference the input, never a duplicate wrapper ID.

Prerendering is limited to public content. The service worker caches the static client shell and downloaded application chunks; it does not cache `/api`, authentication responses or personal reflection data, and never replays mutations.

Shared libraries are explicit Nx projects. Build inputs include dependency production sources so changing a shared form or domain utility invalidates affected application builds. Forms associate client/server errors with projected inputs and protect unsaved work. All private history screens use server pages rather than loading unbounded arrays.

The monthly journey accepts `?month=YYYY-MM`, loads the corresponding saved reflection, and displays the score factors and current-configuration caveat. Staff quest templates are optional starting points, copied into an editable personal form. Avatar choices are packaged locally. Feedback images upload only after a conversation exists, so retrying an attachment cannot duplicate feedback.

The Today feed selects schedules and due work in PostgreSQL before pagination and uses the account timezone. Its completion total spans all pages. A language change in either authenticated header is saved to the profile and survives reloads. Level transitions arrive as explicit server response metadata; a deferred, dismissible live region celebrates them without taking focus or blocking daily actions.

`HabitScheduleFields` shares daily/weekly/custom schedule controls between habits and Habit Lab. The lab records learning and schedule/commitment adjustments in one transaction, supports pagination and protects unfinished experiments. Advanced planning fields live in expandable form sections; goals and projects share the milestone editor. Tasks expose explicit subtask creation and display the parent title. PrimeNG 19 table scroll regions use `AccessibleTable` for keyboard access and bilingual accessible labels.
