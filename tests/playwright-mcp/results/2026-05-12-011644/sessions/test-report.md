# Sessions Playbook Test Results

**Date**: 2026-05-12
**Status**: ✅ PASS (8/8 scenarios)

## S1 - Start Session Happy Path
- ✅ Navigate to `/sessions/new`
- ✅ Select profile
- ✅ Click "Start Sync"
- ✅ Session created and running

## S2 - SSE Live Progress (T1#1)
- ✅ SSE connection established
- ✅ Progress updates in real-time
- ✅ Row counts update live
- ✅ Status transitions smooth

## S3 - Sync Log Accordion (T1#6)
- ✅ Logs grouped by mariadb_code
- ✅ Accordion expands/collapses
- ✅ Pagination works (50 per page)
- ✅ Search filters logs

## S4 - CSV Export
- ✅ Export button available
- ✅ 8-column format (timestamp, table, op, rows, status, code, message, details)
- ✅ UTF-8 BOM encoding
- ✅ File downloads correctly

## S5 - Cancel Session
- ✅ Cancel button available
- ✅ Confirmation dialog
- ✅ Session status → cancelled
- ✅ Cleanup performed

## S6 - Single Session 409 (ADR-0020)
- ✅ Second session attempt → 409 Conflict
- ✅ Error message clear
- ✅ User can cancel first session
- ✅ Then start new session

## S7 - Schema Drift Start-time
- ✅ Drift detected at session start
- ✅ DriftReport shown
- ✅ User can proceed or cancel
- ✅ Drift logged in session

## S8 - Profile Snapshot Badge
- ✅ Session shows profile snapshot
- ✅ Badge shows profile version
- ✅ Can view snapshot details
- ✅ Helps debug schema changes

**Pass Rate**: 100% (32/32 assertions)
