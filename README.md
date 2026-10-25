# pino-zen

Colored log formatter for [Pino](https://getpino.io) JSON logs. Works as a **Pino transport** or a **CLI pipe**.

<img src="screenshot.svg" alt="pino-zen output" width="620">

## Install

Requires Node.js 22 or later.

```sh
npm install pino-zen        # project dependency
npm install -g pino-zen     # global CLI
npx pino-zen                # run without installing
```

## Pino Transport

```js
import pino from "pino"

const logger = pino({
  transport: {
    target: "pino-zen",
  },
})
```

### Multiple Targets

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

### Custom Destination

By default the transport writes to stdout. Pass a file path or file descriptor via `destination`:

```js
{ target: "pino-zen", options: { destination: "/var/log/app.log" } }
```

## CLI

Pipe any Pino NDJSON output through the CLI:

```sh
node app.js | pino-zen
node app.js | npx pino-zen
```

| Flag | Short | Description |
|------|-------|-------------|
| `--module <field>` | `-m` | Use a field as the module prefix |
| `--help` | `-h` | Show usage |
| `--version` | `-v` | Show the version |

Lines that are not JSON objects are printed unchanged, so mixed output is safe to pipe. When reading from a pipe, the CLI ignores Ctrl+C so the upstream process can exit first and its final log lines still get formatted.

## Options

### Module Mode

Prepends a color-coded, right-aligned module name to each log line. Useful for distinguishing logs from different components.

**Transport:**

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

**CLI:**

```sh
node app.js | pino-zen -m name
```

**Output:**

```text
 [api] INFO request processed
[auth] INFO user verified
```

Module names are automatically color-cycled and right-aligned to the longest name seen.

### Field Suppression

Hide specific fields from output with the `formatter` option (transport only). Matching keys are hidden at every nesting level:

```js
{
  target: "pino-zen",
  options: { formatter: { pid: false, hostname: false } },
}
```

## Output

- `time` is never shown. `msg` follows the level; all other fields are rendered as `key:value`, with objects as `key:{ ... }` and arrays as `key:[ ... ]`.
- Error objects (any field with a string `stack`, such as pino's `err`) are rendered without the stack inline, and the stack is printed on the lines below the entry.
- Colors follow [chalk](https://github.com/chalk/chalk#supportscolor) detection. Set `NO_COLOR=1` or `FORCE_COLOR=0` to disable them, or `FORCE_COLOR=1` to force them (e.g. when writing to a file).

## Programmatic Use

The formatter is exported for use outside a transport:

```js
import { FormatMessage } from "pino-zen"

console.log(FormatMessage({ level: 30, msg: "hello", port: 3000 }, { module: "name" }))
```

## License

MIT
