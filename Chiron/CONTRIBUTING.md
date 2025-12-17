# Contributing

## Branching
- main: protected, deployable
- feat/*: new features
- fix/*: bug fixes

## Workflow
- Create an issue for each task; assign an owner
- Open a PR early (draft), keep commits scoped
- Request review from a teammate
- Merge with squash after approval and CI pass

## Local Dev
- Node 18+
- `cd web && pnpm i && pnpm dev`
- Add a `.env` in `web/` using `.env.example`

## Code Style
- TypeScript strict mode
- Small components, clear props
- Keep Firebase logic in `src/lib` or `src/services`

