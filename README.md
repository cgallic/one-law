# ONE LAW

> Write one sentence. Watch a civilization obey it perfectly.

ONE LAW is a replayable browser strategy game made for OpenAI Build Week's Education track. The player writes one law for an AI-run city, rules on five constitutional crises across a century, and discovers the shadow constitution their decisions taught the city.

## Run locally

Requirements: Node.js 20+.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. `/play` is the custom-law experience and `/demo` is the fully cached judge route. The certified demonstration does not need an API key.

```bash
npm test
npm run build
```

## What GPT-5.6 does

GPT-5.6 compiles the player's untrusted one-sentence law into a structured constitution: protected subjects, verbs, ambiguities, exception vectors, contextual faction identities, and bounded alignments for permitted civic actions. After five rulings, GPT-5.6 reconstructs an operative constitution whose clauses must cite actual decision eras. Both outputs are schema-validated. If initial compilation is unavailable, the custom run stops honestly and offers the certified demo; custom text is never silently replaced with a preset.

GPT-5.6 does **not** run the game simulation. Deterministic TypeScript code owns metric changes, faction trust, public support, contradiction, population, final votes, ending selection, replay, and evidence references. The browser submits only an option ID to a server route that verifies a signed run token before applying the ruling.

The production default uses GPT-5.6 Luna to compile the constitution and synthesize the final evidence-bound tribunal through Vercel AI Gateway's short-lived OIDC authentication. Five evolving crisis-language calls use the less expensive GPT-5.4 mini while remaining constrained by the GPT-5.6 constitution and deterministic causal validator. Calls are bounded to 1,200–1,400 output tokens; `/demo` makes none. This keeps GPT-5.6 central at the two decisive semantic moments without charging frontier-model rates for every era.

## Reliability and privacy

- No account or database.
- Runs are stored locally and can be erased from the result screen.
- Server state is HMAC-signed with `GAME_STATE_SECRET`.
- The API key remains server-only.
- Custom input is normalized and screened for injection patterns and disallowed content.
- `/demo` is committed fallback content and remains playable without OpenAI access.

## Technology

Next.js 16, React 19, TypeScript, React Three Fiber, Three.js, OpenAI JavaScript SDK, Zod, Vitest, and `html-to-image`. The city and audio are generated in code; no third-party art, music, or trademarks are used. MIT licensed.

## Codex collaboration

All repository work began during the July 13–21, 2026 submission period; the dated Git history and primary Codex thread provide the evidence. The accepted PRD was retrieved through a Codex/Brain handoff.

Codex accelerated the project by implementing the deterministic kernel and bounded option validator, writing the test suite, scaffolding the Next.js routes, iterating on the Three.js civilization, diagnosing browser behavior, building signed recovery, and connecting GitHub to Vercel. The primary thread also performed repeated production builds and full browser runs.

The entrant retained the key product and design decisions: the one-sentence premise, Education track, five-era dramatic structure with law-specific crises, deterministic/model boundary, six faction archetypes, five ending families, evidence-bound shadow constitution, brutalist civic-maquette direction, and the later decision to replace graph-like output with a Civilization-inspired inhabited world.

GPT-5.6 is indispensable where fixed application logic cannot substitute for semantic interpretation: it turns an arbitrary player law into protected subjects, verbs, ambiguities, exception vectors, contextual faction identities, and bounded action alignments, then reconstructs the operative constitution from the five cited rulings. Those alignments influence every deterministic decision and the final tribunal. The model cannot mutate state, fabricate evidence eras, vote, or select the ending.

See [Competition Compliance](docs/COMPETITION-COMPLIANCE.md) for the rule-by-rule audit and [Third-party Notices](docs/THIRD-PARTY-NOTICES.md) for dependency licensing.

## Submission status

Built after July 13, 2026 for OpenAI Build Week.

- Repository: https://github.com/cgallic/one-law
- Public game: https://one-law-theta.vercel.app
- Certified judge route: https://one-law-theta.vercel.app/demo

Before Devpost submission, add the demonstration video and Codex `/feedback` Session ID here.

No emergency scope cuts have been invoked.
