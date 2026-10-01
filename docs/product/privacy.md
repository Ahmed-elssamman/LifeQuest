# Privacy boundaries

Profiles start private. Friendship APIs expose only connection status and minimal display identity. Challenge APIs expose aggregate fields only when the participant permits them; exact behavioral counts, journals, mood, weight, religious details and private notes stay private.

Ownership is verified on each read/write and on linked goal/project/habit/task references. Frontend route guards are not an authorization mechanism. Administration uses role restrictions and selective fields rather than full account dumps. Analysts and content managers cannot inspect private user journals. Anonymous feedback hides its user association in operational payloads while preserving the submitter's own status view.

Passwords are Argon2 hashes. Session/recovery secrets are random and stored as hashes. Browser credentials live in HttpOnly cookies. Server secrets stay in environment variables and are excluded from bundles, documentation, logs and screenshots. Development mail files are private and ignored.

Exports contain the requesting user's data and create an audit event. Deletion requires password reauthentication and explicit confirmation, revokes sessions/tokens, removes personal content/connections and anonymizes retained records. Minimal pseudonymous financial/security/competition evidence remains append-only. Set a legal retention policy before deploying to real users.

Internal analytics record event names and minimal operational metadata, not reflection text or mood. Static offline caching excludes private APIs and mutation replay. Respect notification and challenge sharing preferences in any new feature.

Feedback screenshots are private attachments. Only the submitting account and roles allowed to process feedback can download them. Anonymous submissions also hide identity in staff payloads; users should choose images that do not themselves reveal information they wish to withhold. Storage keys never appear in list responses. Removing an account deletes its screenshot files as well as metadata.
