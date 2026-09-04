# theMENTOR / Sofia — Real Platform Planning Docs

Living planning documents for turning the scripted prototype into the real AI-supported
specialist finder. These are decisions and drafts, not final specs — they will keep
changing as more is settled. Every doc carries the date of its last real update.

Started: 2026-09-02.

## Table of contents

1. [Domain Model & Scenarios](01-domain-model.md) — the three scenarios as one content
   pipeline, the core DTOs (Specialist, KnowledgePiece, ServedAnswer, Lead), and the
   confidence-score design.
2. [Architecture & Backend](02-architecture-and-backend.md) — the stack decision
   (Postgres/Supabase + optional Firebase for mobile), the location-matching ladder, the
   live call/escalation flow, and consent & recording rules.
3. [Deferred Decisions](03-deferred-decisions.md) — **read this one if you only read one.**
   Every open question we're not ready to lock in yet — AI provider, avatar rendering,
   voice pipeline, backend residency — with the real options, current research, and what
   it would take to decide.
4. [Phased Build Plan](04-phased-plan.md) — the order we'd actually build this in.

## What's settled vs. open

**Settled:** real backend (no more static-only site), the three scenarios are stages of
one content-maturation pipeline rather than three separate features, matching starts
with radius + the approved widening ladder, confidence score is *computed* (not
hand-authored) from day one, HU is the pilot market with mobile-first as the long-term
target.

**Open:** which LLM vendor(s), how the avatar's mouth moves, whether voice is a unified
speech-to-speech API or a modular STT→LLM→TTS pipeline, and how strict our GDPR/data-
residency posture needs to be. All four are in [Deferred Decisions](03-deferred-decisions.md).
