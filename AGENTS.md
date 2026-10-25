# AGENTS.md

AI agent context for the pino-zen repository. Read this file before making changes.

## Project

pino-zen — A colored log formatter for Pino JSON logs. Two interfaces: a Pino transport (programmatic) and a CLI tool (stdin pipe).

**Node.js >=22 required. ES modules only (`"type": "module"`).**

## Commands

- `npm run build` — `rm -rf lib && tsc` (the CLI shebang lives in the source and is preserved by tsc)
- `npm run lint` — `biome check` (lint + format + import order) on `src/` and `tests/`
- `npm run format` — `biome check --write` on `src/` and `tests/`
- `npm test` — Runs lint + build + all tests
- `npm start` — Build + pipe `example.txt` through CLI with `-m module`

**Test runner:** Node.js built-in (`node:test` + `node:assert/strict`) with `--experimental-strip-types` — runs TypeScript test files directly.

**Tests** (`tests/`):
- `pino-zen-format.test.ts` — unit tests for `FormatMessage`, imported from `src/`
- `pino-zen-cli.test.ts` — spawns the built `lib/pino-zen-cli.js`
- `pino-zen.test.ts` — runs the built `lib/pino-zen.js` as a real pino transport (pino is a devDependency)

The CLI and transport tests use `lib/`, so they catch ESM/CJS interop bugs that tsc and the unit tests cannot (see sonic-boom below).

**CI:** `.github/workflows/ci.yml` runs `npm test` on Node 22 and 24 for pushes to main and PRs. `publish.yml` is a manual release (version bump, test, tag, `npm publish`) using npm trusted publishing (OIDC, no token; provenance is automatic). Choose `none` to publish the current package.json version without bumping, e.g. to retry a failed publish.

## Source Files

Three files in `src/`, each with a distinct role:

**[src/pino-zen-format.ts](src/pino-zen-format.ts)** — Pure formatting logic. Exported:
- `FormatMessage(inputMessage, opts)` — main formatter; takes log object + `PinoZenOptions`, returns chalk-colored string
- `ResetModuleMetadata()` — resets module color cache + max length (used in tests)
- `PinoZenOptions` interface

**[src/pino-zen.ts](src/pino-zen.ts)** — Pino transport (package entry point). Default export: async function that creates a `SonicBoom` destination + `pino-abstract-transport` stream. Options default to `{}` (pino passes `undefined` for targets without `options`). Re-exports everything from `pino-zen-format.ts`. sonic-boom is CommonJS and its named `SonicBoom` export is not detectable from ESM, so it must be read off the default import — `import { SonicBoom } from 'sonic-boom'` type-checks but fails at runtime.

**[src/pino-zen-cli.ts](src/pino-zen-cli.ts)** — CLI entry point (`bin: pino-zen`). `pipeline(stdin, split2(formatLine), stdout)`: formats each JSON-object line with `FormatMessage`, passes any other line through unchanged. EPIPE (reader closed, e.g. `| head`) exits cleanly. Strict arg parsing: unknown options exit 2 with usage. Supports `-m/--module`, `-h/--help`, `-v/--version`.

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
| INFO  | 30 or 'info'  | green bold (left-padded with a space to align with 5-letter levels) |
| WARN  | 40 or 'warn'  | yellow bold (left-padded with a space to align with 5-letter levels) |
| ERROR | 50 or 'error' | red bold |
| FATAL | 60 or 'fatal' | black on bgRed |

## Module Mode

When `opts.module` is set, the value of that field is used as a bracketed prefix:
- Color is assigned per-module name, cycling through 6 colors (blue, magenta, cyan, blueBright, magentaBright, cyanBright)
- Prefix is right-aligned (padStart) to the longest module name seen so far
- The module field is excluded from the key:value output
- Lines without the module field are padded with spaces so columns stay aligned

CLI flag: `-m <fieldName>` or `--module <fieldName>`

## Field Rendering

Fields `msg`, `time`, `level`, and the module field (if set) are extracted and never shown as key:value pairs. All other fields render as:
- String → `key:grey(value)`
- Number → `key:green(value)`
- Boolean → `key:yellow(value)`
- Object → `key:{ key2:val2 }` (recursive)
- Array → `key:[ val1, val2 ]` (recursive)
- Null → key only, no value
- Error-like object (has a string `stack`) → rendered without `stack`; the stack is appended on new lines after the entry
- Non-string `msg` → rendered as a regular `msg:value` field
- Fields suppressed by `formatter` leave no extra spacing
- Non-object input → `String(input)`

## Build Output

`lib/` contains compiled ES modules:
- `lib/pino-zen.js` — transport (package main + exports)
- `lib/pino-zen-cli.js` — CLI (shebang preserved from source)
- `lib/*.d.ts` — TypeScript declarations

## Code Style

- Biome: 4-space indent, 120-char line width, single quotes, trailing commas, semicolons as needed
- TypeScript strict mode, target ES2022
- No semicolons at end of statements (Biome enforces this)
- Import `.js` extensions in source (ESM resolution)
