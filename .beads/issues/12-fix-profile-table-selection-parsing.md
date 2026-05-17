# Bug: Table Selection Inactive in Profile Edit

## Description
User reports that selecting tables in the profile edit page is "inactive" or not working as expected.

## Root Cause Analysis
In `internal/sync/closure.go`, the `ExpandFromSelection` function attempts to unmarshal `selection_json` directly into a `[]string`. However, the project standard (defined in `models.TableSelection`) saves this field as an object: `{"tables": ["t1", "t2"]}`.

This causes the unmarshaling to fail (silently or into an empty slice), resulting in an empty selection set being returned to the frontend. The frontend then displays all tables as unselected, even after the user has saved their selection.

## Proposed Fix
Update `internal/sync/closure.go` to use `models.TableSelection` for unmarshaling `selection_json`. This will ensure compatibility with both the object format and the legacy array format (thanks to `TableSelection.UnmarshalJSON`).

## Impact
- Fixes profile configuration UI.
- Ensures closure advisor correctly identifies dependent tables.

## Additional Finding: Data Loss in Profile Update
The `ProfilesHandler.Update` function in `internal/api/profiles.go` does not preserve existing fields like `Status`, `ColumnPairingsJSON`, and `RulesJSON`. When a user updates the table selection, these fields are wiped out because they are not copied from the `existing` profile to the new struct passed to `repo.Update`.

## Updated Proposed Fix
1. Fix `ExpandFromSelection` in `internal/sync/closure.go` (as previously planned).
2. Refactor `ProfilesHandler.Update` in `internal/api/profiles.go` to properly merge changes into the existing profile object, ensuring no data loss for `Status`, `ColumnPairingsJSON`, and `RulesJSON`.

## Additional Finding: Broken Collision Detection in MarkReady
The `MarkReady` handler in `internal/api/profiles.go` has two major flaws:
1. It attempts to expand the closure using empty schemas, failing to pull in advisor-added tables for collision checking.
2. It filters tables based on roles `"child"` or `"root"`, but `ClosureAdvisor` uses roles `"user_selected"` and `"advisor_added"`. This results in zero tables being checked for collisions.

## Updated Proposed Fix
1. Fix `ExpandFromSelection` in `internal/sync/closure.go`.
2. Refactor `ProfilesHandler.Update` in `internal/api/profiles.go` to preserve data.
3. Fix `ProfilesHandler.MarkReady` in `internal/api/profiles.go` to use real schemas and correct role names for collision detection.
