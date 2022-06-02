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

const Trace = `${Bold}${Magenta}TRACE${Reset}${White}`
const Debug = `${Bold}${Blue}TRACE${Reset}${White}`
const Info = `${Bold}${Green}TRACE${Reset}${White}`
const Warn = `${Yellow}TRACE${Reset}${White}`
const Error = `${Bold}${Red}TRACE${Reset}${White}`
const Fatal = `${BgRed}${Black}FATAL${Reset}${White}`

const ObjectStart = `${Bold}${Dim}${Black}{ ${Reset}${White}`
const ObjectEnd = `${Bold}${Dim}${Black} }${Reset}${White}`
const ArrayStart = `${Bold}${Dim}${Black}[ ${Reset}${White}`
const ArrayEnd = `${Bold}${Dim}${Black} ]${Reset}${White}`

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
            line = Trace
            break
        case 20:
        case 'debug':
            line = Debug
            break
        case 30:
        case 'info':
            line = Info
            break
        case 40:
        case 'warn':
            line = Warn
            break
        case 50:
        case 'error':
            line = Error
            break
        case 60:
        case 'fatal':
            line += Fatal
            break
    }

    const msg = (message as Record<string, unknown>).msg as string
    if (msg) {
        line += Dim + Bold + Black + ':' + Reset + White + Bold + msg
        line += Reset

        for (const key in message as Record<string, unknown>) {
            let first = !!msg
            switch (key) {
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
    } else {
        if ((message as Record<string, unknown>).level) line += ' '
        let pad = false
        for (const key in message as Record<string, unknown>) {
            switch (key) {
                case 'msg':
                case 'time':
                case 'level':
                    break
                default: {
                    const value = (message as Record<string, unknown>)[key]
                    line += formatValue(key, value, pad, opts)
                    pad = true
                    break
                }
            }
        }
    }

    return line + Reset
}

function formatValue(key: string | undefined, value: unknown, prefix: boolean, opts: PinoZenOptions) {
    if (opts.formatter?.key === false) return

    let keyValueString = prefix ? Dim + Bold + Black + ', ' + Reset : ''
    let first = true

    const valueType = typeof value
    switch (valueType) {
        case 'string':
        case 'boolean':
        case 'number':
            if (key) keyValueString += Cyan + key + Dim + Bold + Black + ':' + Reset
            break
        case 'object':
            if (key)
                if (value === null) {
                    keyValueString += Cyan + key
                } else {
                    // keyValueString += Blue + key + Dim + Bold + Black + ':' + Reset
                    keyValueString += Blue + key
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
                let arrayLine = ArrayStart
                for (const value2 of value) {
                    arrayLine += formatValue(undefined, value2, !first, opts)
                    first = false
                }
                arrayLine += ArrayEnd
                keyValueString += arrayLine
            } else if (value === null) {
                // Do nothing
            } else {
                let objectLine = ObjectStart
                for (const key in value as object) {
                    const value2 = (value as Record<string, unknown>)[key]
                    objectLine += formatValue(key, value2, !first, opts)
                    first = false
                }
                objectLine += ObjectEnd
                keyValueString += objectLine
            }
            break
    }

    return keyValueString
}
