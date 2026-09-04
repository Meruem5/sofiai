# Deferred Decisions

_Last updated: 2026-09-02 — research pass complete, nothing below is locked in yet._

Four open questions, each with real options, current research, and what it would take to
actually decide. Read top-to-bottom or jump to the one you care about.

- [A. Which AI model(s)](#a-which-ai-models)
- [B. Avatar rendering / lip-sync](#b-avatar-rendering--lip-sync)
- [C. Voice pipeline & Hungarian speech](#c-voice-pipeline--hungarian-speech)
- [D. Backend residency: Firebase, Supabase, or self-host](#d-backend-residency-firebase-supabase-or-self-host)
- [E. Small open items](#e-small-open-items)

**The one fact that cuts across all four**: no vendor — LLM, STT, or TTS — publishes
Hungarian-specific quality numbers. Every recommendation below is a reasonable starting
point *pending a real Hungarian bake-off*, not a final answer. Budget a day for that
before locking any of A or C in.

---

## A. Which AI model(s)

Not one model — four different jobs with different cost/latency/quality needs.
Prices below are per 1M tokens, researched September 2026; several are explicitly
time-limited promotional pricing (noted where relevant) and should be re-checked against
the vendor's own pricing page before committing.

| Provider / tier | Model | Input / Output $ | Context | EU data posture |
|---|---|---|---|---|
| Anthropic | Opus 5 | $5 / $25 | 1M | DPA available; no confirmed EU-only region |
| Anthropic | Sonnet 5 | $2 / $10 | 1M | same |
| Anthropic | Haiku 4.5 | $1 / $5 | 200K | same |
| OpenAI | GPT-5.6 Sol (flagship) | $4 / $20 *(promo, expires ~2026-11-21)* | not published | EU residency for API/Enterprise since 2025 |
| OpenAI | GPT-5.6 Terra (mid) | $2 / $12 | not published | same |
| OpenAI | GPT-5.6 Luna (small/fast) | $0.20 / $1.20 | not published | same |
| OpenAI | Realtime API (voice) | $32 / $64 per MTok audio | — | included in EU residency scope per OpenAI |
| Google | Gemini 3.1 Pro | $2 / $12 (≤200K), $4 / $18 (>200K) | 1M | Google Cloud EU regions selectable |
| Google | Gemini 3.7/3.8 Flash | $0.75 / $3.75 *(promo, then $1.50/$7.50)* | 1M | same |
| Google | Gemini 3.5 Flash-Lite | $0.30 / $2.50 | 1M | same |
| Google | Grounding-with-search tool | $14 / 1,000 grounded queries | — | closest purchasable equivalent to "AI Overviews" |
| **Mistral** | Large 3 | $0.50 / $1.50 *(one aggregator said $2/$6 — verify)* | 256K | **EU-native infra by default** — the only frontier lab where this is true, not opt-in |

**"What does Google's AI Overview use?"** — there's no separate off-menu model. It's
described only as "a custom Gemini model" layered with Google's own retrieval; the
nearest thing you could actually buy is Gemini (Flash or Pro) plus the grounding-with-
search tool above. Don't chase a specific "Search Gemini" SKU — it isn't sold.

**Recommendation by job:**

| Job | Pick | Why |
|---|---|---|
| Intent/domain routing | Haiku 4.5, Gemini 3.5 Flash-Lite, or GPT-5.6 Luna | All cheap enough that reliability matters more than price — pick whichever your eval scores best on Hungarian intent classification |
| Live voice conversation | Whatever you pick for routing above, or Opus 5/Gemini 3.1 Pro if quality on nuanced questions matters more than shaving latency | Depends on the voice pipeline decision in section C |
| Async draft-improvement (batch, quality > speed) | Opus 5, Gemini 3.1 Pro, or GPT-5.6 Sol, all via batch discount (~50% off) | Nobody's waiting; spend the money on quality |
| Contradiction/agreement judge | Haiku 4.5, Gemini 3.5 Flash-Lite, or GPT-5.6 Luna | Well-defined, high-volume, low-creativity — small model territory, but validate against a Hungarian gold set first |

**GDPR angle worth taking seriously**: Mistral is the only vendor here where EU hosting
is the default, not a configuration you opt into. Given Anna's legally-privileged content
specifically, it's worth running Mistral in the bake-off even before knowing its raw
Hungarian quality — the compliance posture alone earns it a seat at the table.

**What it would take to decide**: a same-day bake-off. Take ~20 real Hungarian questions
across the three domains (strategy, plumbing, tenancy law), run them through 3-4
candidate models, and have someone who actually speaks Hungarian (or the specialists
themselves) score fluency and correctness. This is cheap to run and removes the guesswork
that every vendor's own docs currently leave open.

---

## B. Avatar rendering / lip-sync

You pointed at [lemonslice.com/pricing](https://lemonslice.com/pricing). Here's the fuller
landscape, split by whether a tool is built for *live conversation* or *pre-rendered
video* — that distinction matters a lot, since a batch-video tool can't drive a live call.

| Tool | Type | Pricing | Latency | Maintained? |
|---|---|---|---|---|
| **Lemon Slice** | Live conversational avatar (photo → live video) | $7–$200/mo tiers; overage $0.22/min + $0.09/min hosted avatar | ~471ms (self-reported) | Yes — $10.5M seed Dec 2025, active |
| Simli | Live avatar API | ~$0.009/min | <300ms video | Yes — active LiveKit/Pipecat integrations |
| HeyGen Interactive Avatar | Live streaming avatar | ~$0.10–0.20/min | not documented | Yes |
| D-ID Agents/Streams | Live conversational avatar | ~$5.90/min | not documented | Yes |
| Tavus (CVI) | Live conversational video | $59/mo + $0.32–0.37/min overage | not documented | Yes |
| Hedra Live Avatars | Live streaming avatar | $0.05/min | sub-100ms (via LiveKit) | Yes — launched Jul 2025 |
| sync.so (Synclabs) | **Pre-rendered** lip-sync only | $0.04–0.13/sec | N/A (batch) | Yes, but wrong category for a live call |
| **Rhubarb Lip Sync** | Open-source: audio → viseme timeline, drives your own mouth-shape art | Free, self-hosted | Near-zero (local) | **Yes** — commits as recent as June 2026 |
| lipsync-engine (Amoner) | Open-source: browser AudioWorklet viseme detector | Free | Near-zero | Newer, smaller, worth a look |
| Wav2Lip (and the raw upstream repo) | Photoreal ML lip-sync | Free but | — | **Effectively unmaintained upstream** — avoid; sync.so is its maintained commercial descendant |

**Recommendation: don't switch to a photoreal service yet.** The current SVG head
(`PersonaHead.jsx`) plus **Rhubarb Lip Sync** (or the lighter `lipsync-engine`) driving
pre-defined mouth-shape states costs nothing per-minute, adds no network latency, is
actively maintained, and — importantly for a product built on a calibrated-trust pitch —
doesn't risk the uncanny-valley "is this a real synthetic video of a real named
specialist" problem that a photoreal service raises for Bálint or Anna's face.

**If a photoreal tier is wanted later** (e.g. a premium "meet your specialist live"
feature), Hedra ($0.05/min, sub-100ms) and Simli ($0.009/min, <300ms) are the cheapest
live-capable options; Lemon Slice is well-funded and polished but priced for lower
volume. Worth prototyping against Lemon Slice specifically once there's a concrete
feature to justify it, per your own note that you want more research/prototyping there.

---

## C. Voice pipeline & Hungarian speech

Your ask: voice-to-voice, but **keep the transcript** — because a transcript is now also
a content-pipeline input (per your idea in section A of the domain model: a call
transcript can become a claimable article). That requirement pushes the decision.

### The two shapes

**Unified speech-to-speech** (audio in, audio out, one model): OpenAI Realtime,
Google Gemini Live, Amazon Nova Sonic. Simpler integration, lower latency by design.

**Modular pipeline** (STT → LLM → TTS, orchestrated separately): more integration work,
lets you pick best-in-class Hungarian components independently, and — critically — gives
you a transcript you generated and can validate, rather than one the model hands you as a
side effect.

| Unified option | Price (~per min) | Transcript given? | Hungarian quality documented? |
|---|---|---|---|
| OpenAI Realtime (gpt-realtime-2) | ~$0.05–0.10 (audio tokens) | Yes, both sides — **but** community reports and OpenAI's own guidance flag the transcript as a separate async pass that can diverge from the actual audio, especially across interruptions | No — 70+ languages listed, no HU-specific number |
| Gemini Live API | ~$0.005 in / $0.018 out | Yes, explicitly documented as accurate bidirectional transcripts | Not confirmed for Hungarian specifically |
| Amazon Nova Sonic | ~$0.003–0.014 | Partial — mainly user-side, for tool-calling | Not documented |

**This is the deciding fact**: the one thing you explicitly need (a trustworthy
transcript) is the thing OpenAI's own docs and users flag as unreliable in their unified
API. Gemini Live's transcript claim is stronger on paper but unverified for Hungarian.
Given that, **lean toward the modular pipeline** — you own the transcript, so you can
measure and fix it, rather than inheriting an opaque model's side-channel.

### The Hungarian Whisper model you found

[`sarpba/whisper-base-hungarian-soup`](https://huggingface.co/sarpba/whisper-base-hungarian-soup)
— checked directly: it's a weight-averaged merge of two small community Whisper-base
fine-tunes. WER 22.9–24.1% on FLEURS, degrading to 40% on noisy audio (mediocre — a
production Hungarian STT should be doing meaningfully better than that). Only 133
downloads/month, 2 likes — a low-traffic upload, not something with community validation
behind it. The license is also ambiguous ("commercial use not permitted without
contribution"). **Recommend against building on this one.**

### Better modular components for Hungarian

| Stage | Options | Notes |
|---|---|---|
| STT | **Deepgram Nova-3** (explicitly Hungarian-tuned, sub-300ms, actively maintained) | Best-documented Hungarian claim found |
| STT | Whisper large-v3/v3-turbo, self-hosted | No confirmed HU WER — validate empirically before trusting |
| STT | Azure AI Speech (hu-HU), Google Cloud STT | Actively maintained, coverage confirmed, accuracy not itemized for HU |
| TTS | ElevenLabs Flash v2.5 | Hungarian in its 32-language set, ~75ms latency, ~$50/1M chars |
| TTS | Azure Neural (hu-HU-NoemiNeural / TamasNeural) | Cheaper (~$16/1M chars), solid, less expressive |
| Orchestration | **LiveKit Agents** or **Pipecat** | Both actively maintained through 2026 (near-daily commits on Pipecat); either is a reasonable pick — LiveKit edges ahead on telephony/scale, Pipecat has the larger integration library |

**What it would take to decide**: the same Hungarian bake-off from section A, extended to
speech — run Deepgram, Azure, and self-hosted Whisper large-v3 against real HU audio
clips from your domains (including Bálint's plumbing jargon and Anna's legal terms), and
score both raw WER and how the transcript reads once punctuated. Cheap, and it directly
de-risks the transcript-to-article idea.

---

## D. Backend residency: Firebase, Supabase, or self-host

Addressing directly: Firebase wasn't left out by oversight, but it's fair to want the
comparison spelled out.

| | Firebase/Firestore | Supabase (Postgres) | Self-hosted Postgres, EU |
|---|---|---|---|
| Vector search | Real, production-ready, but capped ~768 dims recommended and gets read-expensive at scale | pgvector, production-grade to 10M+ vectors with HNSW | Same as Supabase, you run it |
| Relational/workflow fit | Weak — no server-side joins, denormalize by hand, N+1-prone for a multi-stage review workflow | Strong — it's Postgres | Strong |
| EU data residency | `eur3` exists for Firestore itself, but Auth/Functions/FCM don't carry the same guarantee; Google is a US entity (CLOUD Act exposure regardless of region) | Frankfurt and other EU regions standard; still a US-incorporated company | Fully avoids CLOUD Act exposure — the only option that does |
| Mobile strengths | Best-in-class: Auth, FCM push, offline sync, Crashlytics | Solid SDKs (Flutter/Swift/Kotlin/RN) but not mobile-native the way Firebase is | Whatever you build |
| Cost at moderate scale | Pay-as-you-go, ~$50–200+/mo and grows fast with usage | Pro plan $25/mo + overage, reported 3–5x cheaper at moderate volume | Infra cost only, plus ops time |
| Company health | N/A (Google) | $200M Series D, ~$2B valuation, but had a real ~3.7hr outage Feb 2026 | N/A |

**Verdict, unchanged by the deeper research**: Postgres/Supabase for the data-heavy core
(specialists, knowledge pieces, workflow, vector search); Firebase Auth + FCM layered on
top purely for mobile push/offline once native apps exist — using each for what it's
actually good at, rather than picking one dogmatically.

**The open part**: if strict data-residency (no US-entity involvement at all) turns out
to be a hard requirement rather than a nice-to-have, the answer changes to **fully
self-hosted Postgres in an EU-only cloud** — Supabase-as-a-company is still a CLOUD-Act-
exposed US entity even when the servers sit in Frankfurt. That's a legal/compliance call,
not a technical one — flagging it here rather than deciding it.

---

## E. Small open items

- **Exact UX for the escalation dead-end** (section 02, matching ladder): "ask for a
  callback, or show availability/contact options" is decided in principle; the specific
  copy, which option is offered first, and whether it differs by `leadPrefs.contactModes`
  still needs a pass once there's a specialist console to design it against.
- **When to add the specialist-attestation cap** to the confidence formula (domain model,
  option iii from the original discussion) — deferred until there's enough claimed-piece
  volume to know if the pure-computed score needs capping.
