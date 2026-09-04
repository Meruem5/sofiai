# Domain Model & Scenarios

_Last updated: 2026-09-02_

## The three scenarios are one pipeline, not three features

> 1. Only AI response available
> 2. AI response improved with specialists' articles
> 3. Specialist available to be reached out to

The key insight from the "specialists correct the AI's draft" idea: every scenario-1
answer is a work item. A specialist claiming and editing it turns it into scenario 2.
Scenario 3 fires when scenario 2 isn't enough. It's a single maturation pipeline with a
seeker-facing view at each stage, plus a second, higher-trust entry point: a live call
transcript can *become* a scenario-2 piece directly, already carrying `own_words`
attestation.

```
                 ┌─────────────────────────────────────────────┐
                 │              KnowledgePiece                  │
                 │                                               │
  user question ─┼─► ai_draft ─► offered ─► claimed ─► published │──► Scenario 2 answers
                 │                  │                             │
                 │                  └─► declined (stays ai_draft) │──► Scenario 1 answers
                 │                                               │
  call transcript┼─────────────────────────► claimed ─► published│──► Scenario 2 (high trust)
                 │  (specialist already spoke it — attestation    │
                 │   is own_words from the start; still reviewed  │
                 │   for PII/privilege before publish)            │
                 └─────────────────────────────────────────────┘

  No published piece clears the confidence bar, or the user explicitly asks for a human
                                    │
                                    ▼
                         Scenario 3: escalation / live hand-off
```

This means the product's core loop is really: **surface AI-drafted gaps to specialists,
make claiming effortless, and route what's left to a live human.** The specialist console
(a to-do list of drafts to fix) is as important as the seeker-facing chat.

## Scenario → data mapping

| Scenario | `ServedAnswer.provenance` | Backing data | Confidence tier meaning |
|---|---|---|---|
| 1. AI only | `ai_only` | No `KnowledgePiece` matched above threshold; answer generated live from the model + general corpus coverage | Usually red/amber — nothing has been human-checked |
| 2. AI + expert content | `ai_plus_expert` | One or more `published` `KnowledgePiece`s retrieved and cited | Can be amber or green — tier reflects *confidence*, not *scenario*. A well-covered scenario-2 topic can outscore a thin one. |
| 3. Reach a specialist | `expert_direct` | Live `Lead`/call session; if it produces a transcript, that transcript can later become a new `KnowledgePiece` | N/A while live — confidence is superseded by direct human contact |

**Provenance and confidence are deliberately separate fields.** The current prototype
conflates them (the traffic light *is* the scenario), which is why Bálint's scenario-2
answer reads green and Tibor's reads amber even though both are the same scenario. Keep
the badge (which scenario) and the meter (how sure, within that scenario) apart.

## Core DTOs

Draft TypeScript shapes — not final, but concrete enough to build against.

### Specialist

```ts
interface Specialist {
  id: string
  displayName: string
  headline: string          // "vízvezeték-szerelő mester"
  bio: string
  avatarUrl?: string
  domains: string[]          // domain/topic tags this specialist covers
  languages: string[]        // BCP-47, e.g. ['hu', 'en']

  serviceArea: {
    mode: 'onsite' | 'remote' | 'either'
    base: {
      countryCode: string    // 'HU'
      postalCode?: string
      settlement: string
      county: string         // megye
      geo: { lat: number; lon: number }
    }
    radiusKm: number | null  // null when mode === 'remote'
    willTravel: boolean
    legalJurisdiction?: string  // separate from travel radius — e.g. Anna is remote-
                                 // capable but bound to Hungarian tenancy law
  }

  verification: {
    status: 'unverified' | 'pending' | 'verified' | 'revoked'
    method?: string          // e.g. 'chamber_registry', 'manual_review'
    verifiedAt?: string
    credentials?: { label: string; issuer: string; url?: string }[]
  }

  availability: {
    presence: 'online' | 'offline' | 'busy'
    acceptsLiveHandoff: boolean
    typicalResponseMinutes: number | null
    lastSeenAt: string
  }

  leadPrefs: {
    acceptsLeads: boolean
    contactModes: ('live_chat' | 'scheduled_call' | 'quote_request')[]
  }

  stats: {
    publishedPieces: number
    claimRate: number        // published / offered, over trailing window
    avgDiffFromDraft: 'minor' | 'substantial' | 'rewritten' | null
  }
}
```

