# AGENTS.md

AI agent context for the pino-zen repository. Read this file before making changes.

## Project

pino-zen v3.2.0 — A colored log formatter for Pino JSON logs. Two interfaces: a Pino transport (programmatic) and a CLI tool (stdin pipe).

**Node.js >=18 required. ES modules only (`"type": "module"`).**

## Commands

- `npm run build` — `rm -rf lib && tsc && prepend shebang to pino-zen-cli.js`
- `npm run lint` — Biome linter on `src/`
- `npm run format` — Biome formatter on `src/` (write mode)
- `npm test` — Runs lint + tsc type-check + unit tests
- `npm start` — Build + pipe `example.txt` through CLI with `-m module`

**Test runner:** Node.js built-in (`node:test` + `node:assert/strict`) with `--experimental-strip-types` — runs TypeScript directly, no transpile step needed for tests.

## Source Files

Three files in `src/`, each with a distinct role:

**[src/pino-zen-format.ts](src/pino-zen-format.ts)** — Pure formatting logic. Exported:
- `FormatMessage(inputMessage, opts)` — main formatter; takes log object + `PinoZenOptions`, returns chalk-colored string
- `ResetModuleMetadata()` — resets module color cache + max length (used in tests)
- `PinoZenOptions` interface

**[src/pino-zen.ts](src/pino-zen.ts)** — Pino transport (package entry point). Default export: async function that creates a `SonicBoom` destination + `pino-abstract-transport` stream. Re-exports everything from `pino-zen-format.ts`.

**[src/pino-zen-cli.ts](src/pino-zen-cli.ts)** — CLI entry point (`bin: pino-zen`). Reads NDJSON from stdin via `split2`, formats each line with `FormatMessage`, writes to stdout. Falls back to raw text on JSON parse failure.

## PinoZenOptions Interface

```typescript
interface PinoZenOptions {
    destination?: string | number  // transport only: file path or fd (default: 1 = stdout)
    formatter?: Record<string, false>  // fields to suppress; { fieldName: false } hides that field
    module?: string  // field name to use as module prefix (e.g. 'module' or 'name')
}
```

## Level Colors

| Level | Value | Color |
|-------|-------|-------|
| TRACE | 10 or 'trace' | magenta bold |
| DEBUG | 20 or 'debug' | blue bold |
| INFO  | 30 or 'info'  | green bold (space-padded when no module prefix) |
| WARN  | 40 or 'warn'  | yellow bold (space-padded when no module prefix) |
| ERROR | 50 or 'error' | red bold |
| FATAL | 60 or 'fatal' | black on bgRed |

## Module Mode

When `opts.module` is set, the value of that field is used as a bracketed prefix:
- Color is assigned per-module name, cycling through 6 colors (blue, magenta, cyan, blueBright, magentaBright, cyanBright)
- Prefix is right-aligned (padStart) to the longest module name seen so far
- The module field is excluded from the key:value output

CLI flag: `-m <fieldName>` or `--module <fieldName>`

## Field Rendering

Fields `msg`, `time`, `level`, and the module field (if set) are extracted and never shown as key:value pairs. All other fields render as:
- String → `key:grey(value)`
- Number → `key:green(value)`
- Boolean → `key:yellow(value)`
- Object → `key{ key2:val2 }` (recursive)
- Array → `key[ val1, val2 ]` (recursive)
- Null → key only, no value

## Build Output

`lib/` contains compiled ES modules:
- `lib/pino-zen.js` — transport (package main + exports)
- `lib/pino-zen-cli.js` — CLI with `#!/usr/bin/env node` shebang
- `lib/*.d.ts` — TypeScript declarations

## Code Style

- Biome: 4-space indent, 120-char line width, single quotes, trailing commas, semicolons as needed
- TypeScript strict mode, target ES2022
- No semicolons at end of statements (Biome enforces this)
- Import `.js` extensions in source (ESM resolution)
