# ADR-001: Agent Workflow & Truth‑Keeping

## Context
The *MariaDB Magic* project relies on an autonomous coding agent to generate, modify, and maintain the codebase. To ensure consistency and accountability, the agent must use a single source of truth for all decisions.

## Decision
*The product requirement document (`plan/prd.md`) and the architectural decision records in `docs/adr/` are authoritative.*

- All feature changes must be reflected in `plan/prd.md` before implementation.
- All design decisions that affect the codebase must be recorded (or amended) in an ADR file.
- The agent must verify that any changes are aligned with `plan/prd.md` and the relevant ADRs; if not, it must create or update an ADR before touching the code.
- ADRs are immutable unless the product requirements change.

## Consequences
- AGENT.md serves as the contract for the automated workflow and will reference both the PRD and the ADRs.
- This ensures traceability, auditability, and adherence to project standards.
