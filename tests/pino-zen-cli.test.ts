import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { describe, it } from 'node:test'

// Runs the built CLI, so `npm run build` must run first
const cli = new URL('../lib/pino-zen-cli.js', import.meta.url).pathname

function run(input: string, args: string[] = []) {
    return spawnSync(process.execPath, [cli, ...args], {
        input,
        encoding: 'utf8',
        env: { ...process.env, NO_COLOR: '1' },
    })
}

describe('pino-zen CLI', () => {
    it('formats JSON log lines', () => {
        const result = run('{"level":30,"msg":"hello","port":3000}\n')
        assert.equal(result.status, 0)
        assert.equal(result.stdout, ' INFO:hello  port:3000\n')
    })

    it('passes through lines that are not JSON objects', () => {
        const input = 'plain text\n123\nnull\n[1,2]\n\n'
        const result = run(input)
        assert.equal(result.status, 0)
        assert.equal(result.stdout, input)
    })

    it('uses the module field with -m', () => {
        const result = run('{"level":30,"msg":"started","module":"api"}\n', ['-m', 'module'])
        assert.equal(result.stdout, '[api]  INFO:started\n')
    })

    it('prints help', () => {
        const result = run('', ['--help'])
        assert.equal(result.status, 0)
        assert.match(result.stdout, /Usage:/)
    })

    it('rejects unknown options', () => {
        const result = run('', ['--bogus'])
        assert.equal(result.status, 2)
        assert.match(result.stderr, /Unknown option/)
    })
})
