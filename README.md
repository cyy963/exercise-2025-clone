## Exercise 2025

### Requirements

- Node 22.x
- pnpm

### Run

```bash
git clone git@github.com:Overcyte/exercise-2025.git
cd exercise-2025
pnpm i
pnpm db:seed
pnpm dev
```

### Tasks

These tasks aren't leetcode, nor are they difficult. Simple things that show an attention to detail and baseline knowledge of Next, React, Drizzle and Effect.

1. Identify and fix issues where data is not validated or checked before it gets used
   - there are no SQL injections
2. Identify and fix poor database queries and poor data loading patterns
   - while not much of an issue with local sqlite, implement correct indexes
3. Identify and fix poor React performance
4. Refactor the `registerUser` function using [Effect](https://effect.website/).
   - this doesn't need to be perfect, nor use the full Effect toolbox. just a basic understanding of what Effect provides
5. Implement App Router/React features in places that need it, such as suspense and transitions
6. Identify and fix a sensitive data leak issue

Corners have been cut for the sake of boilerplate, and are not issues to be fixed:

- Weak auth system
- `process.env` for environment variables instead of proper server/client separation.

### AI Usage

We use AI tools ourselves, so we're not interested in blocking their usage. We're looking for responsible, methodical usage of these tools, not reckless vibe coding.

If AI is used, include:

- a log of your prompts
- any planning or todo documents
- small description of your methodology when using AI tools
