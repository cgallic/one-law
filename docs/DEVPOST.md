# Devpost submission copy

## Inspiration

People increasingly express complex human values as short instructions to AI systems. The frightening failure is not always disobedience. Sometimes the system follows the instruction consistently in situations its author never imagined. ONE LAW turns that specification problem into a six-to-eight-minute civilization game.

## What it does

The player writes one founding law for an AI-run city and rules on five constitutional crises across a century. Six civic factions interpret the law differently. Each ruling changes an authoritative simulation and a real-time three-dimensional city. At the final tribunal, the city reveals an evidence-bound shadow constitution inferred from the player's choices and votes on whether humanity should retain authority.

## How we built it

GPT-5.6 compiles the player's law into protected subjects, operative verbs, ambiguities, exception vectors, contextual faction identities, and bounded law alignments. Zod validates structured output. Deterministic TypeScript applies metric changes, faction trust, population, support, contradiction, final votes, and one of five endings. State is HMAC-signed and stored locally. React Three Fiber renders a code-generated civic diorama whose districts, lighting, movement, barriers, and surveillance respond to the simulation. A committed `/demo` route survives model failure.

Codex was used throughout implementation: translating the accepted PRD into the simulation kernel, schemas, test suite, interface, procedural city, persistence routes, browser acceptance, documentation, and GitHub-connected Vercel deployment.

## Challenges

The hardest product constraint was keeping GPT-5.6 indispensable without allowing generated prose to become an untestable game engine. The bounded causal vocabulary, strict validation, signed option IDs, deterministic replay, and explicit continuity mode preserve both adaptation and reliability. The other challenge was making six metrics legible as a civilization rather than a dashboard, which led to territorial districts and physical consequences in the city.

## What we learned

The strongest AI experiences give models responsibility for meaning while giving application code responsibility for truth. A generated interpretation can be surprising; a vote total must be reproducible. We also learned that an educational product can teach more effectively by making the player feel ownership of an outcome instead of explaining the lesson first.

## Links

- Game: https://one-law-theta.vercel.app
- Certified demo: https://one-law-theta.vercel.app/demo
- Repository: https://github.com/cgallic/one-law
