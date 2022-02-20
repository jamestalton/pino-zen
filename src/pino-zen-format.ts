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
    error?: boolean
    dim?: boolean
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

    const cat = (message as Record<string, unknown>).cat
    let hasCategory = false
    if (cat !== undefined) {
        hasCategory = true
        line += formatValueOptions(cat, opts.formatter?.cat)
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

    const msg = (message as Record<string, unknown>).msg
    line += formatValueOptions(msg, opts.formatter?.msg)

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
    if (opts.formatter?.key === false) return

    let keyValueString = prefix ? '  ' : ''
    let first = true

    value = formatValueOptions(value, opts.formatter?.[key])

    const valueType = typeof value
    switch (valueType) {
        case 'string':
        case 'boolean':
        case 'number':
        case 'object':
            if (key)
                if (value === null) {
                    keyValueString += Cyan + key
                } else {
                    keyValueString += Cyan + key + ' '
                }
            break
    }

    switch (valueType) {
        case 'string':
        case 'boolean':
        case 'number':
            keyValueString += White + value.toString()
            break
        case 'object':
            if (Array.isArray(value)) {
                let arrayLine = Gray + '[ '
                for (const value2 of value) {
                    arrayLine += formatValue(undefined, value2, !first, opts)
                    first = false
                }
                arrayLine += Gray + ' ]'
                keyValueString += arrayLine
            } else if (value === null) {
                // Do nothing
            } else {
                let objectLine = Gray + '{ '
                for (const key in value as object) {
                    const value2 = (value as Record<string, unknown>)[key]
                    objectLine += formatValue(key, value2, !first, opts)
                    first = false
                }
                objectLine += Gray + ' }'
                keyValueString += objectLine
            }
            break
    }

    return formatKeyValue(keyValueString, opts.formatter?.[key])
}

function formatValueOptions(value: unknown, formatter?: StringFormatter | false) {
    if (value === undefined) return ''
    if (typeof value === 'object') return value
    if (formatter === false) return ''
    if (!formatter) return value.toString()
    let newValue = value.toString()
    if (typeof formatter?.padStart === 'number') newValue = newValue.padStart(formatter.padStart, ' ')
    if (typeof formatter?.padEnd === 'number') newValue = newValue.padEnd(formatter.padEnd, ' ')
    if (formatter?.error) newValue = Red + Bold + newValue + Reset
    return newValue
}

function formatKeyValue(keyValue: string, formatter?: StringFormatter | false) {
    if (formatter === false) return ''
    if (formatter?.dim) keyValue = Dim + keyValue + Reset
    return keyValue
}
