const Reset = '\x1b[0m'
const Dim = '\x1b[2m'
const Bold = '\x1b[1m'
const Normal = '\x1b[22m'
export const Red = '\x1b[31m'
export const Green = '\x1b[32m'
export const Yellow = '\x1b[33m'
export const Blue = '\x1b[34m'
export const Magenta = '\x1b[35m'
export const Cyan = '\x1b[36m'
export const White = '\x1b[37m'
export const Gray = '\x1b[90m'
export const Black = '\x1b[30m'

const BgRed = '\x1b[41m'

const Trace = Bold + Magenta
const Debug = Bold + Blue
const Info = Bold + Green
const Warn = Yellow
const Error = Bold + Red
const Fatal = BgRed + Black

export interface PinoZenOptions {
    destination?: string | number
    formatter?: Record<string, false | StringFormatter>
}

export interface StringFormatter {
    padStart?: number
    padEnd?: number
}

export function FormatMessage(message: unknown, opts: PinoZenOptions): string {
    if (typeof message === 'string') {
        return message
    }

    let line = ''

    const level = (message as Record<string, unknown>).level
    switch (level) {
        case 10:
        case 'trace':
            line += Trace
            break
        case 20:
        case 'debug':
            line += Debug
            break
        case 30:
        case 'info':
            line += Info
            break
        case 40:
        case 'warn':
            line += Warn
            break
        case 50:
        case 'error':
            line += Error
            break
        case 60:
        case 'fatal':
            line += Fatal
            break
    }

    let cat = (message as Record<string, unknown>).cat
    let hasCategory = false
    if (typeof cat === 'string') {
        hasCategory = true
        const msgFormatter = opts.formatter?.cat
        if (msgFormatter !== false) {
            if (typeof msgFormatter?.padStart === 'number') cat = cat.padStart(msgFormatter.padStart, ' ')
            if (typeof msgFormatter?.padEnd === 'number') cat = (cat as string).padEnd(msgFormatter.padEnd, ' ')
        }
        line += cat
    }

    if (!hasCategory) {
        switch (level) {
            case 10:
            case 'trace':
                line += 'TRACE'
                break
            case 20:
            case 'debug':
                line += 'DEBUG'
                break
            case 30:
            case 'info':
                line += ' INFO'
                break
            case 40:
            case 'warn':
                line += ' WARN'
                break
            case 50:
            case 'error':
                line += 'ERROR'
                break
            case 60:
            case 'fatal':
                line += 'FATAL'
                break
        }
    }

    line += Reset + White + Bold + ' '

    let msg = (message as Record<string, unknown>).msg
    if (typeof msg === 'string') {
        const msgFormatter = opts.formatter?.msg
        if (msgFormatter !== false) {
            if (typeof msgFormatter?.padStart === 'number') msg = msg.padStart(msgFormatter.padStart, ' ')
            if (typeof msgFormatter?.padEnd === 'number') msg = (msg as string).padEnd(msgFormatter.padEnd, ' ')
            line += msg as string
        }
    }

    line += Reset

    for (const key in message as Record<string, unknown>) {
        let first = !!msg
        switch (key) {
            case 'cat':
            case 'msg':
            case 'time':
            case 'level':
                break
            default: {
                const value = (message as Record<string, unknown>)[key]
                line += formatValue(key, value, first, opts)
                first = false
                break
            }
        }
    }
    return line + Reset
}

function formatValue(key: string | undefined, value: unknown, prefix: boolean, opts: PinoZenOptions) {
    let line = prefix ? '  ' : ''
    let first = true

    if (opts.formatter?.key === false) return

    const msgFormatter = opts.formatter?.[key]
    if (msgFormatter !== false) {
        if (typeof msgFormatter?.padStart === 'number') value = value.toString().padStart(msgFormatter.padStart, ' ')
        if (typeof msgFormatter?.padEnd === 'number') value = value.toString().padEnd(msgFormatter.padEnd, ' ')
    }

    const valueType = typeof value

    switch (valueType) {
        case 'string':
        case 'boolean':
        case 'number':
        case 'object':
            if (key)
                if (value === null) {
                    line += Cyan + key
                } else {
                    line += Cyan + key + ' '
                }
            break
    }

    switch (valueType) {
        case 'string':
        case 'boolean':
        case 'number':
            line += White + value.toString()
            break
        case 'object':
            if (Array.isArray(value)) {
                line += Gray + '[ '
                for (const value2 of value) {
                    line += formatValue(undefined, value2, !first, opts)
                    first = false
                }
                line += Gray + ' ]'
            } else if (value === null) {
                // Do nothing
            } else {
                line += Gray + '{ '
                for (const key in value as object) {
                    const value2 = (value as Record<string, unknown>)[key]
                    line += formatValue(key, value2, !first, opts)
                    first = false
                }
                line += Gray + ' }'
            }
            break
    }
    return line
}
