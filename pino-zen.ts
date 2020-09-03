#!/usr/bin/env node
const Reset = "\x1b[0m";
const Bright = "\x1b[1m";
const FgBlack = "\x1b[30m";
const FgRed = "\x1b[31m";
const FgGreen = "\x1b[32m";
const FgYellow = "\x1b[33m";
const FgBlue = "\x1b[34m";
const FgMagenta = "\x1b[35m";
const FgCyan = "\x1b[36m";
const FgWhite = "\x1b[37m";
const Dim = "\x1b[2m";

let trace = "TRACE";
let debug = "DEBUG";
let info = " INFO";
let warn = " WARN";
let error = "ERROR";
let fatal = "FATAL";

let Bold = "";
let reset = "";
let comma = ",";
let colon = ":";
let openBrace = "{";
let closeBrace = "}";
let openBracket = "[";
let closeBracket = "]";
let variable = "";
let defaultColor = "";

function getArg(name: string, short?: string) {
    let index = process.argv.findIndex((arg) => arg.startsWith(`--${name}=`));
    if (index != -1) {
        return process.argv[index].substr(`--${name}=`.length);
    }

    index = process.argv.findIndex((arg) => arg === `-${name}`);
    if (index != -1) {
        if (process.argv.length >= index + 1) return process.argv[index + 1];
    }

    if (short) {
        index = process.argv.findIndex((arg) => arg.startsWith(`-${short}=`));
        if (index != -1) {
            return process.argv[index].substr(`-${short}=`.length);
        }

        index = process.argv.findIndex((arg) => arg === `--${short}`);
        if (index != -1) {
            if (process.argv.length >= index + 1)
                return process.argv[index + 1];
        }
    }
}

let messageKey = getArg("msg");
if (!messageKey) messageKey = "msg";

let levelKey = getArg("level");
if (!levelKey) levelKey = "level";

let timestampKey = getArg("time");
if (!timestampKey) timestampKey = "time";

let ingoreKeys: Record<string, boolean>;
let ingoreKeysInput = getArg("ignore", "i");
if (ingoreKeysInput)
    ingoreKeys = ingoreKeysInput.split(",").reduce((result, key) => {
        result[key] = true;
        return result;
    }, {} as Record<string, boolean>);

let firstKeys: Record<string, boolean>;
let firstKeysInput = getArg("first", "f");
if (firstKeysInput)
    firstKeys = firstKeysInput
        .split(",")
        .filter((key) => !ingoreKeys?.[key])
        .reduce((result, key) => {
            result[key] = true;
            return result;
        }, {} as Record<string, boolean>);

let lastKeys: Record<string, boolean>;
let lastKeysInput = getArg("last", "l");
if (lastKeysInput)
    lastKeys = lastKeysInput
        .split(",")
        .filter((key) => !ingoreKeys?.[key])
        .filter((key) => !firstKeys?.[key])
        .reduce((result, key) => {
            result[key] = true;
            return result;
        }, {} as Record<string, boolean>);

let theme = getArg("theme", "t");
if (!theme) theme = "dark";

switch (theme) {
    case "dark":
        trace = `${FgMagenta}${Dim}${trace}`;
        debug = `${FgBlue}${debug}`;
        info = `${FgGreen}${info}`;
        warn = `${FgYellow}${warn}`;
        error = `${Bright}${FgRed}${error}`;
        fatal = `${FgRed}${Bright}${fatal}${Reset}`;
        Bold = Bright;
        reset = Reset;
        comma = `${Bright}${Dim}${FgBlack}${comma}${Reset}`;
        colon = `${Bright}${FgBlack}${colon}${Reset}`;
        openBrace = `${Bright}${FgBlack}${openBrace}${Reset}`;
        closeBrace = `${Bright}${FgBlack}${closeBrace}${Reset}`;
        openBracket = `${Bright}${FgBlack}${openBracket}${Reset}`;
        closeBracket = `${Bright}${FgBlack}${closeBracket}${Reset}`;
        variable = FgCyan;
        defaultColor = `${Bright}${FgBlack}`;
        break;
    case "light":
        trace = `${FgMagenta}${Dim}${trace}`;
        debug = `${FgBlue}${debug}`;
        info = `${FgGreen}${info}`;
        warn = `${Bright}${FgYellow}${warn}`;
        error = `${Bright}${FgRed}${error}`;
        fatal = `${Bright}${FgRed}${fatal}${Reset}`;
        Bold = Bright;
        reset = Reset;
        comma = `${Dim}${FgWhite}${comma}${Reset}`;
        colon = `${Dim}${FgWhite}${colon}${Reset}`;
        openBrace = `${Dim}${FgWhite}${openBrace}${Reset}`;
        closeBrace = `${Dim}${FgWhite}${closeBrace}${Reset}`;
        openBracket = `${Dim}${FgWhite}${openBracket}${Reset}`;
        closeBracket = `${Dim}${FgWhite}${closeBracket}${Reset}`;
        variable = `${FgCyan}`;
        defaultColor = `${Dim}${FgWhite}`;
        break;
}

