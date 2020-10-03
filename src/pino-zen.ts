#!/usr/bin/env node

/* istanbul ignore file */

import { formatLine } from './format-line'

process.stdin.on('data', (buffer: Buffer) => {
    const lines = buffer.toString().split('\n')
    for (const line of lines) {
        process.stdout.write(formatLine(line))
    }
})

process.once('SIGINT', () => {
    // NOOP
})
