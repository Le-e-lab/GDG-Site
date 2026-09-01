# KANBAN — GDG Africa University Site

| Task | Status | Owner |
|---|---|---|
| Speed up image loading (preloader + hero marquee) | ✅ Done | Luke |
| Events: location/format columns + badges in UI | ✅ Code done (needs migration) | Luke |
| Events: Zimbabwe-only sync filter | ✅ Done + tested | Luke |
| Remove foreign-chapter events from DB | ⏳ Blocked on migration | Lesley (SQL editor) |
| Approve DevFest Harare | ⏳ Blocked on migration | Lesley (SQL editor) |
| Refresh semester schedule for new semester | ⏳ Blocked on migration | Lesley (SQL editor) |
| Full issue sweep (build/tests/browser) | ✅ Done — all green | Luke |
| Cleanup codebase (no debug logs, no scratch files) | ✅ Done | Luke |

## Blocked on Lesley
Run `supabase/migrations/20260901010000_zim_events_and_schedule.sql` in the Supabase SQL Editor (or `supabase db push` after `supabase login`).