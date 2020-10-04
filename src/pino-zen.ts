#!/usr/bin/env node

/* istanbul ignore file */

import { formatLine } from './format-line'

process.stdin.on('data', (buffer: Buffer) => {
    const lines = buffer.toString().trimEnd().split('\n')
    for (const line of lines) {
        process.stdout.write(formatLine(line) + '\n')
    }
})

process.once('SIGINT', () => {
    // NOOP
})
