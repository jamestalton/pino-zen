import { formatLine } from '../src/format-line'

describe('format-line', () => {
    it('should format json', () => {
        expect(
            formatLine(
                JSON.stringify({
                    msg: 'msg',
                    name: 'name',
                    object: {
                        first: 'first',
                        array: ['string', true, 123],
                    },
                })
            )
        ).toMatchInlineSnapshot(`"[2m[90m:[39m[22mmsg  [36mname[39m[2m[90m:[39m[22mname  [36mobject[39m[2m[90m:[39m[22m[90m{ [39m[36mfirst[39m[2m[90m:[39m[22mfirst[2m[90m,[39m[22m [36marray[39m[2m[90m:[39m[22m[90m[ [39mstring[2m[90m,[39m[22m true[2m[90m,[39m[22m 123[90m ][39m[90m }[39m"`)
    })

    it('should format trace json', () => {
        expect(formatLine(JSON.stringify({ level: 'trace', msg: 'msg' }))).toMatchInlineSnapshot(`"[35mTRACE[39m[2m[90m:[39m[22mmsg"`)
    })

    it('should format debug json', () => {
        expect(formatLine(JSON.stringify({ level: 'debug', msg: 'msg' }))).toMatchInlineSnapshot(`"[94mDEBUG[39m[2m[90m:[39m[22mmsg"`)
    })

    it('should format info json', () => {
        expect(formatLine(JSON.stringify({ level: 'info', msg: 'msg' }))).toMatchInlineSnapshot(`"[92m INFO[39m[2m[90m:[39m[22m[1mmsg[22m"`)
    })

    it('should format warn json', () => {
        expect(formatLine(JSON.stringify({ level: 'warn', msg: 'msg' }))).toMatchInlineSnapshot(`"[33m WARN[39m[2m[90m:[39m[22mmsg"`)
    })

    it('should format error json', () => {
        expect(formatLine(JSON.stringify({ level: 'error', msg: 'msg' }))).toMatchInlineSnapshot(`"[91m[1mERROR[22m[39m[2m[90m:[39m[22m[1mmsg[22m"`)
    })

    it('should format fatal json', () => {
        expect(formatLine(JSON.stringify({ level: 'fatal', msg: 'msg' }))).toMatchInlineSnapshot(`"[91m[1mFATAL[22m[39m[2m[90m:[39m[22m[1mmsg[22m"`)
    })

    it('should format text', () => {
        expect(formatLine('hello')).toMatchInlineSnapshot(`"hello"`)
    })
})