### KnowledgePiece

```ts
type KnowledgePieceStatus =
  | 'ai_draft' | 'offered' | 'claimed' | 'in_review'
  | 'published' | 'declined' | 'rejected' | 'stale'

interface KnowledgePiece {
  id: string
  domain: string
  title: string

  question: {
    text: string
    normalized: string       // for dedup/matching
    embedding: number[]
  }

  sourceType: 'user_question' | 'call_transcript'
  sourceRef?: { leadId: string; specialistId: string }  // present when sourceType is call_transcript

  aiDraft: {
    body: string[]
    model: string
    generatedAt: string
    promptVersion: string
  }

  expertRevision: {
    body: string[]
    diffFromDraft: 'minor' | 'substantial' | 'rewritten'
    editedAt: string
  } | null

  claim: {
    specialistId: string
    attestation: 'own_words' | 'reviewed_and_endorsed'
    claimedAt: string
  } | null

  status: KnowledgePieceStatus
  locality: {
    isLocalityDependent: boolean   // e.g. tenancy law — triggers the known-unknown penalty
    jurisdiction?: string
  }
  version: number
  supersedesId?: string
}
```

A `call_transcript`-sourced piece skips the `ai_draft`/`offered` stages — the specialist
already said it in their own words, so `claim.attestation` is `own_words` from creation.
It still passes through `in_review` before `published`, because a live call can contain
things that shouldn't be published verbatim (client PII, privileged specifics, an
off-the-cuff aside). Review here is redaction/consent-check, not correction.

### ServedAnswer

```ts
interface ServedAnswer {
  provenance: 'ai_only' | 'ai_plus_expert' | 'expert_direct'
  body: string[]
  sources: { pieceId: string; title: string; specialist: string }[]
  confidence: ConfidenceReport
  specialist: { id: string; displayName: string; avatarUrl?: string } | null
  escalation: { offered: boolean; specialistId?: string } | null
}
```

### ConfidenceReport — computed, not authored

Decision: **start with option (ii), compute-only.** Each line is a real signal, not a
typed-in number:

```ts
interface ConfidenceReport {
  pct: number
  tier: 'red' | 'amber' | 'green'
  breakdown: { label: string; value: number }[]
  // internal, not shown to the user, but logged for calibration:
  predictedAt: string
}
```

| Breakdown line | Computed from |
|---|---|
| Szakterületi AI-alap | Corpus coverage/breadth near this question's embedding |
| `{name}` publikált anyaga | Best-matching `published` piece: similarity × recency × attestation weight |
| A források egyetértése | Agreement score across ≥2 retrieved pieces (0 when only one source exists) |
| Helyi szabály, amit nem ellenőrzök (penalty) | Rule-fired when `locality.isLocalityDependent` is true and the user's jurisdiction hasn't been matched |

No specialist-attestation cap yet (that was option iii) — add it once there's enough
claimed-piece volume to know whether the computed score needs capping. Log
`predictedAt` confidence against `expertRevision.diffFromDraft` whenever a claimed piece
gets corrected — that comparison is the calibration signal, and it comes free from data
you're already collecting.

**This is a promise, not just a trust-building UI device.** Because a lawyer is in the
expert set, an over-confident number on a legal question is a liability. Treat the
breakdown lines as things you'd defend if asked, not decoration.

### Lead

```ts
interface Lead {
  id: string
  userId: string
  specialistId: string
  questionId: string
  mode: 'live_chat' | 'scheduled_call' | 'quote_request'
  status: 'offered' | 'accepted' | 'scheduled' | 'completed' | 'declined' | 'expired'
  contactRelease: 'none' | 'on_accept' | 'on_payment'
  recording?: {
    consented: boolean
    transcriptId?: string     // links back to a KnowledgePiece via sourceRef
  }
}
```
