# Angular 21 and PrimeNG 19

The current specification requests Angular 21 and PrimeNG 19. The workspace uses Angular 21.2.24, PrimeNG 19.1.4 and the matching `@primeng/themes` package. PrimeNG 19 declares Angular 19 peers, so this combination is outside its officially supported peer range. Narrow npm overrides resolve only PrimeNG's Angular peers to the workspace versions; no global `legacy-peer-deps` or force flag is used. The npm lockfile remains authoritative.

The existing implementation used PrimeNG 20. Moving to the requested major required replacing its pass-through table attributes with a shared `AccessibleTable` directive. The directive names and focuses the native scroll region without changing table semantics. Theme imports include only the components in use. Production compilation, Vitest and browser tests cover the actual dialogs, confirmations, tables, drawers and toasts. These checks establish observed compatibility, not vendor support; the peer override remains a maintenance limitation.

Prisma 6.19 uses schema-level runtime `DATABASE_URL` and migration `DIRECT_URL`. PostgreSQL migrations are the source of truth. Isolated integration tests require a local database ending in `_test`.

Security maintenance updates Nx within major version 22 and uses Nodemailer 10 for SMTP. Narrow transitive overrides patch vulnerable archive/TOML/UUID/brace-expansion utilities and Prisma CLI's merge utility. Review these overrides when upstream dependencies upgrade.
