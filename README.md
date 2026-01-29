# pino-zen

Colored log formatter for [Pino](https://getpino.io) JSON logs.

![pino-zen output](https://raw.githubusercontent.com/jamestalton/pino-zen/main/screenshot.png)

## Install

```sh
npm install pino-zen
```

## Usage

### Pino Transport

Use `pino-zen` directly as a Pino transport for colored console output alongside other targets:

```js
import pino from "pino";

const level = process.env.LOG_LEVEL
if (!["debug", "info", "warn", "error", "trace"].includes(level)) {
  throw new Error(`Invalid log level: ${level}`);
}

const logger = pino({
  level,
  transport: {
    targets: [
      { target: "pino/file", level, options: { destination: "app.log", append: false } },
      { target: "pino-zen", level, options: {} },
    ],
  },
  formatters: {
    bindings() {
      return {}; // Return empty object to exclude pid and hostname
    },
  },
});
```

### CLI Pipe

Pipe any NDJSON log output through the `pino-zen` CLI:

```sh
node app.js | pino-zen
```

#### CLI Options

| Flag | Description | Example |
|------|-------------|---------|
| `-d`, `--dim` | Dim a field | `pino-zen -d hostname` |
| `-e`, `--error` | Color a field as error | `pino-zen -e err` |
| `-r`, `--right` | Pad a field on the right | `pino-zen -r msg=20` |
| `-l`, `--left` | Pad a field on the left | `pino-zen -l level=5` |

Flags can be repeated:

```sh
node app.js | pino-zen -d hostname -d pid -r msg=30 -e err
```
