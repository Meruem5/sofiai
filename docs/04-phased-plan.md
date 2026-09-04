# Phased Build Plan

_Last updated: 2026-09-02_

Order chosen to de-risk the content flywheel first (it's the core mechanic and the
biggest unknown), then matching/escalation, then voice — since voice depends on decisions
still open in [Deferred Decisions](03-deferred-decisions.md).

## Phase 0 — Foundations

- Stand up the Postgres/Supabase backend (EU region), the standalone API service, and
  auth.
- Implement the core DTOs from the [Domain Model](01-domain-model.md) as real schema.
- Migrate the current static prototype's expert data into `Specialist` records — Tibor,
  Bálint, Anna become real rows, not a JS object.

**Exit criteria**: a specialist can log in; a `KnowledgePiece` can be created and read via
the API.

## Phase 1 — The content flywheel (Scenarios 1 & 2)

- Ingestion: a real user question generates an `ai_draft` `KnowledgePiece` (batch LLM
  call — see Deferred Decisions section A for model choice).
- Specialist console: a queue of `offered` pieces, edit/claim/decline actions, computed
  `diffFromDraft`.
- Seeker-facing: replace the scripted `useCallState` answers with real retrieval — a
  question matches against `published` pieces, falls back to a live `ai_draft` when
  nothing matches.
- Confidence: implement the compute-only formula (Domain Model, option ii) end to end,
  including the locality penalty rule.

**Exit criteria**: a real question, asked live, produces either a genuine scenario-1 or
scenario-2 answer with a computed (not hand-typed) confidence score.

## Phase 2 — Matching & escalation (Scenario 3)

- Implement the location-matching ladder (Architecture doc) against real
  `Specialist.serviceArea` data.
- Build the `Lead` flow: offer → accept → scheduled/live, with the callback/availability
  fallback when the ladder exhausts.
- Live call room (LiveKit or Pipecat, per the voice-pipeline decision) as a shared space
  the AI and a specialist can both join.
- Consent-gated recording; a completed call can produce a `call_transcript`-sourced
  `KnowledgePiece`, entering the same review queue as an AI draft.

**Exit criteria**: a real escalation, from "no good answer" through a live specialist
joining, works end to end — including the transcript becoming reviewable content.

## Phase 3 — Voice

Gated on the Hungarian bake-off from Deferred Decisions sections A and C.

- Run the STT/TTS/LLM bake-off; lock the pipeline (or unified API) choice.
- Wire the chosen pipeline into the live call room from Phase 2.
- Replace the current CSS-driven mouth states with Rhubarb Lip Sync (or `lipsync-engine`)
  driving the existing SVG head.

**Exit criteria**: a live voice conversation, in Hungarian, with a transcript accurate
enough to feed Phase 1's content pipeline.

## Phase 4 — Mobile

- Native iOS/Android clients against the same standalone API.
- Firebase Auth + FCM (or the EU-native alternative, if the residency question in
  Deferred Decisions section D resolves that way) for mobile-specific auth and push.
- Offline/sync behavior for the specialist console specifically — claiming and editing
  drafts is the workflow most likely to happen on the go.

**Exit criteria**: a specialist can review and claim a draft from their phone.
