# ERRORS — Backend/DB Registry

## Resolved
- (none logged this session)

## Pending
- [ ] **Migration not applied**: `supabase/migrations/20260901010000_zim_events_and_schedule.sql` must be run by Lesley (elevated access required — anon key cannot DDL/delete).
  - Adds `events.location_type` + `events.location`
  - Deletes Pretoria / Lusaka / Flutter & Friends / gdg-lusaka events
  - Approves DevFest Harare
  - Refreshes `semester_plan` (13 weeks, mostly online)