#!/usr/bin/env node
import { fstatSync, readFileSync } from 'node:fs'
import { pipeline } from 'node:stream'
import { parseArgs } from 'node:util'
import split2 from 'split2'
import { FormatMessage, type PinoZenOptions } from './pino-zen-format.js'

const usage = `Usage: <command> | pino-zen [options]

Options:
  -m, --module <field>  Use a field as the color-coded module prefix
  -h, --help            Show this help
  -v, --version         Show the version
`

function parseCliArgs() {
    try {
        return parseArgs({
            options: {
                module: { type: 'string', short: 'm' },
                help: { type: 'boolean', short: 'h' },
                version: { type: 'boolean', short: 'v' },
            },
        }).values
    } catch (err) {
        process.stderr.write(`pino-zen: ${(err as Error).message}\n\n${usage}`)
        process.exit(2)
    }
}

const values = parseCliArgs()

if (values.help) {
    process.stdout.write(usage)
    process.exit(0)
}

if (values.version) {
    const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as { version: string }
    process.stdout.write(`${pkg.version}\n`)
    process.exit(0)
}

const pinoZenOptions: PinoZenOptions = {}

if (values.module) {
    pinoZenOptions.module = values.module
}

// Lines that are not JSON objects are passed through unchanged
function formatLine(line: string): string {
    try {
        const obj = JSON.parse(line) as unknown
        if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
            return `${FormatMessage(obj, pinoZenOptions)}\n`
        }
    } catch {
        // Not JSON
    }
    return `${line}\n`
}

pipeline(process.stdin, split2(formatLine), process.stdout, (err) => {
    // EPIPE means the reader went away (e.g. piped into `head`), which is not an error
    if (err && (err as NodeJS.ErrnoException).code !== 'EPIPE') {
        process.stderr.write(`pino-zen: ${err.message}\n`)
        process.exitCode = 1
    }
})

// When reading from a pipe, ignore Ctrl+C so the upstream process can exit first and its final logs still get formatted
if (!process.stdin.isTTY && !fstatSync(process.stdin.fd).isFile()) {
    process.once('SIGINT', () => {})
}
