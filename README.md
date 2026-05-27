# CMAMSys Frontend

CMAMSys Frontend is a Next.js application for a mathematical modeling team workspace. It provides role-oriented entry points for team management, modeling, programming, and paper writing.

The current writer route integrates the standalone `cmam-editor` LaTeX editor through an iframe. This keeps the main CMAMSys UI independent from the editor service while still giving the paper writer a dedicated LaTeX workspace.

## Main Features

- Login and registration flow backed by local browser storage for development.
- Team creation, current-team selection, and role-based workspace navigation.
- Dashboard and role entry pages for writer, modeler, and programmer workflows.
- `/writer` route as the LaTeX Writer Hub.
- Deprecated rich-text draft writer preserved at `/writer/draft`.
- iframe bridge for `cmam-editor-shell` using a versioned `postMessage` protocol.

## Prerequisites

- Node.js 20+
- pnpm
- Optional: a running `cmam-editor` server and shell for the LaTeX writer route

## Install

```sh
pnpm install
```

## Environment

Create `.env.local` if you want to point the writer page at a custom editor shell:

```sh
NEXT_PUBLIC_CMAM_EDITOR_URL=http://localhost:5173
```

If the variable is missing, the app defaults to `http://localhost:5173`.

## Start

```sh
pnpm dev
```

Open:

```text
http://localhost:3000
```

For the full writer integration, start `cmam-editor` separately:

```sh
cd ../cmam-editor
pnpm dev:server
pnpm dev:shell
```

For Docker-backed PDF compilation in `cmam-editor`, start the editor server with:

```sh
CMAM_COMPILE_BACKEND=docker \
CMAM_COMPILE_DOCKER_IMAGE=cmam-tex:dev \
pnpm dev:server
```

## Writer Integration Flow

1. Login or register in CMAMSys.
2. Create or select a team.
3. Open `/writer`.
4. The page embeds `cmam-editor-shell` from `NEXT_PUBLIC_CMAM_EDITOR_URL`.
5. CMAMSys sends user/team/paper context to the iframe.
6. The editor opens or creates a paper workspace and returns the applied context.

## Known Development Limits

- Auth and team data are local-development implementations.
- `cmam-editor` uses a development token protocol until real SSO/JWT integration is added.
- PDF preview requires a working TeX backend in `cmam-editor`.
