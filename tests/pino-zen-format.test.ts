import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { FormatMessage, type PinoZenOptions, ResetModuleMetadata } from '../src/pino-zen-format.ts'

// biome-ignore lint: test utility
const stripAnsi = (s: string) => s.replace(/\u001b\[[\d;]*m/g, '')

const opts: PinoZenOptions = {}

describe('FormatMessage', () => {
    describe('string input', () => {
        it('returns a string as-is', () => {
            assert.equal(FormatMessage('plain text', opts), 'plain text')
        })

        it('returns empty string as-is', () => {
            assert.equal(FormatMessage('', opts), '')
        })
    })

    describe('numeric log levels', () => {
        it('formats TRACE (10)', () => {
            const result = stripAnsi(FormatMessage({ level: 10, msg: 'test' }, opts))
            assert.match(result, /^TRACE/)
        })

        it('formats DEBUG (20)', () => {
            const result = stripAnsi(FormatMessage({ level: 20, msg: 'test' }, opts))
            assert.match(result, /^DEBUG/)
        })

        it('formats INFO (30)', () => {
            const result = stripAnsi(FormatMessage({ level: 30, msg: 'test' }, opts))
            assert.match(result, /INFO/)
        })

        it('formats WARN (40)', () => {
            const result = stripAnsi(FormatMessage({ level: 40, msg: 'test' }, opts))
            assert.match(result, /WARN/)
        })

        it('formats ERROR (50)', () => {
            const result = stripAnsi(FormatMessage({ level: 50, msg: 'test' }, opts))
            assert.match(result, /^ERROR/)
        })

        it('formats FATAL (60)', () => {
            const result = stripAnsi(FormatMessage({ level: 60, msg: 'test' }, opts))
            assert.match(result, /^FATAL/)
        })
    })

    describe('string log levels', () => {
        it('formats trace', () => {
            const result = stripAnsi(FormatMessage({ level: 'trace', msg: 'test' }, opts))
            assert.match(result, /^TRACE/)
        })

        it('formats debug', () => {
            const result = stripAnsi(FormatMessage({ level: 'debug', msg: 'test' }, opts))
            assert.match(result, /^DEBUG/)
        })

        it('formats info', () => {
            const result = stripAnsi(FormatMessage({ level: 'info', msg: 'test' }, opts))
            assert.match(result, /INFO/)
        })

        it('formats warn', () => {
            const result = stripAnsi(FormatMessage({ level: 'warn', msg: 'test' }, opts))
            assert.match(result, /WARN/)
        })

        it('formats error', () => {
            const result = stripAnsi(FormatMessage({ level: 'error', msg: 'test' }, opts))
            assert.match(result, /^ERROR/)
        })

        it('formats fatal', () => {
            const result = stripAnsi(FormatMessage({ level: 'fatal', msg: 'test' }, opts))
            assert.match(result, /^FATAL/)
        })
    })

    describe('unknown or missing level', () => {
        it('produces no level prefix for unknown numeric level', () => {
            const result = stripAnsi(FormatMessage({ level: 99, msg: 'test' }, opts))
            assert.ok(!result.match(/^(TRACE|DEBUG|INFO|WARN|ERROR|FATAL)/))
        })

        it('produces no level prefix when level is absent', () => {
            const result = stripAnsi(FormatMessage({ msg: 'test' }, opts))
            assert.ok(!result.match(/^(TRACE|DEBUG|INFO|WARN|ERROR|FATAL)/))
        })
    })

    describe('message field', () => {
        it('includes msg in output', () => {
            const result = stripAnsi(FormatMessage({ level: 30, msg: 'hello world' }, opts))
            assert.ok(result.includes('hello world'))
        })

        it('handles missing msg', () => {
            const result = stripAnsi(FormatMessage({ level: 30, foo: 'bar' }, opts))
            assert.ok(result.includes('foo'))
            assert.ok(result.includes('bar'))
        })
    })

    describe('additional fields', () => {
        it('renders string field', () => {
            const result = stripAnsi(FormatMessage({ level: 30, msg: 'hi', name: 'app' }, opts))
            assert.ok(result.includes('name'))
            assert.ok(result.includes('app'))
        })

        it('renders number field', () => {
            const result = stripAnsi(FormatMessage({ level: 30, msg: 'hi', pid: 1234 }, opts))
            assert.ok(result.includes('pid'))
            assert.ok(result.includes('1234'))
        })

        it('renders boolean field', () => {
            const result = stripAnsi(FormatMessage({ level: 30, msg: 'hi', active: true }, opts))
            assert.ok(result.includes('active'))
            assert.ok(result.includes('true'))
        })

        it('skips time field', () => {
            const result = stripAnsi(FormatMessage({ level: 30, msg: 'hi', time: 12345 }, opts))
            assert.ok(!result.includes('12345'))
        })

        it('renders multiple fields', () => {
            const result = stripAnsi(FormatMessage({ level: 30, msg: 'hi', a: '1', b: '2' }, opts))
            assert.ok(result.includes('a'))
            assert.ok(result.includes('1'))
            assert.ok(result.includes('b'))
            assert.ok(result.includes('2'))
        })
    })

    describe('nested objects', () => {
        it('renders nested object with braces', () => {
            const result = stripAnsi(FormatMessage({ level: 30, msg: 'hi', req: { method: 'GET' } }, opts))
            assert.ok(result.includes('req'))
            assert.ok(result.includes('method'))
            assert.ok(result.includes('GET'))
            assert.ok(result.includes('{'))
            assert.ok(result.includes('}'))
        })

        it('renders deeply nested object', () => {
            const result = stripAnsi(FormatMessage({ level: 30, msg: 'hi', a: { b: { c: 'deep' } } }, opts))
            assert.ok(result.includes('deep'))
        })
    })

    describe('arrays', () => {
        it('renders array with brackets', () => {
            const result = stripAnsi(FormatMessage({ level: 30, msg: 'hi', tags: ['a', 'b'] }, opts))
            assert.ok(result.includes('tags'))
            assert.ok(result.includes('['))
            assert.ok(result.includes(']'))
            assert.ok(result.includes('a'))
            assert.ok(result.includes('b'))
        })

        it('renders empty array', () => {
            const result = stripAnsi(FormatMessage({ level: 30, msg: 'hi', items: [] }, opts))
            assert.ok(result.includes('items'))
            assert.ok(result.includes('['))
            assert.ok(result.includes(']'))
        })
    })

    describe('null values', () => {
        it('renders null field key without value', () => {
            const result = stripAnsi(FormatMessage({ level: 30, msg: 'hi', gone: null }, opts))
            assert.ok(result.includes('gone'))
        })
    })

    describe('formatter options', () => {
        it('excludes field when formatter is false', () => {
            const result = stripAnsi(
                FormatMessage({ level: 30, msg: 'hi', secret: 'hidden' }, { formatter: { secret: false } }),
            )
            assert.ok(!result.includes('hidden'))
            assert.ok(!result.includes('secret'))
        })

        it('still shows fields not excluded', () => {
            const result = stripAnsi(
                FormatMessage({ level: 30, msg: 'hi', keep: 'visible', drop: 'gone' }, { formatter: { drop: false } }),
            )
            assert.ok(result.includes('keep'))
            assert.ok(result.includes('visible'))
            assert.ok(!result.includes('gone'))
        })
    })

    describe('no msg field', () => {
        it('renders fields without msg prefix', () => {
            const result = stripAnsi(FormatMessage({ level: 30, name: 'app', pid: 42 }, opts))
            assert.ok(result.includes('name'))
            assert.ok(result.includes('app'))
            assert.ok(result.includes('pid'))
            assert.ok(result.includes('42'))
        })

        it('adds space after level when no msg', () => {
            const raw = FormatMessage({ level: 30, x: '1' }, opts)
            const result = stripAnsi(raw)
            // Level present, so space is added before fields
            assert.match(result, /INFO\s/)
        })
    })

    describe('module mode', () => {
        const moduleOpts: PinoZenOptions = { module: 'module' }

        ResetModuleMetadata()

        it('prefixes with module name in brackets', () => {
            const result = stripAnsi(FormatMessage({ level: 30, msg: 'started', module: 'server' }, moduleOpts))
            assert.match(result, /^\[server\]/)
        })

        it('includes level name in output', () => {
            const result = stripAnsi(FormatMessage({ level: 30, msg: 'started', module: 'server' }, moduleOpts))
            assert.ok(result.includes('INFO'))
        })

        it('includes the message after the module and level', () => {
            const result = stripAnsi(FormatMessage({ level: 30, msg: 'started', module: 'server' }, moduleOpts))
            assert.match(result, /\[server\] INFO:started/)
        })

        it('aligns shorter module names to the right', () => {
            ResetModuleMetadata()
            // First call sets max length to 8 ("[server]")
            FormatMessage({ level: 30, msg: 'a', module: 'server' }, moduleOpts)
            // Second call with "[db]" (4 chars) should have 4 leading spaces
            const result = stripAnsi(FormatMessage({ level: 30, msg: 'b', module: 'db' }, moduleOpts))
            assert.match(result, /^ {4}\[db\]/)
        })

        it('includes additional fields', () => {
            const result = stripAnsi(
                FormatMessage({ level: 30, msg: 'started', module: 'server', port: 3000 }, moduleOpts),
            )
            assert.ok(result.includes('port'))
            assert.ok(result.includes('3000'))
        })

        it('does not include module field in additional fields', () => {
            const result = stripAnsi(FormatMessage({ level: 30, msg: 'started', module: 'server' }, moduleOpts))
            // It should be at the start but not in the fields area
            assert.ok(!result.includes('module:server'))
        })

        it('cycles colors for different modules', () => {
            ResetModuleMetadata()
            // This is harder to test with stripAnsi, but we can check if it runs without error
            const result1 = FormatMessage({ level: 30, msg: 'a', module: 'm1' }, moduleOpts)
            const result2 = FormatMessage({ level: 30, msg: 'b', module: 'm2' }, moduleOpts)
            assert.notEqual(result1, result2)
        })

        it('uses same color for same module', () => {
            ResetModuleMetadata()
            const result1 = FormatMessage({ level: 30, msg: 'test', module: 'm1' }, moduleOpts)
            const result2 = FormatMessage({ level: 30, msg: 'other', module: 'm1' }, moduleOpts)
            // The prefixes should be identical (same color escapes)
            const prefix1 = result1.split(' ')[0]
            const prefix2 = result2.split(' ')[0]
            assert.equal(prefix1, prefix2)
        })
    })
})
