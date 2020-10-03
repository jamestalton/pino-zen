#!/usr/bin/env node

/* istanbul ignore file */

import { program } from 'commander'
import { readFileSync } from 'fs'
import { formatLine } from './format-line'

const packageJson = JSON.parse(readFileSync('package.json').toString()) as { version: string }
program
    .version(packageJson.version)
    .option('-i, --ignore', 'ignore keys', '')
    .option('-f, --first', 'first keys', '')
    .option('-l, --last', 'last keys', '')
    .option('--msg', 'message key', 'msg')
    .option('--level', 'level key', 'level')
    .option('--time', 'time key', 'timestamp')
    .parse(process.argv)

process.stdin.on('data', (buffer: Buffer) => {
    const lines = buffer.toString().split('\n')
    for (const line of lines) {
        process.stdout.write(formatLine(line) + `\n`)
    }
})

process.once('SIGINT', () => {
    // NOOP
})
