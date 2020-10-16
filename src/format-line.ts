#!/usr/bin/env node

import { Instance as Chalk } from 'chalk'
import { program } from 'commander'
import { readFileSync } from 'fs'

program
    .option('-i, --ignore <keys>', 'ignore keys', '')
    .option('-f, --first <keys>', 'first keys', '')
    .option('-l, --last <keys>', 'last keys', '')
    .option('--msg <key>', 'message key', 'msg')
    .option('--level <key>', 'level key', 'level')
    .option('--time <key>', 'time key', 'timestamp')
    .option('--no-color', 'disable colors')

if (process.env.NODE_ENV !== 'test') {
    program.parse(process.argv)
}

const chalk = new Chalk({ level: program.color ? 2 : 0 })
const traceText = chalk.magenta('TRACE')
const debugText = chalk.blueBright('DEBUG')
const infoText = chalk.greenBright(' INFO')
const warnText = chalk.yellow(' WARN')
const errorText = chalk.redBright.bold('ERROR')
const fatalText = chalk.redBright.bold('FATAL')
const comma = chalk.dim.blackBright(',')
const colon = chalk.dim.blackBright(':')
const openBrace = chalk.blackBright('{ ')
const closeBrace = chalk.blackBright(' }')
const openBracket = chalk.blackBright('[ ')
const closeBracket = chalk.blackBright(' ]')

let messageKey = program.msg as string
if (!messageKey) messageKey = 'msg'

let levelKey = program.level as string
if (!levelKey) levelKey = 'level'

let timestampKey = program.time as string
if (!timestampKey) timestampKey = 'time'

function parseKeys(keys: string) {
    if (!keys) return {} as Record<string, boolean>
    return keys.split(',').reduce((result, key) => {
        result[key] = true
        return result
    }, {} as Record<string, boolean>)
}

const ignoreKeys = parseKeys(program.ignore)
const firstKeys = parseKeys(program.first)
const lastKeys = parseKeys(program.last)

function formatValue(name: string, value: unknown): string {
    let line = chalk.cyan(name) + colon
    if (!name) line = ''
    switch (typeof value) {
        default:
            line += value
            break
        case 'object':
            if (Array.isArray(value)) {
                line += openBracket
                let first = true
                for (const item of value) {
                    if (!first) line += `${comma} `
                    line += formatValue(undefined, item)
                    first = false
                }
                line += closeBracket
            } else {
                line += openBrace
                let first = true
                for (const key in value) {
                    if (!first) line += comma + ` `
                    line += formatValue(key, (value as Record<string, unknown>)[key])
                    first = false
                }
                line += closeBrace
            }
    }
    return line
}

export function formatLine(line: string): string {
    if (line.startsWith('{')) {
        try {
            const json = JSON.parse(line) as Record<string, unknown>

            if (!ignoreKeys?.[timestampKey]) {
                const timestamp = json[timestampKey] as string
                if (timestamp !== undefined) {
                    try {
                        const date = new Date(timestamp)
                        line = chalk.dim(`${date.toLocaleDateString()} ${date.toLocaleTimeString()} `)
                    } catch {
                        line = chalk.dim(`${timestamp} `)
                    }
                } else {
                    line = ''
                }
            } else {
                line = ''
            }

            let bold = false
            switch (json[levelKey]) {
                case 10:
                case 'trace':
                    line += traceText
                    break
                case 20:
                case 'debug':
                    line += debugText
                    break
                case 30:
                case 'info':
                    line += infoText
                    bold = true
                    break
                case 40:
                case 'warn':
                    line += warnText
                    break
                case 50:
                case 'error':
                    line += errorText
                    bold = true
                    break
                case 60:
                case 'fatal':
                    line += fatalText
                    bold = true
                    break
            }

            const msg: unknown = json[messageKey]
            if (typeof msg === 'string') {
                if (bold) {
                    line += colon + chalk.bold(msg)
                } else {
                    line += colon + msg
                }
            }

            if (firstKeys) {
                for (const key in firstKeys) {
                    if (key === messageKey) continue
                    if (key === levelKey) continue
                    if (key === timestampKey) continue
                    const value = json[key]
                    line += '  '
                    line += formatValue(key, value)
                }
            }

            for (const key in json) {
                if (key === messageKey) continue
                if (key === levelKey) continue
                if (key === timestampKey) continue
                if (ignoreKeys?.[key]) continue
                if (firstKeys?.[key]) continue
                if (lastKeys?.[key]) continue
                const value = json[key]
                line += '  '
                line += formatValue(key, value)
            }

            if (lastKeys) {
                for (const key in lastKeys) {
                    if (key === messageKey) continue
                    if (key === levelKey) continue
                    if (key === timestampKey) continue
                    const value = json[key]
                    line += '  '
                    line += formatValue(key, value)
                }
            }
        } catch (err) {
            // Do Nothing
        }
    }
    return line
}
