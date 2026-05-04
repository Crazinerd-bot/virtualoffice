# OpenClaw Mission Control

A production-oriented virtual office for OpenClaw agents.

## What it is

This app is the visual shell for a modern Mission Control experience:
- animated agent avatars in a shared office map
- live right-rail activity stream
- task board with progress
- document surface showing what each agent is touching
- gateway/session status visibility

Current build status:
- working React + Vite + TypeScript app
- PixiJS office canvas rendering live agent sprites
- modern dashboard layout, no placeholder landing-page content
- local mock data seeded from current workspace agent context

## Stack

- React 19
- TypeScript
- Vite
- PixiJS with `@pixi/react`
- Zustand for state
- Lucide icons

## Run

```bash
cd openclaw-office
npm install
npm run dev
```

## Production build

```bash
cd openclaw-office
npm run build
```

## Deployment target

- subdomain: `office.esportsza.co.za`
- external access should be gated by reverse-proxy auth before the app loads
- the app also includes an in-app login screen for admin-only entry flow

## Next implementation steps

1. Replace mock store hydration with live OpenClaw task/session feeds.
2. Add websocket or SSE bridge for realtime session/task updates.
3. Add per-agent interaction drawer, task detail modals, and document previews.
4. Finalize reverse proxy, TLS, audit trail, and runtime secret handling for the subdomain.
5. Add sprite sheets and richer office interactions without sacrificing performance.

## Notes

The previous `openclaw-office` folder was only a stub with `data/gateway-status.json`. It has now been replaced by a functioning frontend foundation.
