# Pino-Zen Guide

## Overview

**pino-zen** is a colored, human-readable log formatter for [Pino](https://getpino.io) JSON logs. During development, Pino emits compact NDJSON that is efficient for machines but hard for humans to scan. pino-zen transforms each log line into a colorized, structured output that lets you spot log levels, messages, and fields at a glance [[1]](https://github.com/jamestalton/pino-zen/blob/3fa6ec16cc154bee8ffd66fda60464a25fd1c9b9/README.md#L1-L3).

The package ships as a single npm module that operates in **two modes** — use whichever fits your workflow:

| Mode | How it works | Best for |
|------|-------------|----------|
| **Pino Transport** | Loaded in-process via Pino's `transport` option | Projects where you want formatting built into the app |
| **CLI Pipe** | Pipe any Pino NDJSON output to the `pino-zen` binary | Ad-hoc debugging, scripts, or existing apps you can't modify |

Both modes share identical formatting behavior [[2]](https://github.com/jamestalton/pino-zen/blob/3fa6ec16cc154bee8ffd66fda60464a25fd1c9b9/AGENTS.md#L7).

### Key Benefits

- **Color-coded log levels** — TRACE through FATAL each have a distinct color, making severity instantly recognizable [[3]](https://github.com/jamestalton/pino-zen/blob/3fa6ec16cc154bee8ffd66fda60464a25fd1c9b9/AGENTS.md#L44-L53).
- **Module prefixes with color cycling** — Assign a field (such as `name` or `module`) as a colored, right-aligned module prefix to distinguish log sources across a mixed-component stream [[4]](https://github.com/jamestalton/pino-zen/blob/3fa6ec16cc154bee8ffd66fda60464a25fd1c9b9/README.md#L66-L68).
- **Field suppression** — Hide noisy fields like `pid` or `hostname` without touching your application code [[5]](https://github.com/jamestalton/pino-zen/blob/3fa6ec16cc154bee8ffd66fda60464a25fd1c9b9/README.md#L99-L101).
- **Human-friendly field rendering** — Strings, numbers, booleans, objects, and arrays are each rendered with type-appropriate colors and formatting, making structured log data easy to read inline [[6]](https://github.com/jamestalton/pino-zen/blob/3fa6ec16cc154bee8ffd66fda60464a25fd1c9b9/AGENTS.md#L64-L72).

## Prerequisites

Before getting started, make sure your environment meets the following requirements:

- **Node.js ≥ 18** — pino-zen requires Node.js version 18 or later [[7]](https://github.com/jamestalton/pino-zen/blob/3fa6ec16cc154bee8ffd66fda60464a25fd1c9b9/AGENTS.md#L9).
- **ES Modules** — Your project must use ES module syntax. Ensure `"type": "module"` is set in your `package.json` [[7]](https://github.com/jamestalton/pino-zen/blob/3fa6ec16cc154bee8ffd66fda60464a25fd1c9b9/AGENTS.md#L9).
- **Pino** — pino-zen is a formatter for [Pino](https://getpino.io) logs. You should already have Pino installed and be familiar with its basic usage for transport mode. CLI mode works with any process that emits Pino-formatted NDJSON.
- **Basic command-line knowledge** — Required for CLI pipe mode, which involves piping process output in a terminal.

## Installation

Choose the installation method that matches how you intend to use pino-zen [[8]](https://github.com/jamestalton/pino-zen/blob/3fa6ec16cc154bee8ffd66fda60464a25fd1c9b9/README.md#L7-L13):

```sh
# Add as a project dependency (transport or CLI within a project)
npm install pino-zen

# Install globally to use the CLI from anywhere
npm install -g pino-zen

# Run once without installing
npx pino-zen
```

- Use **`npm install pino-zen`** when integrating pino-zen as a Pino transport inside your Node.js application.
- Use **`npm install -g pino-zen`** to make the `pino-zen` CLI available system-wide for piping any Pino output.
- Use **`npx pino-zen`** for a quick, no-install trial or in CI environments where you don't want a permanent dependency.

## Configuration

All pino-zen behavior is controlled through the `PinoZenOptions` interface, which is shared by both the transport and the CLI [[9]](https://github.com/jamestalton/pino-zen/blob/3fa6ec16cc154bee8ffd66fda60464a25fd1c9b9/src/pino-zen-format.ts#L8-L12).

### PinoZenOptions Interface

```typescript
interface PinoZenOptions {
    destination?: string | number  // transport only: file path or fd (default: 1 = stdout)
    formatter?: Record<string, false>  // fields to suppress; { fieldName: false } hides that field
    module?: string  // field name to use as module prefix (e.g. 'module' or 'name')
}
```

[[10]](https://github.com/jamestalton/pino-zen/blob/3fa6ec16cc154bee8ffd66fda60464a25fd1c9b9/AGENTS.md#L34-L42)

| Option | Type | Description |
|--------|------|-------------|
| `destination` | `string \| number` | **Transport only.** Output file path or file descriptor. Defaults to `1` (stdout). Use this to redirect formatted output to a file or custom fd [[11]](https://github.com/jamestalton/pino-zen/blob/3fa6ec16cc154bee8ffd66fda60464a25fd1c9b9/README.md#L41-L47). |
| `formatter` | `Record<string, false>` | Fields to suppress from output. Set any field name to `false` to hide it — e.g., `{ pid: false, hostname: false }` [[12]](https://github.com/jamestalton/pino-zen/blob/3fa6ec16cc154bee8ffd66fda60464a25fd1c9b9/src/pino-zen-format.ts#L133-L136). |
| `module` | `string` | The name of a log field to use as a color-coded, right-aligned module prefix. Enables [module mode](#module-mode) [[4]](https://github.com/jamestalton/pino-zen/blob/3fa6ec16cc154bee8ffd66fda60464a25fd1c9b9/README.md#L66-L68). |

### Log Level Colors

pino-zen renders each log level in a distinct color to make severity immediately visible [[3]](https://github.com/jamestalton/pino-zen/blob/3fa6ec16cc154bee8ffd66fda60464a25fd1c9b9/AGENTS.md#L44-L53) [[13]](https://github.com/jamestalton/pino-zen/blob/3fa6ec16cc154bee8ffd66fda60464a25fd1c9b9/src/pino-zen-format.ts#L35-L58):

| Level | Numeric Value | String Value | Color |
|-------|--------------|--------------|-------|
| TRACE | `10` | `'trace'` | Magenta bold |
| DEBUG | `20` | `'debug'` | Blue bold |
| INFO  | `30` | `'info'`  | Green bold |
| WARN  | `40` | `'warn'`  | Yellow bold |
| ERROR | `50` | `'error'` | Red bold |
| FATAL | `60` | `'fatal'` | Black on red background |

Both numeric and string level values are recognized, so pino-zen works with both standard Pino output and any custom level serialization [[13]](https://github.com/jamestalton/pino-zen/blob/3fa6ec16cc154bee8ffd66fda60464a25fd1c9b9/src/pino-zen-format.ts#L35-L58).

## Quick Start

### Mode 1: Pino Transport (In-App)

Use this mode when you want pino-zen integrated directly into your Node.js application as a Pino transport. The formatter runs in a separate worker thread managed by Pino's transport system.

#### Basic Setup

Pass `"pino-zen"` as the transport target [[14]](https://github.com/jamestalton/pino-zen/blob/3fa6ec16cc154bee8ffd66fda60464a25fd1c9b9/README.md#L15-L25):

```js
import pino from "pino"

const logger = pino({
  transport: {
    target: "pino-zen",
  },
})

logger.info("Hello from pino-zen!")
```

#### With Multiple Targets

Combine pino-zen with other transports — for example, to write structured JSON to a file while displaying formatted output in the console simultaneously [[15]](https://github.com/jamestalton/pino-zen/blob/3fa6ec16cc154bee8ffd66fda60464a25fd1c9b9/README.md#L27-L39):

```js
const logger = pino({
  level: "debug",
  transport: {
    targets: [
      { target: "pino/file", options: { destination: "app.log" } },
      { target: "pino-zen" },
    ],
  },
})
```

#### With Custom Destination

By default, pino-zen writes to stdout. Pass a file path or file descriptor via the `destination` option to redirect the formatted output [[11]](https://github.com/jamestalton/pino-zen/blob/3fa6ec16cc154bee8ffd66fda60464a25fd1c9b9/README.md#L41-L47):

```js
const logger = pino({
  transport: {
    target: "pino-zen",
    options: { destination: "/var/log/app.log" }
  },
})
```

#### Module Mode {#module-mode}

Module mode prepends a color-coded, right-aligned prefix to each log line, making it easy to distinguish output from different components in a single log stream. Enable it by setting the `module` option to the name of the field that contains the component name [[16]](https://github.com/jamestalton/pino-zen/blob/3fa6ec16cc154bee8ffd66fda60464a25fd1c9b9/README.md#L70-L95):

```js
const logger = pino({
  transport: {
    target: "pino-zen",
    options: { module: "name" },
  },
})

logger.info({ name: "api" }, "request processed")
logger.info({ name: "auth" }, "user verified")
```

**Output:**

```
 [api] INFO request processed
[auth] INFO user verified
```

Module names are automatically assigned one of six colors (blue, magenta, cyan, and their bright variants) and cycle through them as new module names are encountered [[17]](https://github.com/jamestalton/pino-zen/blob/3fa6ec16cc154bee8ffd66fda60464a25fd1c9b9/src/pino-zen-format.ts#L14-L27). Prefixes are right-aligned using `padStart`, so columns stay aligned as the longest module name grows [[18]](https://github.com/jamestalton/pino-zen/blob/3fa6ec16cc154bee8ffd66fda60464a25fd1c9b9/src/pino-zen-format.ts#L70-L78). The module field itself is excluded from the inline key:value output [[19]](https://github.com/jamestalton/pino-zen/blob/3fa6ec16cc154bee8ffd66fda60464a25fd1c9b9/AGENTS.md#L55-L61).

CLI equivalent:

```sh
node app.js | pino-zen -m name
node app.js | pino-zen --module name
```

#### With Field Suppression

Use the `formatter` option to hide specific fields you don't need in development output. Set the field name to `false` to suppress it [[20]](https://github.com/jamestalton/pino-zen/blob/3fa6ec16cc154bee8ffd66fda60464a25fd1c9b9/README.md#L99-L108) [[12]](https://github.com/jamestalton/pino-zen/blob/3fa6ec16cc154bee8ffd66fda60464a25fd1c9b9/src/pino-zen-format.ts#L133-L136):

```js
const logger = pino({
  transport: {
    target: "pino-zen",
    options: {
      formatter: {
        pid: false,
        hostname: false
      }
    },
  },
})
```

***

### Mode 2: CLI Pipe (Command-Line)

Use this mode when you want to format logs from an existing application without modifying its source, or for ad-hoc debugging sessions.

The CLI reads Pino NDJSON from stdin, formats each line using the same `FormatMessage` logic as the transport, and writes to stdout [[21]](https://github.com/jamestalton/pino-zen/blob/3fa6ec16cc154bee8ffd66fda60464a25fd1c9b9/src/pino-zen-cli.ts#L40). If a line cannot be parsed as JSON, it is passed through as raw text — so non-JSON output from your process is never swallowed [[22]](https://github.com/jamestalton/pino-zen/blob/3fa6ec16cc154bee8ffd66fda60464a25fd1c9b9/src/pino-zen-cli.ts#L25-L34).

#### Basic Usage

Pipe any Pino-based application through the `pino-zen` binary [[23]](https://github.com/jamestalton/pino-zen/blob/3fa6ec16cc154bee8ffd66fda60464a25fd1c9b9/README.md#L49-L56):

```sh
node app.js | pino-zen
node app.js | npx pino-zen
```

#### CLI Flags

| Flag | Short | Description |
|------|-------|-------------|
| `--module <field>` | `-m` | Use the named log field as a color-coded module prefix |

[[24]](https://github.com/jamestalton/pino-zen/blob/3fa6ec16cc154bee8ffd66fda60464a25fd1c9b9/README.md#L58-L60) [[25]](https://github.com/jamestalton/pino-zen/blob/3fa6ec16cc154bee8ffd66fda60464a25fd1c9b9/src/pino-zen-cli.ts#L8-L13)

#### With Module Mode

```sh
node app.js | pino-zen -m name
node app.js | pino-zen --module name
```

> **Tip:** The CLI's `--module` flag mirrors the transport's `module` option exactly — both invoke the same underlying `FormatMessage` formatter [[26]](https://github.com/jamestalton/pino-zen/blob/3fa6ec16cc154bee8ffd66fda60464a25fd1c9b9/src/pino-zen-cli.ts#L27).

***

### Field Rendering

Once the `level`, `time`, `msg`, and module field (if set) are extracted for the formatted header, all remaining fields are rendered inline after the message using type-specific colors [[6]](https://github.com/jamestalton/pino-zen/blob/3fa6ec16cc154bee8ffd66fda60464a25fd1c9b9/AGENTS.md#L64-L72) [[27]](https://github.com/jamestalton/pino-zen/blob/3fa6ec16cc154bee8ffd66fda60464a25fd1c9b9/src/pino-zen-format.ts#L133-L201):

| Type | Rendering | Example |
|------|-----------|---------|
| String | `key:grey(value)` | `env:production` |
| Number | `key:green(value)` | `port:3000` |
| Boolean | `key:yellow(value)` | `debug:true` |
| Object | `key{ key2:val2 }` (recursive, magenta braces) | `user{ id:42  role:admin }` |
| Array | `key[ val1, val2 ]` (recursive, yellow brackets) | `tags[ api  v2 ]` |
| Null | key only, no value | `session` |

Fields `msg`, `time`, `level`, and the module field (if configured) are always extracted and **never** rendered as key:value pairs [[28]](https://github.com/jamestalton/pino-zen/blob/3fa6ec16cc154bee8ffd66fda60464a25fd1c9b9/src/pino-zen-format.ts#L94-L107).

## Next Steps

Now that you have pino-zen up and running, here are some directions to explore:

- **Advanced module mode patterns** — In microservice or monorepo setups, use the `module` field consistently across services to produce aligned, color-coded log streams that make distributed debugging much easier.
- **Multiple Pino transports** — Combine pino-zen with `pino/file` or other transports to write human-readable logs to the console during development and structured JSON to disk or a log aggregator for production [[15]](https://github.com/jamestalton/pino-zen/blob/3fa6ec16cc154bee8ffd66fda60464a25fd1c9b9/README.md#L27-L39).
- **Field suppression for cleaner output** — Use `formatter: { pid: false, hostname: false }` (or any other fields) to strip low-value metadata from your development console output while keeping it in files [[20]](https://github.com/jamestalton/pino-zen/blob/3fa6ec16cc154bee8ffd66fda60464a25fd1c9b9/README.md#L99-L108).
- **CLI with existing applications** — If you have a Pino-based app you can't (or don't want to) modify, pipe its output through `pino-zen` from the command line to get instant colorized output without any code changes.
- **Pino documentation** — For advanced logging patterns, custom serializers, log levels, and performance tuning, refer to the [Pino documentation](https://getpino.io).
