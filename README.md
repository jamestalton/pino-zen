# pino-zen

Zen for Pino logging

Clean and simple colored log formatting for viewing json logs.

[![NPM Package Version](https://img.shields.io/npm/jtalton/pino-zen)](https://www.npmjs.com/package/jtalton/pino-zen)
[![Build Status](https://img.shields.io/github/workflow/status/jamestalton/pino-zen/CI)](https://github.com/jamestalton/pino-zen/actions?query=publish)

Example Output

![example]([example.png](https://github.com/jamestalton/pino-zen/blob/master/example.png))

## Install

```sh
npm install -g pino-zen
```

## Usage

When using Pino the recommended practice is to pipe the output from the main node process into a formatter. This is for performance as node is single threaded and this enables the log formatting to happen in a seperate process.

```
node main.js | pino-zen --ignore time,hostname,instance
```

### Options

- `--ignore` (`-i`): Ignore keys: (`--ignore time,hostname,instance`)
- `--first` (`-f`): Put keys at the front of the log line (`--first hostname,method`)
- `--last` (`-l`): Put keys at the back of the log line (`--last hostname,method`)
- `--theme` (`-t`): 'dark', 'light', 'none' (`--theme dark`)
- `--msg`: The key for the message (default:`msg`)
- `--level`: The key for the level (default:`level`)
- `--timestamp`: The key for the timestamp (default:`time`)
