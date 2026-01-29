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

### Module Mode

Pino Zen includes a "Module Mode" that prepends a color-coded and right-aligned module name to your logs. This is especially useful for microservices or mono-repos where you want to distinguish logs from different components at a glance.

#### Performance & Alignment

Module names are automatically tracked, and the prefix is right-aligned based on the longest module name encountered during the process lifecycle.

```js
const logger = pino({
  transport: {
      target: "pino-zen",
      options: { module: "module" },
  }
});

logger.info({ module: "api" }, "request processed");
logger.info({ module: "auth" }, "user verified");
```

Output:

```text
 [api]  INFO:request processed
[auth]  INFO:user verified
```

### CLI Pipe

Pipe any NDJSON log output through the `pino-zen` CLI:

```sh
node app.js | pino-zen
```

#### CLI Options

| Flag | Short | Description | Example |
|------|-------|-------------|---------|
| `--module` | `-m` | Use a field as the module prefix | `pino-zen -m module` |

Example usage:

```sh
node app.js | pino-zen -m service
```
