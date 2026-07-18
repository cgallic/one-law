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

GPT-5.6 compiles the player's untrusted one-sentence law into a structured constitution: protected subjects, verbs, ambiguities, exception vectors, contextual faction identities, and bounded alignments for permitted civic actions. Its output is schema-validated. When the model is unavailable, the interface explicitly enters **Simulation continuity mode**; custom text is never silently replaced with a preset.

GPT-5.6 does **not** run the game simulation. Deterministic TypeScript code owns metric changes, faction trust, public support, contradiction, population, final votes, ending selection, replay, and evidence references. The browser submits only an option ID to a server route that verifies a signed run token before applying the ruling.

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

The accepted PRD was retrieved through a Codex/Brain handoff. Codex implemented the deterministic kernel and validation vocabulary, tests, cached scenario, React UI, Three.js city, custom compilation route, signed persistence, recovery, accessibility baseline, procedural sound, evidence-bound result, and export flow. Codex was also used for production builds and browser acceptance.

## Submission status

Built after July 13, 2026 for OpenAI Build Week. Before Devpost submission, add the public deployment URL, public repository URL, demonstration video, and Codex `/feedback` Session ID here.

No emergency scope cuts have been invoked.
