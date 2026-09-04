# Architecture & Backend

_Last updated: 2026-09-02_

## Stack decision

**Core data + retrieval: Postgres with `pgvector`, hosted EU (Frankfurt), via Supabase.**
Plain self-hosted Postgres is the fallback if the GDPR posture needs to be maximal (see
[Deferred Decisions](03-deferred-decisions.md) — this is a compliance question with
gradations, not a plain yes/no).

Why not Firebase for the core: Firestore's vector search is real and production-ready,
but it caps out lower (768 recommended dims) and gets read-expensive at scale; and it has
no server-side joins, which fights the shape of a multi-stage review/claim workflow
(`KnowledgePiece` status transitions touching `Specialist` and `Lead`) — that workflow is
relentlessly relational. Supabase/Postgres also comfortably covers pgvector at the
tens-of-thousands-to-low-millions scale this platform will actually see for years.

Where Firebase *is* the right tool: **Auth, FCM push, and offline sync for the eventual
native mobile apps** — nothing in the Postgres/Supabase world matches Firebase there. The
likely end state is hybrid: Postgres/Supabase owns specialists, knowledge pieces,
workflow state, and vector search; Firebase (or an EU-native equivalent, if residency
purism wins out) owns mobile auth and push. Full comparison and the residency nuance are
in Deferred Decisions.

**API layer: a standalone service, not folded into the web app.** Mobile-first is a
stated long-term goal — if the API only exists as Next.js route handlers today, a native
app rewrite is forced later. One Node service (Fastify/NestJS), deployed in the EU,
consumed by both the web app and, eventually, native clients.

**Keep GitHub Pages** for the current static prototype/marketing site. The real app gets
its own backend and, likely, its own frontend host once it needs a database connection.

## Location matching — the widening ladder

Decisions locked in: match by **radius** (store lat/lon, not just postal code), user's
area is irrelevant when they explicitly want a remote specialist, and when the ladder
exhausts with no live match, **offer a callback request or show availability/contact
options** rather than a dead end.

```
1. Same settlement (town/city)
2. Same megye (county)
3. Neighbouring megyék
4. Országos (nationwide)
5. Remote-capable, anywhere
```

Each rung is a query; stop at the first rung with a viable candidate. Two shortcuts:

- If the **seeker** explicitly wants a remote specialist, skip straight to rung 5.
- If a **specialist's** `serviceArea.mode` is `remote`, they're only ever considered at
  rung 5 regardless of physical distance — but a `legalJurisdiction` check still applies
  independently of that (an onsite-irrelevant lawyer can still be jurisdiction-irrelevant
  to a given user).

When the ladder exhausts: don't dead-end the way the prototype's "Tibor nem válaszol"
does today. Offer, in order of what's available: request a callback (queue + notify on
specialist availability), show a scheduled-call option, or surface contact details per
the specialist's `leadPrefs.contactModes`. Exact UX/copy for this is a small open item —
tracked in Deferred Decisions.

## Live call / escalation flow

Scenario 3, done for real, is one shared call room rather than two separate systems:
Sofia (the AI) is a participant in a room the user is already in; on escalation, the
specialist joins the same room and the AI steps back — the literal mechanic from the
original slide. This needs a WebRTC room abstraction (LiveKit or Pipecat — see Deferred
Decisions for the pipeline-vs-unified-API tradeoff that also determines this).

## Consent & recording

Because a completed call transcript is one of the two entry points into the
`KnowledgePiece` pipeline (see [Domain Model](01-domain-model.md)), recording is a first-
class, not incidental, feature — but it needs a real consent gate, not an assumed one:

- Explicit, per-call consent from both the user and the specialist before recording
  starts. Hungarian/EU rules require both parties to consent.
- Specialist-level opt-in (a setting on `Specialist`, not just a per-call checkbox) —
  someone who never wants calls recorded should never be prompted.
- No auto-publish. Every transcript enters the same `in_review` stage as an AI draft,
  specifically to redact client PII and anything privileged.
- Extra care for privilege-bound domains (Anna's tenancy-law calls) — review for those
  should be stricter than for e.g. Bálint's plumbing calls.