function formatValue(name: string, value: any, dim: boolean): string {
    let line = `${variable}${name}${colon}`;
    if (dim) {
        line = `${Dim}${variable}${name}${Dim}${colon}`;
    }
    if (!name) line = "";
    switch (typeof value) {
        default:
            if (dim) {
                line += Dim;
            }
            line += value;
            break;
        case "object":
            if (Array.isArray(value)) {
                if (dim) {
                    line += Dim;
                }
                line += openBracket;
                let first = true;
                for (const item of value) {
                    if (!first) line += `${comma}`;
                    line += formatValue(undefined, item, dim);
                    first = false;
                }
                line += closeBracket;
            } else {
                if (dim) {
                    line += Dim;
                }
                line += openBrace;
                let first = true;
                for (const key in value) {
                    if (!first) line += ` `;
                    line += formatValue(key, value[key], dim);
                    first = false;
                }
                line += closeBrace;
            }
    }
    return line;
}

function formatPinoMessage(line: string): string {
    try {
        const json = JSON.parse(line);

        if (!ingoreKeys?.[timestampKey]) {
            const timestamp = json[timestampKey];
            if (timestamp !== undefined) {
                try {
                    const date = new Date(timestamp);
                    line = `${defaultColor}${date.toLocaleDateString()} ${date.toLocaleTimeString()}${Reset} `;
                } catch {
                    line = `${defaultColor}${timestamp}${Reset} `;
                }
            } else {
                line = "";
            }
        } else {
            line = "";
        }

        let bold = false;
        let dim = false;
        switch (json[levelKey]) {
            case 10:
            case "trace":
                line += trace;
                dim = true;
                break;
            case 20:
            case "debug":
                line += debug;
                break;
            case 30:
            case "info":
                line += info;
                bold = true;
                break;
            case 40:
            case "warn":
                line += warn;
                break;
            case 50:
            case "error":
                line += error;
                bold = true;
                break;
            case 60:
            case "fatal":
                line += fatal;
                bold = true;
                break;
        }

        const msg = json[messageKey];
        if (typeof msg === "string") {
            if (bold) {
                line += `${colon}${Bold}${msg}${reset}`;
            } else if (dim) {
                line += `${colon}${Dim}${msg}`;
            } else {
                line += `${colon}${msg}`;
            }
        }

        if (firstKeys) {
            for (const key in firstKeys) {
                if (key === messageKey) continue;
                if (key === levelKey) continue;
                if (key === timestampKey) continue;
                const value = json[key];
                line += "  ";
                line += formatValue(key, value, dim);
            }
        }

        for (const key in json) {
            if (key === messageKey) continue;
            if (key === levelKey) continue;
            if (key === timestampKey) continue;
            if (ingoreKeys?.[key]) continue;
            if (firstKeys?.[key]) continue;
            if (lastKeys?.[key]) continue;
            const value = json[key];
            line += "  ";
            line += formatValue(key, value, dim);
        }

        if (lastKeys) {
            for (const key in lastKeys) {
                if (key === messageKey) continue;
                if (key === levelKey) continue;
                if (key === timestampKey) continue;
                const value = json[key];
                line += "  ";
                line += formatValue(key, value, dim);
            }
        }
    } catch (err) {
        line = `${variable}${line}`;
    }
    line += `${reset}\n`;

    return line;
}

let data = "";
let bracketOpen = 0;
let parenOpen = false;
let start = -1;

process.stdin.on("data", (buffer: Buffer) => {
    data += buffer
        .toString()
        .split("\n")
        .map((line) => line.trim())
        .join("");
    let len = data.length;
    for (let i = 0; i < len; i++) {
        if (data[i] === '"') {
            parenOpen = !parenOpen;
            continue;
        }

        if (parenOpen) continue;

        if (data[i] === "{") {
            bracketOpen++;
            if (bracketOpen === 1) {
                start = i;
            }
        } else if (data[i] === "}") {
            if (bracketOpen > 0) {
                bracketOpen--;
                if (bracketOpen === 0) {
                    const objectString = data
                        .substr(start, i - start + 1)
                        .split("\n")
                        .join("");
                    process.stdout.write(formatPinoMessage(objectString));
                    start = i + 1;
                }
            }
        }
    }

    if (start > 0) {
        data = data.substr(start);
        start = 0;
    }
});

process.once("SIGINT", () => {
    // NOOP
});
