# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

pino-zen is a colored log formatter for Pino JSON logs. It provides two interfaces: a Pino transport (programmatic) and a CLI tool (stdin pipe).

## Commands

- `npm run build` — Clean build: tsc to ES modules + add shebang to CLI
- `npm run lint` — Biome linter on src/
- `npm run format` — Biome formatter on src/ (write mode)
- `npm test` — Runs lint, type-check, and unit tests
- `npm start` — Build + pipe example.txt through CLI

## Architecture

Three source files in `src/`, each with a distinct role:

- **pino-zen.ts** — Pino transport. Uses `pino-abstract-transport` + `SonicBoom` to build an async stream transform. Receives parsed log objects from Pino, formats via `FormatMessage`, writes to stdout with backpressure handling. This is the default export and npm package entry point.

- **pino-zen-format.ts** — Pure formatting logic. `FormatMessage()` takes a log object and `PinoZenOptions`, returns a chalk-colored string. Handles level coloring (TRACE=magenta, DEBUG=blue, INFO=green, WARN=yellow, ERROR=red, FATAL=bgRed), message formatting, and recursive value rendering (primitives, arrays, objects) with a consistent color scheme. Fields `msg`, `time`, and `level` are extracted specially; all others are rendered as key:value pairs.

- **pino-zen-cli.ts** — CLI entry point (`bin: pino-zen`). Parses args (`-d` dim, `-r` right-pad, `-l` left-pad, `-e` error-color), reads NDJSON from stdin via `split2`, formats each line with `FormatMessage`, writes to stdout. Falls back to raw text if JSON parse fails.

## Build Output

Compiled output goes to `lib/`. The build uses tsc to produce ES modules:
- `lib/pino-zen.js` — Transport module (package main)
- `lib/pino-zen-cli.js` — CLI with `#!/usr/bin/env node` shebang
- `lib/*.d.ts` — TypeScript declarations

## Code Style

- ES modules (`"type": "module"`)
- Biome: 4-space indent, 120 char line width, single quotes, trailing commas, semicolons as-needed
- TypeScript strict mode targeting ES2022
