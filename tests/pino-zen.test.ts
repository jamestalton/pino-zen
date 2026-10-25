import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, it } from 'node:test'
import pino from 'pino'

// Loads the built transport, so `npm run build` must run first
const target = new URL('../lib/pino-zen.js', import.meta.url).pathname

// The transport worker inherits this, so assertions can compare plain text
process.env.FORCE_COLOR = '0'

function logToFile(targetOptions: Record<string, unknown> | undefined, log: (logger: pino.Logger) => void) {
    const destination = join(mkdtempSync(join(tmpdir(), 'pino-zen-')), 'out.log')
    const transport = pino.transport({ targets: [{ target, options: { ...targetOptions, destination } }] })
    const logger = pino({ base: undefined }, transport)
    log(logger)
    return new Promise<string>((resolve, reject) => {
        transport.on('error', reject)
        transport.on('close', () => resolve(readFileSync(destination, 'utf8')))
        transport.end()
    })
}

describe('pino-zen transport', () => {
    it('formats logs from pino', async () => {
        const output = await logToFile(undefined, (logger) => logger.info({ port: 3000 }, 'started'))
        assert.equal(output, ' INFO:started  port:3000\n')
    })

    it('applies module and formatter options', async () => {
        const output = await logToFile({ module: 'name', formatter: { pid: false } }, (logger) =>
            logger.warn({ name: 'db', pid: 1 }, 'slow'),
        )
        assert.equal(output, '[db]  WARN:slow\n')
    })
})
