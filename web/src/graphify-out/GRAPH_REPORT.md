# Graph Report - web/src  (2026-05-16)

## Corpus Check
- 60 files · ~7,729 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 141 nodes · 87 edges · 2 communities detected
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 9|Community 9]]

## God Nodes (most connected - your core abstractions)
1. `request()` - 6 edges
2. `useSystemInfo()` - 2 edges
3. `ApiError` - 2 edges
4. `generateCorrelationId()` - 2 edges
5. `apiGet()` - 2 edges
6. `apiPost()` - 2 edges
7. `apiPut()` - 2 edges
8. `apiDelete()` - 2 edges
9. `RemoteExposedBanner()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `RemoteExposedBanner()` --calls--> `useSystemInfo()`  [INFERRED]
  components/RemoteExposedBanner.tsx → hooks/useSystemInfo.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.36
Nodes (7): apiDelete(), ApiError, apiGet(), apiPost(), apiPut(), generateCorrelationId(), request()

### Community 9 - "Community 9"
Cohesion: 0.5
Nodes (2): RemoteExposedBanner(), useSystemInfo()

## Knowledge Gaps
- **Thin community `Community 9`** (4 nodes): `RemoteExposedBanner()`, `RemoteExposedBanner.tsx`, `useSystemInfo.ts`, `useSystemInfo()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Not enough signal to generate questions. This usually means the corpus has no AMBIGUOUS edges, no bridge nodes, no INFERRED relationships, and all communities are tightly cohesive. Add more files or run with --mode deep to extract richer edges._